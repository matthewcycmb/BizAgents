import type { InputHTMLAttributes } from 'react'

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label: string
}

export function Input({ label, id, className = '', ...props }: InputProps) {
  return (
    <div>
      <label htmlFor={id} className="block text-sm font-medium text-bp-text-secondary">
        {label}
      </label>
      <input
        id={id}
        className={`mt-1 block w-full rounded-lg border border-bp-border bg-bp-bg-input px-3 py-2 text-bp-text-primary placeholder:text-bp-text-muted focus:border-bp-accent-green focus:outline-none focus:ring-1 focus:ring-bp-accent-green ${className}`}
        {...props}
      />
    </div>
  )
}
