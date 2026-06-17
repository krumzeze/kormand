'use client'

import { forwardRef } from 'react'
import { cn } from '@/lib/utils'

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'gradient' | 'ghost' | 'danger'
  size?: 'sm' | 'md' | 'lg'
  loading?: boolean
}

const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = 'primary', size = 'md', loading, children, disabled, ...props }, ref) => {
    const base =
      'inline-flex items-center justify-center gap-2 rounded-full font-medium transition-all duration-500 ease-[cubic-bezier(0.32,0.72,0,1)] active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none'

    const variants = {
      primary: 'bg-ink text-bg hover:shadow-lg hover:scale-[1.02]',
      secondary: 'bg-bg text-ink border border-ink/10 hover:border-ink/30 hover:shadow-card hover:scale-[1.02]',
      gradient: 'text-white hover:shadow-glass-lg hover:scale-[1.02]',
      ghost: 'text-ink hover:bg-black/5',
      danger: 'bg-red-500 text-white hover:bg-red-600 hover:shadow-lg hover:scale-[1.02]',
    }

    const sizes = {
      sm: 'px-4 py-2 text-xs',
      md: 'px-6 py-3 text-sm',
      lg: 'px-8 py-4 text-base',
    }

    return (
      <button
        ref={ref}
        className={cn(base, variants[variant], sizes[size], className)}
        style={variant === 'gradient' ? { background: 'linear-gradient(135deg, #7FB3FF 0%, #4FD1C5 100%)' } : undefined}
        disabled={disabled || loading}
        {...props}
      >
        {loading && (
          <svg className="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
          </svg>
        )}
        {children}
      </button>
    )
  }
)

Button.displayName = 'Button'
export default Button
