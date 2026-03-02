import { useEffect, useState, useCallback } from 'react'
import { supabase } from '../lib/supabase'
import type { Conversation } from '../types'

export function useConversations(businessId: string | null) {
  const [conversations, setConversations] = useState<Conversation[]>([])
  const [loading, setLoading] = useState(true)

  const fetchConversations = useCallback(async () => {
    if (!businessId) {
      setConversations([])
      setLoading(false)
      return
    }

    const { data, error } = await supabase
      .from('conversations')
      .select('*')
      .eq('business_id', businessId)
      .order('updated_at', { ascending: false })

    if (error) {
      console.error('Failed to load conversations:', error)
    } else {
      setConversations(data as Conversation[])
    }
    setLoading(false)
  }, [businessId])

  useEffect(() => {
    fetchConversations()
  }, [fetchConversations])

  const deleteConversation = useCallback(async (id: string) => {
    const { error } = await supabase
      .from('conversations')
      .delete()
      .eq('id', id)

    if (!error) {
      setConversations((prev) => prev.filter((c) => c.id !== id))
    }
  }, [])

  return { conversations, loading, fetchConversations, deleteConversation }
}
