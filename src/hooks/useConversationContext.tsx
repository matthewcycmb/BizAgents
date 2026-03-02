import { createContext, useContext, useState, useCallback, type ReactNode } from 'react'

interface ConversationContextType {
  activeConversationId: string | null
  setActiveConversationId: (id: string | null) => void
  newChat: () => void
  refreshKey: number
  triggerRefresh: () => void
}

const ConversationContext = createContext<ConversationContextType>({
  activeConversationId: null,
  setActiveConversationId: () => {},
  newChat: () => {},
  refreshKey: 0,
  triggerRefresh: () => {},
})

export function ConversationProvider({ children }: { children: ReactNode }) {
  const [activeConversationId, setActiveConversationId] = useState<string | null>(null)
  const [refreshKey, setRefreshKey] = useState(0)

  const newChat = useCallback(() => {
    setActiveConversationId(null)
  }, [])

  const triggerRefresh = useCallback(() => {
    setRefreshKey((k) => k + 1)
  }, [])

  return (
    <ConversationContext.Provider value={{
      activeConversationId,
      setActiveConversationId,
      newChat,
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
