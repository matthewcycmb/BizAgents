import Markdown from 'react-markdown'
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
        <div className="bg-bp-bg-card border border-bp-border rounded-2xl px-5 py-3 max-w-[80%]">
          <p className="text-[15px] text-bp-text-primary whitespace-pre-wrap">{message.content}</p>
        </div>
      </div>
    )
  }

  return (
    <div className="flex justify-start items-start gap-3 border-t border-bp-border-subtle pt-6">
      <div className="flex-1 pl-3 text-[15px] text-bp-text-primary leading-relaxed prose prose-invert prose-sm max-w-none prose-headings:text-bp-text-primary prose-headings:text-base prose-headings:font-semibold prose-headings:mt-3 prose-headings:mb-1 prose-p:my-1.5 prose-ul:my-1.5 prose-ol:my-1.5 prose-li:my-0.5 prose-strong:text-bp-text-primary prose-a:text-bp-rose">
        <Markdown>{message.content}</Markdown>
      </div>
    </div>
  )
}
