export interface Business {
  id: string
  owner_id: string
  name: string
  url: string
  scrape_status: 'pending' | 'scraping' | 'completed' | 'failed'
  pages_scraped: number
  created_at: string
  updated_at: string
}

export interface Chunk {
  id: string
  business_id: string
  content: string
  url: string
  token_count: number
  metadata: Record<string, unknown>
  created_at: string
}

export interface Lead {
  id: string
  business_id: string
  name: string
  email: string
  phone: string | null
  service_type: string | null
  budget: string | null
  timeline: string | null
  notes: string | null
  status: 'new' | 'contacted'
  created_at: string
  updated_at: string
}

export interface ChatMessage {
  role: 'user' | 'assistant'
  content: string
}
