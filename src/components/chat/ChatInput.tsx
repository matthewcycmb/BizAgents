import { useState } from 'react'

interface ChatInputProps {
  onSend: (message: string) => void
  disabled?: boolean
  placeholder?: string
}

export function ChatInput({ onSend, disabled, placeholder = "Ask anything..." }: ChatInputProps) {
  const [input, setInput] = useState('')

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    const trimmed = input.trim()
    if (!trimmed || disabled) return
    onSend(trimmed)
    setInput('')
  }

  return (
    <form onSubmit={handleSubmit} className="w-full">
      <div className="glass-input flex items-center gap-3 rounded-full py-2.5 pr-3 pl-7 transition-all">
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder={placeholder}
          disabled={disabled}
          className="flex-1 bg-transparent border-none outline-none text-bp-text-primary text-base font-sans py-3 placeholder:text-bp-text-muted disabled:opacity-50"
        />
        <button
          type="submit"
          disabled={disabled || !input.trim()}
          className="w-11 h-11 rounded-full border-none bg-gradient-to-br from-bp-accent to-bp-accent-dim text-white flex items-center justify-center cursor-pointer shrink-0 shadow-[0_4px_12px_rgba(230,57,70,0.3)] hover:opacity-90 hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
          aria-label="Send message"
        >
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5} strokeLinecap="round" className="w-[18px] h-[18px]">
            <path d="M12 19V5M5 12l7-7 7 7" />
          </svg>
        </button>
      </div>
    </form>
  )
}
