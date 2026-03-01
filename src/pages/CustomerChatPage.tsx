import { useParams } from 'react-router-dom'
import { useChat } from '../hooks/useChat'
import { ChatWindow } from '../components/chat/ChatWindow'

export function CustomerChatPage() {
  const { businessId } = useParams<{ businessId: string }>()

  if (!businessId) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <p className="text-gray-600">Invalid chat link.</p>
      </div>
    )
  }

  return <ChatPageInner businessId={businessId} />
}

function ChatPageInner({ businessId }: { businessId: string }) {
  const { messages, loading, error, businessName, sendMessage } = useChat(businessId)

  return (
    <ChatWindow
      messages={messages}
      loading={loading}
      error={error}
      businessName={businessName}
      onSend={sendMessage}
    />
  )
}
