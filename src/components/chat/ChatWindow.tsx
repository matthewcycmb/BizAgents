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
  },
  {
    title: 'Help me write marketing copy',
    description: 'Draft emails, posts, or ad copy',
    prompt: 'Help me draft marketing content for social media',
  },
  {
    title: 'Suggest growth strategies',
    description: 'Ideas to attract more customers',
    prompt: 'Give me strategic insights to grow my business',
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
    <div className="flex flex-col min-h-[calc(100vh-4rem)] px-4 py-8">
      {!hasMessages ? (
        /* Welcome State */
        <div className="flex-1 flex flex-col items-center justify-center max-w-2xl mx-auto w-full pt-32">
          {/* Greeting */}
          <h1 className="text-3xl font-light tracking-tight text-gray-900 mb-2">
            {getGreeting()}, {userName.split('@')[0]}
          </h1>
          <p className="text-lg text-gray-400 font-light mb-12">
            What would you like to know about your business?
          </p>

          {/* Chat Input */}
          <div className="w-full max-w-xl mx-auto mb-8">
            <ChatInput onSend={onSend} disabled={loading} placeholder="Ask anything..." />
          </div>

          {/* Suggestion Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3 w-full max-w-3xl">
            {suggestionCards.map((card, idx) => (
              <button
                key={idx}
                onClick={() => onSend(card.prompt)}
                className="bg-white border border-gray-200 rounded-lg p-5 text-left hover:bg-gray-50 transition-colors"
              >
                <h3 className="text-sm font-medium text-gray-900 mb-1">
                  {card.title}
                </h3>
                <p className="text-xs text-gray-500 font-light">{card.description}</p>
              </button>
            ))}
          </div>
        </div>
      ) : (
        /* Conversation State */
        <>
          <div className="flex-1 max-w-2xl mx-auto w-full space-y-6 pb-32">
            {messages.map((msg, i) => (
              <ChatMessage key={i} message={msg} businessName={businessName} />
            ))}
            {loading && (
              <div className="flex justify-start">
                <div className="flex items-center gap-1 px-4 py-3">
                  <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                  <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                  <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                </div>
              </div>
            )}
            {error && (
              <div className="text-center">
                <p className="text-sm text-red-600">{error}</p>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Fixed Input at Bottom */}
          <div className="fixed bottom-0 left-0 right-0 lg:left-72 bg-white border-t border-gray-100 py-6">
            <div className="max-w-2xl mx-auto px-4">
              <ChatInput onSend={onSend} disabled={loading} placeholder="Ask anything..." />
            </div>
          </div>
        </>
      )}
    </div>
  )
}
