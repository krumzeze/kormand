'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useTranslations } from 'next-intl'
import { Send, Phone, Check, RefreshCw } from 'lucide-react'
import { toast } from '@/components/ui/Toaster'

interface TelegramVerifyProps {
  user: {
    telegramUsername: string | null
    telegramVerifiedAt: string | null
    phone: string | null
    phoneVerifiedAt: string | null
  }
}

function StatusRow({ icon: Icon, label, value, verified }: {
  icon: typeof Send
  label: string
  value: string | null
  verified: boolean
}) {
  return (
    <div className="flex items-center gap-3 py-2.5">
      <Icon className="w-5 h-5 text-muted shrink-0" />
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-ink">{label}</p>
        {value && <p className="text-sm text-muted truncate">{value}</p>}
      </div>
      <span className={verified
        ? 'inline-flex items-center gap-1 text-xs font-medium text-emerald-700 bg-emerald-50 rounded-full px-2.5 py-1'
        : 'text-xs font-medium text-muted bg-black/[0.04] rounded-full px-2.5 py-1'}>
        {verified && <Check className="w-3 h-3" />}
        {verified ? '✓' : '—'}
      </span>
    </div>
  )
}

export default function TelegramVerify({ user }: TelegramVerifyProps) {
  const t = useTranslations('settings.telegram')
  const router = useRouter()
  const [starting, setStarting] = useState(false)

  const start = async () => {
    setStarting(true)
    try {
      const res = await fetch('/api/telegram/link', { method: 'POST' })
      if (!res.ok) {
        toast(t('error'), 'error')
        return
      }
      const { url } = await res.json()
      window.open(url, '_blank')
    } catch {
      toast(t('error'), 'error')
    } finally {
      setStarting(false)
    }
  }

  const tgVerified = !!user.telegramVerifiedAt
  const phoneVerified = !!user.phoneVerifiedAt

  return (
    <div className="flex flex-col gap-1">
      <StatusRow
        icon={Send}
        label={t('telegram')}
        value={user.telegramUsername ? `@${user.telegramUsername}` : null}
        verified={tgVerified}
      />
      <div className="h-px bg-black/5" />
      <StatusRow
        icon={Phone}
        label={t('phone')}
        value={phoneVerified ? user.phone : null}
        verified={phoneVerified}
      />

      <p className="text-sm text-muted mt-3">{t('hint')}</p>

      <div className="flex flex-wrap gap-2 mt-4">
        <button onClick={start} disabled={starting} className="btn-gradient justify-center">
          <Send className="w-4 h-4" />
          {tgVerified ? t('reverify') : t('verify')}
        </button>
        <button onClick={() => router.refresh()} className="btn-secondary justify-center">
          <RefreshCw className="w-4 h-4" />
          {t('refresh')}
        </button>
      </div>
    </div>
  )
}
