import type { ButtonHTMLAttributes } from 'react'

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary'
}

export function Button({ variant = 'primary', className = '', children, ...props }: ButtonProps) {
  const base = 'px-4 py-2 rounded-full font-medium focus:outline-none disabled:opacity-50 disabled:cursor-not-allowed transition-all'
  const variants = {
    primary: 'bg-gradient-to-br from-bp-accent to-bp-accent-dim text-white hover:opacity-90 shadow-[0_4px_12px_rgba(230,57,70,0.3)]',
    secondary: 'bg-transparent text-bp-text-secondary border border-bp-border hover:bg-bp-bg-card hover:text-bp-text-primary',
  }

  return (
    <button className={`${base} ${variants[variant]} ${className}`} {...props}>
      {children}
    </button>
  )
}
