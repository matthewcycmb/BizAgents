import { useState, useCallback } from 'react'
import { supabase } from '../lib/supabase'
import type { ChatMessage } from '../types'

export function useChat(businessId: string) {
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [businessName, setBusinessName] = useState<string>('')

  const sendMessage = useCallback(async (content: string) => {
    const userMessage: ChatMessage = { role: 'user', content }
    setMessages((prev) => [...prev, userMessage])
    setLoading(true)
    setError(null)

    try {
      const allMessages = [...messages, userMessage]
      // Sliding window: last 20 messages
      const recentMessages = allMessages.slice(-20)

      const { data, error: fnError } = await supabase.functions.invoke('chat', {
        body: { business_id: businessId, messages: recentMessages },
      })

      if (fnError) throw fnError

      if (data?.business_name) {
        setBusinessName(data.business_name)
      }

      const assistantMessage: ChatMessage = {
        role: 'assistant',
        content: data.message,
      }
      setMessages((prev) => [...prev, assistantMessage])
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to send message')
    } finally {
      setLoading(false)
    }
  }, [businessId, messages])

  return { messages, loading, error, businessName, sendMessage }
}
