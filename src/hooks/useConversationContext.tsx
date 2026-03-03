import { createContext, useContext, useState, useCallback, type ReactNode } from 'react'

interface ConversationContextType {
  activeConversationId: string | null
  setActiveConversationId: (id: string | null) => void
  activeBusinessId: string | null
  setActiveBusinessId: (id: string | null) => void
  newChat: (businessId?: string) => void
  chatKey: number
  refreshKey: number
  triggerRefresh: () => void
}

const ConversationContext = createContext<ConversationContextType>({
  activeConversationId: null,
  setActiveConversationId: () => {},
  activeBusinessId: null,
  setActiveBusinessId: () => {},
  newChat: () => {},
  chatKey: 0,
  refreshKey: 0,
  triggerRefresh: () => {},
})

export function ConversationProvider({ children }: { children: ReactNode }) {
  const [activeConversationId, setActiveConversationId] = useState<string | null>(null)
  const [activeBusinessId, setActiveBusinessId] = useState<string | null>(null)
  const [refreshKey, setRefreshKey] = useState(0)

  const [chatKey, setChatKey] = useState(0)

  const newChat = useCallback((businessId?: string) => {
    setActiveConversationId(null)
    setChatKey((k) => k + 1)
    if (businessId) {
      setActiveBusinessId(businessId)
    }
  }, [])

  const triggerRefresh = useCallback(() => {
    setRefreshKey((k) => k + 1)
  }, [])

  return (
    <ConversationContext.Provider value={{
      activeConversationId,
      setActiveConversationId,
      activeBusinessId,
      setActiveBusinessId,
      newChat,
      chatKey,
      refreshKey,
      triggerRefresh,
    }}>
      {children}
    </ConversationContext.Provider>
  )
}

export function useConversationContext() {
  return useContext(ConversationContext)
}
