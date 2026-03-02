import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { corsHeaders } from '../_shared/cors.ts'
import { createServiceClient } from '../_shared/supabase-client.ts'

interface ChatMessage {
  role: 'user' | 'assistant'
  content: string
}

// --- RAG Retrieval ---

async function embedQuery(text: string, apiKey: string): Promise<number[]> {
  const response = await fetch('https://api.openai.com/v1/embeddings', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: 'text-embedding-3-small',
      input: text,
    }),
  })

  if (!response.ok) {
    throw new Error(`OpenAI embedding error: ${await response.text()}`)
  }

  const data = await response.json()
  return data.data[0].embedding
}

async function retrieveContext(
  supabase: ReturnType<typeof createServiceClient>,
  businessId: string,
  queryEmbedding: number[]
): Promise<{ content: string; url: string; similarity: number }[]> {
  const { data, error } = await supabase.rpc('match_chunks', {
    query_embedding: JSON.stringify(queryEmbedding),
    match_business_id: businessId,
    match_count: 5,
    match_threshold: 0.5,
  })

  if (error) throw error
  return data || []
}

// --- Claude API call ---

async function callClaude(
  systemPrompt: string,
  messages: ChatMessage[],
  anthropicKey: string
): Promise<string> {
  const claudeMessages = messages.map((m) => ({
    role: m.role,
    content: m.content,
  }))

  const response = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: {
      'x-api-key': anthropicKey,
      'anthropic-version': '2023-06-01',
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 1024,
      system: systemPrompt,
      messages: claudeMessages,
    }),
  })

  if (!response.ok) {
    throw new Error(`Claude API error: ${await response.text()}`)
  }

  const data = await response.json()
  const textBlock = data.content.find((b: { type: string }) => b.type === 'text')
  return textBlock?.text || ''
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const { business_id, messages } = await req.json() as {
      business_id: string
      messages: ChatMessage[]
    }

    if (!business_id || !messages?.length) {
      return new Response(
        JSON.stringify({ error: 'business_id and messages are required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    const supabase = createServiceClient()
    const openaiKey = Deno.env.get('OPENAI_API_KEY')
    const anthropicKey = Deno.env.get('ANTHROPIC_API_KEY')

    if (!openaiKey || !anthropicKey) {
      throw new Error('API keys not configured')
    }

    // Fetch business info
    const { data: business, error: bizError } = await supabase
      .from('businesses')
      .select('name, url')
      .eq('id', business_id)
      .single()

    if (bizError || !business) {
      return new Response(
        JSON.stringify({ error: 'Business not found' }),
        { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Sliding window: keep last 20 messages
    const recentMessages = messages.slice(-20)
    const latestUserMessage = recentMessages.filter((m) => m.role === 'user').pop()

    if (!latestUserMessage) {
      return new Response(
        JSON.stringify({ error: 'No user message found' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // RAG: embed query and retrieve context
    const queryEmbedding = await embedQuery(latestUserMessage.content, openaiKey)
    const chunks = await retrieveContext(supabase, business_id, queryEmbedding)

    const contextText = chunks.length > 0
      ? chunks.map((c, i) => `[Source ${i + 1}] ${c.content}`).join('\n\n')
      : 'No relevant information found in the business knowledge base.'

    // Build system prompt — owner-facing business copilot
    const systemPrompt = `You are BizPilot, an AI business copilot for ${business.name} (${business.url}).

You are speaking directly to the business owner. Your job is to help them understand, analyze, and leverage their own business information. You have full context from their website content below.

You can help the owner with:
- Answering questions about their own website content and what it communicates to customers
- Suggesting improvements to their messaging, services, or offerings
- Drafting marketing copy, social media posts, or email templates based on their business
- Analyzing their service offerings and pricing strategy
- Brainstorming ideas for new services, promotions, or business growth
- Preparing responses to common customer questions
- Identifying gaps in their website content

Be direct, insightful, and actionable. You are a strategic business partner, not just an information retriever. When the context provides relevant information, reference it specifically. When asked about something not in the context, say so clearly but still try to provide useful general business advice.

--- BUSINESS WEBSITE CONTENT ---
${contextText}
--- END CONTENT ---`

    // Call Claude
    const message = await callClaude(systemPrompt, recentMessages, anthropicKey)

    return new Response(
      JSON.stringify({
        message,
        business_name: business.name,
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  } catch (error) {
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }
})
