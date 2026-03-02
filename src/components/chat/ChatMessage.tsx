import type { ChatMessage as ChatMessageType } from '../../types'

function stripMarkdown(text: string): string {
  return text
    .replace(/^#{1,6}\s+/gm, '')       // ## headings
    .replace(/\*\*(.+?)\*\*/g, '$1')   // **bold**
    .replace(/\*(.+?)\*/g, '$1')       // *italic*
    .replace(/`(.+?)`/g, '$1')         // `code`
    .replace(/```[\s\S]*?```/g, '')    // code blocks
}

interface ChatMessageProps {
  message: ChatMessageType
  businessName?: string
}

export function ChatMessage({ message }: ChatMessageProps) {
  const isUser = message.role === 'user'

  if (isUser) {
    return (
      <div className="flex justify-end">
        <div className="bg-gray-900 text-white rounded-2xl px-5 py-3 max-w-[80%]">
          <p className="text-base whitespace-pre-wrap">{message.content}</p>
        </div>
      </div>
    )
  }

  return (
    <div className="flex justify-start items-start gap-3 border-t border-gray-100 pt-6">
      <div className="flex-1 pl-3">
        <p className="text-base text-gray-900 whitespace-pre-wrap leading-relaxed">{stripMarkdown(message.content)}</p>
      </div>
    </div>
  )
}
