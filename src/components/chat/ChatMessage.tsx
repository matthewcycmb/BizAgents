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
        <div className="bg-bp-bg-card border border-bp-border rounded-2xl px-5 py-3 max-w-[80%]">
          <p className="text-[15px] text-bp-text-primary whitespace-pre-wrap">{message.content}</p>
        </div>
      </div>
    )
  }

  return (
    <div className="flex justify-start items-start gap-3 border-t border-bp-border-subtle pt-6">
      <div className="flex-1 pl-3">
        <p className="text-[15px] text-bp-text-primary whitespace-pre-wrap leading-relaxed">{stripMarkdown(message.content)}</p>
      </div>
    </div>
  )
}
