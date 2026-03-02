import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import * as cheerio from 'https://esm.sh/cheerio@1.0.0-rc.12'
import { corsHeaders } from '../_shared/cors.ts'
import { createServiceClient, authenticateRequest } from '../_shared/supabase-client.ts'

interface ScrapedPage {
  url: string
  content: string
}

function normalizeUrl(base: string, href: string): string | null {
  try {
    const url = new URL(href, base)
    url.hash = ''
    url.search = ''
    return url.href
  } catch {
    return null
  }
}

function extractText(html: string): string {
  const $ = cheerio.load(html)
  // Remove non-content elements
  $('script, style, nav, header, footer, noscript, iframe, svg').remove()
  // Get text content
  const text = $('body').text()
  // Clean whitespace
  return text.replace(/\s+/g, ' ').trim()
}

function extractLinks(html: string, baseUrl: string, hostname: string): string[] {
  const $ = cheerio.load(html)
  const links: string[] = []

  $('a[href]').each((_, el) => {
    const href = $(el).attr('href')
    if (!href) return

    const normalized = normalizeUrl(baseUrl, href)
    if (!normalized) return

    try {
      const url = new URL(normalized)
      // Same hostname only
      if (url.hostname === hostname && url.protocol.startsWith('http')) {
        links.push(normalized)
      }
    } catch {
      // skip invalid URLs
    }
  })

  return [...new Set(links)]
}

async function scrapePages(startUrl: string, maxPages = 10): Promise<ScrapedPage[]> {
  const visited = new Set<string>()
  const queue: string[] = [startUrl]
  const pages: ScrapedPage[] = []
  const hostname = new URL(startUrl).hostname

  while (queue.length > 0 && pages.length < maxPages) {
    const url = queue.shift()!
    if (visited.has(url)) continue
    visited.add(url)

    try {
      const response = await fetch(url, {
        headers: { 'User-Agent': 'BizPilot Bot/1.0' },
        redirect: 'follow',
      })

      if (!response.ok) continue
      const contentType = response.headers.get('content-type') || ''
      if (!contentType.includes('text/html')) continue

      const html = await response.text()
      const content = extractText(html)

      if (content.length > 50) {
        pages.push({ url, content })
      }

      // BFS: add internal links to queue
      const links = extractLinks(html, url, hostname)
      for (const link of links) {
        if (!visited.has(link)) {
          queue.push(link)
        }
      }
    } catch {
      // Skip failed pages
    }
  }

  return pages
}

// --- Chunking ---

function chunkText(text: string, maxChars = 2000, overlapChars = 200): string[] {
  if (text.length <= maxChars) return [text]

  const chunks: string[] = []
  let start = 0

  while (start < text.length) {
    let end = Math.min(start + maxChars, text.length)

    // Try to break at sentence boundary
    if (end < text.length) {
      const slice = text.slice(start, end)
      const lastPeriod = slice.lastIndexOf('. ')
      const lastNewline = slice.lastIndexOf('\n')
      const breakPoint = Math.max(lastPeriod, lastNewline)
      if (breakPoint > maxChars * 0.5) {
        end = start + breakPoint + 1
      }
    }

    chunks.push(text.slice(start, end).trim())
    start = end - overlapChars
    if (start < 0) start = 0
    if (end >= text.length) break
  }

  return chunks.filter((c) => c.length > 20)
}

// --- Embedding ---

async function embedTexts(texts: string[], apiKey: string): Promise<number[][]> {
  const batchSize = 20
  const allEmbeddings: number[][] = []

  for (let i = 0; i < texts.length; i += batchSize) {
    const batch = texts.slice(i, i + batchSize)
    const response = await fetch('https://api.openai.com/v1/embeddings', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'text-embedding-3-small',
        input: batch,
      }),
    })

    if (!response.ok) {
      const error = await response.text()
      throw new Error(`OpenAI API error: ${error}`)
    }

    const data = await response.json()
    for (const item of data.data) {
      allEmbeddings.push(item.embedding)
    }
  }

  return allEmbeddings
}

function isPrivateUrl(urlString: string): boolean {
  try {
    const parsed = new URL(urlString)
    const hostname = parsed.hostname.toLowerCase()

    if (hostname === 'localhost' || hostname === '127.0.0.1' || hostname === '::1') return true

    // Check for private IP ranges
    const parts = hostname.split('.').map(Number)
    if (parts.length === 4 && parts.every((p) => !isNaN(p))) {
      if (parts[0] === 10) return true
      if (parts[0] === 172 && parts[1] >= 16 && parts[1] <= 31) return true
      if (parts[0] === 192 && parts[1] === 168) return true
      if (parts[0] === 169 && parts[1] === 254) return true
      if (parts[0] === 127) return true
      if (parts[0] === 0) return true
    }

    return false
  } catch {
    return true
  }
}

serve(async (req) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const { business_id, url } = await req.json()

    if (!business_id || !url) {
      return new Response(
        JSON.stringify({ error: 'business_id and url are required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Validate URL is not a private/internal address (SSRF protection)
    if (isPrivateUrl(url)) {
      return new Response(
        JSON.stringify({ error: 'Invalid URL: private or internal addresses are not allowed' }),
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
    if (!openaiKey) {
      throw new Error('OPENAI_API_KEY not configured')
    }

    // Verify business ownership before proceeding
    const { data: business, error: bizError } = await supabase
      .from('businesses')
      .select('id')
      .eq('id', business_id)
      .eq('owner_id', user.id)
      .single()

    if (bizError || !business) {
      return new Response(
        JSON.stringify({ error: 'Business not found' }),
        { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Update status to scraping
    await supabase
      .from('businesses')
      .update({ scrape_status: 'scraping' })
      .eq('id', business_id)

    // Scrape pages
    const pages = await scrapePages(url)

    if (pages.length === 0) {
      await supabase
        .from('businesses')
        .update({ scrape_status: 'failed', pages_scraped: 0 })
        .eq('id', business_id)

      return new Response(
        JSON.stringify({ error: 'No content found on website' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Chunk all pages
    const allChunks: { content: string; url: string }[] = []
    for (const page of pages) {
      const chunks = chunkText(page.content)
      for (const chunk of chunks) {
        allChunks.push({ content: chunk, url: page.url })
      }
    }

    // Embed all chunks
    const texts = allChunks.map((c) => c.content)
    const embeddings = await embedTexts(texts, openaiKey)

    // Insert chunks into database
    const chunkRows = allChunks.map((chunk, i) => ({
      business_id,
      content: chunk.content,
      embedding: JSON.stringify(embeddings[i]),
      url: chunk.url,
      token_count: Math.ceil(chunk.content.length / 4),
      metadata: {},
    }))

    // Delete existing chunks for this business (re-scrape)
    await supabase.from('chunks').delete().eq('business_id', business_id)

    // Insert in batches
    const insertBatchSize = 50
    for (let i = 0; i < chunkRows.length; i += insertBatchSize) {
      const batch = chunkRows.slice(i, i + insertBatchSize)
      const { error } = await supabase.from('chunks').insert(batch)
      if (error) throw error
    }

    // Update business status
    await supabase
      .from('businesses')
      .update({
        scrape_status: 'completed',
        pages_scraped: pages.length,
        updated_at: new Date().toISOString(),
      })
      .eq('id', business_id)

    return new Response(
      JSON.stringify({
        success: true,
        pages_scraped: pages.length,
        chunks_created: allChunks.length,
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  } catch (error) {
    // Try to update status to failed
    try {
      const { business_id } = await req.clone().json()
      if (business_id) {
        const supabase = createServiceClient()
        await supabase
          .from('businesses')
          .update({ scrape_status: 'failed' })
          .eq('id', business_id)
      }
    } catch {
      // ignore cleanup errors
    }

    console.error('Scrape function error:', error)
    return new Response(
      JSON.stringify({ error: 'An internal error occurred' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }
})
