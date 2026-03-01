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

// --- Lead capture tool definition ---

const captureLeadTool = {
  name: 'capture_lead',
  description:
    'Capture lead information when a customer expresses buying intent, wants to schedule a service, requests a quote, or provides contact details. Call this tool when you have gathered at least a name and email from the customer.',
  input_schema: {
    type: 'object' as const,
    properties: {
      name: { type: 'string', description: "Customer's full name" },
      email: { type: 'string', description: "Customer's email address" },
      phone: { type: 'string', description: "Customer's phone number (optional)" },
      service_type: { type: 'string', description: 'Type of service the customer is interested in' },
      budget: { type: 'string', description: "Customer's budget or price range (optional)" },
      timeline: { type: 'string', description: 'When the customer needs the service (optional)' },
      notes: { type: 'string', description: 'Additional context from the conversation' },
    },
    required: ['name', 'email'],
  },
}

// --- Claude API call ---

async function callClaude(
  systemPrompt: string,
  messages: ChatMessage[],
  anthropicKey: string
): Promise<{ message: string; toolUse?: { name: string; id: string; input: Record<string, string> } }> {
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
      tools: [captureLeadTool],
    }),
  })

  if (!response.ok) {
    throw new Error(`Claude API error: ${await response.text()}`)
  }

  const data = await response.json()

  // Check for tool use
  const toolBlock = data.content.find((b: { type: string }) => b.type === 'tool_use')
  const textBlock = data.content.find((b: { type: string }) => b.type === 'text')

  if (toolBlock) {
    return {
      message: textBlock?.text || '',
      toolUse: {
        name: toolBlock.name,
        id: toolBlock.id,
        input: toolBlock.input,
      },
    }
  }

  return { message: textBlock?.text || '' }
}

async function callClaudeWithToolResult(
  systemPrompt: string,
  messages: ChatMessage[],
  toolUseId: string,
  toolResult: string,
  anthropicKey: string
): Promise<string> {
  const claudeMessages = [
    ...messages.map((m) => ({ role: m.role, content: m.content })),
    {
      role: 'assistant' as const,
      content: [
        {
          type: 'tool_use' as const,
          id: toolUseId,
          name: 'capture_lead',
          input: {},
        },
      ],
    },
    {
      role: 'user' as const,
      content: [
        {
          type: 'tool_result' as const,
          tool_use_id: toolUseId,
          content: toolResult,
        },
      ],
    },
  ]

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
      tools: [captureLeadTool],
    }),
  })

  if (!response.ok) {
    throw new Error(`Claude API error: ${await response.text()}`)
  }

  const data = await response.json()
  const textBlock = data.content.find((b: { type: string }) => b.type === 'text')
  return textBlock?.text || "Thanks! We've noted your information and someone will follow up soon."
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

    // Build system prompt
    const systemPrompt = `You are a helpful customer service assistant for ${business.name} (${business.url}).

Your job is to answer customer questions about this business using ONLY the following context from their website. If the answer is not in the context, say you don't have that specific information and suggest the customer contact the business directly.

Be friendly, professional, and concise. Do not make up information that isn't in the context.

If the customer expresses buying intent (wants to book a service, get a quote, schedule an appointment, or make a purchase), conversationally gather their name and email at minimum, then use the capture_lead tool to save their information. Don't ask for all fields at once — be natural and conversational.

--- BUSINESS CONTEXT ---
${contextText}
--- END CONTEXT ---`

    // Call Claude
    const result = await callClaude(systemPrompt, recentMessages, anthropicKey)

    let finalMessage = result.message
    let leadCaptured = false

    // Handle tool use (lead capture)
    if (result.toolUse?.name === 'capture_lead') {
      const input = result.toolUse.input

      // Check for existing lead with same email
      const { data: existingLead } = await supabase
        .from('leads')
        .select('id')
        .eq('business_id', business_id)
        .eq('email', input.email)
        .single()

      if (existingLead) {
        // Update existing lead's notes
        await supabase
          .from('leads')
          .update({
            notes: input.notes || null,
            service_type: input.service_type || null,
            budget: input.budget || null,
            timeline: input.timeline || null,
            updated_at: new Date().toISOString(),
          })
          .eq('id', existingLead.id)
      } else {
        // Insert new lead
        await supabase.from('leads').insert({
          business_id,
          name: input.name,
          email: input.email,
          phone: input.phone || null,
          service_type: input.service_type || null,
          budget: input.budget || null,
          timeline: input.timeline || null,
          notes: input.notes || null,
        })
      }

      leadCaptured = true

      // Get follow-up response from Claude
      finalMessage = await callClaudeWithToolResult(
        systemPrompt,
        recentMessages,
        result.toolUse.id,
        `Lead successfully captured for ${input.name} (${input.email}). The business owner will follow up soon.`,
        anthropicKey
      )
    }

    return new Response(
      JSON.stringify({
        message: finalMessage,
        leadCaptured,
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
