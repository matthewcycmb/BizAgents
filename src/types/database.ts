export type Database = {
  public: {
    Tables: {
      businesses: {
        Row: {
          id: string
          owner_id: string
          name: string
          url: string
          scrape_status: 'pending' | 'scraping' | 'completed' | 'failed'
          pages_scraped: number
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          owner_id: string
          name: string
          url: string
          scrape_status?: 'pending' | 'scraping' | 'completed' | 'failed'
          pages_scraped?: number
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          owner_id?: string
          name?: string
          url?: string
          scrape_status?: 'pending' | 'scraping' | 'completed' | 'failed'
          pages_scraped?: number
          created_at?: string
          updated_at?: string
        }
        Relationships: []
      }
      chunks: {
        Row: {
          id: string
          business_id: string
          content: string
          embedding: string
          url: string
          token_count: number
          metadata: Record<string, unknown>
          created_at: string
        }
        Insert: {
          id?: string
          business_id: string
          content: string
          embedding: string
          url: string
          token_count?: number
          metadata?: Record<string, unknown>
          created_at?: string
        }
        Update: {
          id?: string
          business_id?: string
          content?: string
          embedding?: string
          url?: string
          token_count?: number
          metadata?: Record<string, unknown>
          created_at?: string
        }
        Relationships: []
      }
      leads: {
        Row: {
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
        Insert: {
          id?: string
          business_id: string
          name: string
          email: string
          phone?: string | null
          service_type?: string | null
          budget?: string | null
          timeline?: string | null
          notes?: string | null
          status?: 'new' | 'contacted'
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          business_id?: string
          name?: string
          email?: string
          phone?: string | null
          service_type?: string | null
          budget?: string | null
          timeline?: string | null
          notes?: string | null
          status?: 'new' | 'contacted'
          created_at?: string
          updated_at?: string
        }
        Relationships: []
      }
      conversations: {
        Row: {
          id: string
          business_id: string
          owner_id: string
          title: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          business_id: string
          owner_id: string
          title: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          business_id?: string
          owner_id?: string
          title?: string
          created_at?: string
          updated_at?: string
        }
        Relationships: []
      }
      chat_messages: {
        Row: {
          id: string
          conversation_id: string
          role: string
          content: string
          created_at: string
        }
        Insert: {
          id?: string
          conversation_id: string
          role: string
          content: string
          created_at?: string
        }
        Update: {
          id?: string
          conversation_id?: string
          role?: string
          content?: string
          created_at?: string
        }
        Relationships: []
      }
    }
    Views: Record<string, never>
    Functions: {
      match_chunks: {
        Args: {
          query_embedding: string
          match_business_id: string
          match_count: number
          match_threshold: number
        }
        Returns: {
          id: string
          content: string
          url: string
          similarity: number
        }[]
      }
    }
    Enums: Record<string, never>
    CompositeTypes: Record<string, never>
  }
}
