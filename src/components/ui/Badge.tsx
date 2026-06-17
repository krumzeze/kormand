import { cn } from '@/lib/utils'

type BadgeVariant = 'sky' | 'turquoise' | 'lavender' | 'peach' | 'coral' | 'ink' | 'muted' | 'success' | 'warning' | 'danger'

interface BadgeProps {
  variant?: BadgeVariant
  children: React.ReactNode
  className?: string
  dot?: boolean
}

const variantStyles: Record<BadgeVariant, string> = {
  sky: 'bg-sky-light text-sky-blue border-sky-blue/20',
  turquoise: 'bg-turquoise-light text-turquoise border-turquoise/20',
  lavender: 'bg-lavender-light text-lavender border-lavender/30',
  peach: 'bg-peach/20 text-coral border-coral/20',
  coral: 'bg-coral/15 text-coral border-coral/20',
  ink: 'bg-ink text-bg border-transparent',
  muted: 'bg-black/5 text-muted border-transparent',
  success: 'bg-emerald-50 text-emerald-600 border-emerald-200',
  warning: 'bg-amber-50 text-amber-600 border-amber-200',
  danger: 'bg-red-50 text-red-500 border-red-200',
}

const dotColors: Record<BadgeVariant, string> = {
  sky: 'bg-sky-blue',
  turquoise: 'bg-turquoise',
  lavender: 'bg-lavender',
  peach: 'bg-peach',
  coral: 'bg-coral',
  ink: 'bg-bg',
  muted: 'bg-muted',
  success: 'bg-emerald-500',
  warning: 'bg-amber-500',
  danger: 'bg-red-500',
}

export default function Badge({ variant = 'muted', children, className, dot }: BadgeProps) {
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-medium border',
        variantStyles[variant],
        className
      )}
    >
      {dot && <span className={cn('w-1.5 h-1.5 rounded-full', dotColors[variant])} />}
      {children}
    </span>
  )
}
