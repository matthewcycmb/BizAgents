import { useEffect, useRef } from 'react'
import type { ChatMessage as ChatMessageType } from '../../types'
import { ChatMessage } from './ChatMessage'
import { ChatInput } from './ChatInput'

interface ChatWindowProps {
  messages: ChatMessageType[]
  loading: boolean
  error: string | null
  businessName: string
  userName: string
  onSend: (message: string) => void
}

const suggestionCards = [
  {
    title: 'Analyze my website content',
    description: 'Get insights on what your site communicates',
    prompt: 'Analyze my website and identify areas for improvement',
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" className="w-4 h-4">
        <circle cx="11" cy="11" r="8" /><path d="M21 21l-4.35-4.35" /><path d="M11 8v6M8 11h6" />
      </svg>
    ),
  },
  {
    title: 'Help me write marketing copy',
    description: 'Draft emails, posts, or ad copy',
    prompt: 'Help me draft marketing content for social media',
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" className="w-4 h-4">
        <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" /><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
      </svg>
    ),
  },
  {
    title: 'Suggest growth strategies',
    description: 'Ideas to attract more customers',
    prompt: 'Give me strategic insights to grow my business',
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" className="w-4 h-4">
        <path d="M23 6l-9.5 9.5-5-5L1 18" /><polyline points="17 6 23 6 23 12" />
      </svg>
    ),
  },
]

export function ChatWindow({ messages, loading, error, businessName, userName, onSend }: ChatWindowProps) {
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const hasMessages = messages.length > 0

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, loading])

  const getGreeting = () => {
    const hour = new Date().getHours()
    if (hour < 12) return 'Good morning'
    if (hour < 18) return 'Good afternoon'
    return 'Good evening'
  }

  return (
    <div className="flex flex-col h-full">
      {!hasMessages ? (
        /* Welcome State */
        <div className="flex-1 flex flex-col items-center justify-center px-12 pt-[40px]">
          {/* Greeting */}
          <div className="text-center mb-2 animate-fade-up-1">
            <h1 className="font-display text-[30px] font-bold text-bp-text-primary leading-tight" style={{ textShadow: '0 2px 12px rgba(0,0,0,0.5)' }}>
              {getGreeting()}, {userName.split('@')[0]}
            </h1>
            <p className="text-base text-bp-text-secondary mt-2 mb-8" style={{ textShadow: '0 1px 6px rgba(0,0,0,0.4)' }}>
              What would you like to know about your business?
            </p>
          </div>

          {/* Chat Input */}
          <div className="w-full max-w-[700px] mb-10 animate-fade-up-2">
            <ChatInput onSend={onSend} disabled={loading} placeholder="Ask anything..." />
          </div>

          {/* Suggestion Cards */}
          <div className="flex gap-4 w-full max-w-[820px] animate-fade-up-3">
            {suggestionCards.map((card, idx) => (
              <button
                key={idx}
                onClick={() => onSend(card.prompt)}
                className="glass-card group flex-1 relative rounded-[16px] p-6 text-left cursor-pointer transition-all duration-200 hover:-translate-y-1 overflow-hidden"
              >
                {/* Top accent line on hover */}
                <div className="absolute top-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-bp-accent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

                <div className="w-10 h-10 rounded-xl bg-bp-accent/[0.12] flex items-center justify-center text-bp-accent-light mb-4">
                  {card.icon}
                </div>
                <div className="text-[15px] font-bold text-bp-text-primary mb-2 leading-tight">
                  {card.title}
                </div>
                <div className="text-sm text-bp-text-secondary leading-relaxed">
                  {card.description}
                </div>
              </button>
            ))}
          </div>
        </div>
      ) : (
        /* Conversation State */
        <>
          <div className="flex-1 overflow-y-auto px-6 py-8">
            <div className="max-w-2xl mx-auto space-y-6 pb-32">
              {messages.map((msg, i) => (
                <ChatMessage key={i} message={msg} businessName={businessName} />
              ))}
              {loading && (
                <div className="flex justify-start">
                  <div className="flex items-center gap-1 px-4 py-3">
                    <span className="w-2 h-2 bg-bp-text-muted rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                    <span className="w-2 h-2 bg-bp-text-muted rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                    <span className="w-2 h-2 bg-bp-text-muted rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                  </div>
                </div>
              )}
              {error && (
                <div className="text-center">
                  <p className="text-sm text-bp-accent">{error}</p>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>
          </div>

          {/* Fixed Input at Bottom */}
          <div className="border-t border-bp-border-subtle bg-bp-bg-main/80 backdrop-blur-xl py-4 px-6">
            <div className="max-w-2xl mx-auto">
              <ChatInput onSend={onSend} disabled={loading} placeholder="Ask anything..." />
            </div>
          </div>
        </>
      )}
    </div>
  )
}
