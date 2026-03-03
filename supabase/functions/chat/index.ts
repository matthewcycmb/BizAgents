import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { corsHeaders } from '../_shared/cors.ts'
import { createServiceClient, authenticateRequest } from '../_shared/supabase-client.ts'

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
  // Try vector similarity search first
  try {
    const { data, error } = await supabase.rpc('match_chunks', {
      query_embedding: JSON.stringify(queryEmbedding),
      match_business_id: businessId,
      match_count: 5,
      match_threshold: 0.2,
    })

    if (!error && data && data.length > 0) {
      return data
    }

    if (error) {
      console.error('match_chunks RPC error:', JSON.stringify(error))
    }
  } catch (err) {
    console.error('match_chunks threw:', err)
  }

  // Fallback: fetch chunks directly without vector search
  // This ensures the chatbot always has context if chunks exist
  const { data: fallbackData, error: fallbackError } = await supabase
    .from('chunks')
    .select('id, content, url')
    .eq('business_id', businessId)
    .order('created_at', { ascending: true })
    .limit(5)

  if (fallbackError) {
    console.error('Fallback chunk fetch error:', JSON.stringify(fallbackError))
    return []
  }

  return (fallbackData || []).map((chunk) => ({
    ...chunk,
    similarity: 0,
  }))
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
      max_tokens: 512,
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

    // Authenticate the request
    const { user, error: authError } = await authenticateRequest(req, supabase)
    if (authError || !user) {
      return new Response(
        JSON.stringify({ error: 'Unauthorized' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    const openaiKey = Deno.env.get('OPENAI_API_KEY')
    const anthropicKey = Deno.env.get('ANTHROPIC_API_KEY')

    if (!openaiKey || !anthropicKey) {
      throw new Error('API keys not configured')
    }

    // Fetch business info — also verifies ownership
    const { data: business, error: bizError } = await supabase
      .from('businesses')
      .select('name, url')
      .eq('id', business_id)
      .eq('owner_id', user.id)
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

    // Check if any chunks exist for this business
    const { count: chunkCount } = await supabase
      .from('chunks')
      .select('id', { count: 'exact', head: true })
      .eq('business_id', business_id)

    console.log(`Business ${business_id}: ${chunkCount ?? 0} chunks in database`)

    let contextText: string

    if (!chunkCount || chunkCount === 0) {
      // No chunks at all — scraping may have failed or not completed
      contextText = 'No website content has been analyzed yet. The business website has not been scraped or produced no extractable content. Help the owner with general business advice and suggest they re-analyze their website from the My Business page.'
    } else {
      // RAG: embed query and retrieve context
      const queryEmbedding = await embedQuery(latestUserMessage.content, openaiKey)
      const chunks = await retrieveContext(supabase, business_id, queryEmbedding)

      contextText = chunks.length > 0
        ? chunks.map((c, i) => `[Source ${i + 1}] ${c.content}`).join('\n\n')
        : 'Website has been scraped but no relevant chunks matched this query. There are ' + chunkCount + ' chunks stored. Provide general advice based on what you know about the business.'
    }

    // Build system prompt — owner-facing business copilot
    const systemPrompt = `You are BizPilot, an AI business copilot for ${business.name} (${business.url}).
You talk to the business owner like a sharp, helpful partner — not a consultant writing a report.

STRICT FORMAT — follow this every time:

1. **One short opening line** acknowledging what they asked.

2. **Max 3 findings.** Each one follows this pattern:
   - A **bold label** on its own line (e.g. **About Page Is Empty**)
   - 1-2 sentences explaining the issue
   - → A concrete offer starting with "→ " (e.g. "→ I can draft a compelling About section for you — want me to?")

3. **End with a "Pick one" CTA**, like:
   "Which of these should I tackle first?"

HARD RULES:
- NEVER exceed 3 findings per response. If there's more to say, tell them "There's more I spotted — want me to keep going?" at the end.
- Each finding must be SHORT: the label + 1-2 sentences + the offer. That's it.
- Every finding MUST include a "→" offer line where you propose doing something specific (drafting copy, rewriting a section, creating a template, etc).
- Use markdown: **bold** for labels, → for action offers, line breaks between findings.
- Never write paragraphs longer than 2 sentences.

THINGS YOU CAN OFFER TO DO:
- Write/rewrite website copy (About pages, service descriptions, CTAs)
- Draft social media posts, email campaigns, taglines
- Create pricing recommendations with specific numbers
- Write customer FAQ responses or review reply templates
- Build content outlines for blogs or landing pages

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
    console.error('Chat function error:', error)
    return new Response(
      JSON.stringify({ error: 'An internal error occurred' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }
})
