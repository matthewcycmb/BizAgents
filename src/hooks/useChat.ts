import { useState, useCallback, useEffect } from 'react'
import { supabase } from '../lib/supabase'
import type { ChatMessage, Conversation } from '../types'

export function useChat(businessId: string, conversationId?: string | null) {
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [businessName, setBusinessName] = useState<string>('')
  const [suggestions, setSuggestions] = useState<string[]>([])
  const [currentConversationId, setCurrentConversationId] = useState<string | null>(conversationId ?? null)
  const [initialLoading, setInitialLoading] = useState(!!conversationId)

  // Load messages when conversationId changes
  useEffect(() => {
    if (!conversationId) {
      setMessages([])
      setCurrentConversationId(null)
      setInitialLoading(false)
      return
    }

    setCurrentConversationId(conversationId)
    setInitialLoading(true)

    supabase
      .from('chat_messages')
      .select('role, content')
      .eq('conversation_id', conversationId)
      .order('created_at', { ascending: true })
      .then(({ data, error: loadError }) => {
        if (loadError) {
          console.error('Failed to load messages:', loadError)
        } else if (data) {
          setMessages(data as ChatMessage[])
        }
        setInitialLoading(false)
      })
  }, [conversationId])

  const sendMessage = useCallback(async (content: string) => {
    const userMessage: ChatMessage = { role: 'user', content }
    setMessages((prev) => [...prev, userMessage])
    setLoading(true)
    setError(null)
    setSuggestions([])

    try {
      // Create conversation on first message if none exists
      let convId = currentConversationId
      if (!convId) {
        const { data: { user } } = await supabase.auth.getUser()
        if (!user) throw new Error('Not authenticated')

        const { data: conv, error: convError } = await supabase
          .from('conversations')
          .insert({
            business_id: businessId,
            owner_id: user.id,
            title: content.slice(0, 80),
          })
          .select()
          .single()

        if (convError) throw convError
        convId = (conv as Conversation).id
        setCurrentConversationId(convId)
      }

      // Save user message to DB
      await supabase.from('chat_messages').insert({
        conversation_id: convId,
        role: 'user',
        content,
      })

      const allMessages = [...messages, userMessage]
      const recentMessages = allMessages.slice(-20)

      const { data, error: fnError } = await supabase.functions.invoke('chat', {
        body: { business_id: businessId, messages: recentMessages },
      })

      if (fnError) throw new Error(fnError.message || 'Chat request failed')

      if (data?.business_name) {
        setBusinessName(data.business_name)
      }

      if (data?.suggestions) {
        setSuggestions(data.suggestions)
      }

      const assistantMessage: ChatMessage = {
        role: 'assistant',
        content: data.message,
      }
      setMessages((prev) => [...prev, assistantMessage])

      // Save assistant message to DB
      await supabase.from('chat_messages').insert({
        conversation_id: convId,
        role: 'assistant',
        content: data.message,
      })

      // Update conversation title and timestamp
      await supabase
        .from('conversations')
        .update({ updated_at: new Date().toISOString() })
        .eq('id', convId)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to send message')
    } finally {
      setLoading(false)
    }
  }, [businessId, messages, currentConversationId])

  return {
    messages,
    loading: loading || initialLoading,
    error,
    businessName,
    suggestions,
    sendMessage,
    conversationId: currentConversationId,
  }
}
