import type { ChatMessage as ChatMessageType } from '../../types'

interface ChatMessageProps {
  message: ChatMessageType
  businessName?: string
}

export function ChatMessage({ message }: ChatMessageProps) {
  const isUser = message.role === 'user'

  if (isUser) {
    return (
      <div className="flex justify-end">
        <div className="bg-indigo-600 text-white rounded-2xl px-5 py-3 max-w-[80%]">
          <p className="text-base whitespace-pre-wrap">{message.content}</p>
        </div>
      </div>
    )
  }

  return (
    <div className="flex justify-start items-start gap-3">
      <div className="w-8 h-8 rounded-full bg-indigo-100 flex items-center justify-center flex-shrink-0 mt-1">
        <span className="text-sm">🤖</span>
      </div>
      <div className="bg-white border border-gray-200 rounded-2xl px-5 py-3 max-w-[80%]">
        <p className="text-base text-gray-900 whitespace-pre-wrap">{message.content}</p>
      </div>
    </div>
  )
}
