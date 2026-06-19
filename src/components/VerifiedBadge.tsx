'use client'

import { BadgeCheck } from 'lucide-react'
import { useTranslations } from 'next-intl'
import { cn } from '@/lib/utils'

interface Props {
  withLabel?: boolean
  className?: string
}

export default function VerifiedBadge({ withLabel = false, className }: Props) {
  const t = useTranslations('common')

  return (
    <span
      className={cn(
        'group/vrf relative inline-flex items-center flex-shrink-0',
        withLabel && 'gap-1 rounded-full bg-sky-light border border-sky-blue/20 px-2.5 py-1',
        className
      )}
    >
      <BadgeCheck className="w-4 h-4 text-sky-blue" />
      {withLabel && <span className="text-sm font-medium text-sky-blue">{t('verifiedLabel')}</span>}
      <span
        role="tooltip"
        className="pointer-events-none absolute left-1/2 top-full z-30 mt-2 w-max max-w-[220px] -translate-x-1/2 rounded-xl bg-ink px-3 py-2 text-xs font-medium leading-snug text-bg opacity-0 shadow-glass-lg transition-opacity duration-200 group-hover/vrf:opacity-100"
      >
        {t('verifiedTooltip')}
      </span>
    </span>
  )
}
