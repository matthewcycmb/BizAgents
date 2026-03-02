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
    title: 'Analyze Website',
    description: 'Review your site content and identify improvement areas',
    icon: '🔍',
    prompt: 'Analyze my website and identify areas for improvement',
  },
  {
    title: 'Draft Marketing',
    description: 'Generate social media posts or email campaigns',
    icon: '✍️',
    prompt: 'Help me draft marketing content for social media',
  },
  {
    title: 'Business Strategy',
    description: 'Get insights and ideas to grow your business',
    icon: '💡',
    prompt: 'Give me strategic insights to grow my business',
  },
]

export function ChatWindow({ messages, loading, error, businessName, userName, onSend }: ChatWindowProps) {
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const hasMessages = messages.length > 0

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, loading])

  return (
    <div className="flex flex-col min-h-[calc(100vh-4rem)] px-4 py-8">
      {!hasMessages ? (
        /* Welcome State */
        <div className="flex-1 flex flex-col items-center justify-center max-w-3xl mx-auto w-full">
          {/* Gradient Orb */}
          <div
            className="w-24 h-24 rounded-full mb-8"
            style={{
              background: 'radial-gradient(circle, rgba(129, 140, 248, 0.8) 0%, rgba(147, 51, 234, 0.6) 50%, rgba(99, 102, 241, 0.4) 100%)',
              filter: 'blur(40px)',
              opacity: 0.6,
            }}
          />

          {/* Greeting */}
          <h2 className="text-2xl text-indigo-600 mb-2">Hello, {userName}</h2>
          <h1 className="text-4xl font-bold text-gray-900 mb-12 text-center">
            How can I assist you today?
          </h1>

          {/* Chat Input */}
          <div className="w-full mb-8">
            <ChatInput onSend={onSend} disabled={loading} placeholder="Ask me anything about your business..." />
          </div>

          {/* Suggestion Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 w-full">
            {suggestionCards.map((card, idx) => (
              <button
                key={idx}
                onClick={() => onSend(card.prompt)}
                className="bg-white border border-gray-200 rounded-xl p-6 text-left hover:border-indigo-300 hover:shadow-md transition-all duration-200 group"
              >
                <div className="text-3xl mb-3">{card.icon}</div>
                <h3 className="font-semibold text-gray-900 mb-2 group-hover:text-indigo-600 transition-colors">
                  {card.title}
                </h3>
                <p className="text-sm text-gray-600">{card.description}</p>
              </button>
            ))}
          </div>
        </div>
      ) : (
        /* Conversation State */
        <>
          <div className="flex-1 max-w-3xl mx-auto w-full space-y-6 pb-32">
            {messages.map((msg, i) => (
              <ChatMessage key={i} message={msg} businessName={businessName} />
            ))}
            {loading && (
              <div className="flex justify-start">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-indigo-100 flex items-center justify-center flex-shrink-0">
                    <span className="text-sm">🤖</span>
                  </div>
                  <div className="bg-white border border-gray-200 rounded-2xl px-5 py-3">
                    <div className="flex items-center gap-1">
                      <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                      <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                      <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                    </div>
                  </div>
                </div>
              </div>
            )}
            {error && (
              <div className="text-center">
                <p className="text-sm text-red-600 bg-red-50 rounded-lg px-4 py-2 inline-block">{error}</p>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Fixed Input at Bottom */}
          <div className="fixed bottom-0 left-0 right-0 bg-gradient-to-t from-white via-white to-transparent pt-6 pb-6">
            <div className="max-w-3xl mx-auto px-4">
              <ChatInput onSend={onSend} disabled={loading} placeholder="Ask me anything about your business..." />
            </div>
          </div>
        </>
      )}
    </div>
  )
}
