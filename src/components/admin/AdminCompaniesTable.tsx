'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useTranslations } from 'next-intl'
import { Link } from '@/i18n/navigation'
import { ExternalLink, BadgeCheck } from 'lucide-react'
import Badge from '@/components/ui/Badge'
import { toast } from '@/components/ui/Toaster'

interface Company {
  id: string
  name: string
  city: string | null
  jobs: number
  isVerified: boolean
  isBlocked: boolean
  blockReason: string | null
}

export default function AdminCompaniesTable({ companies }: { companies: Company[] }) {
  const t = useTranslations('admin')
  const router = useRouter()
  const [busy, setBusy] = useState<string | null>(null)

  const patch = async (id: string, body: Record<string, unknown>, okMsg: string) => {
    setBusy(id)
    try {
      const res = await fetch(`/api/admin/companies/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      })
      if (res.ok) {
        toast(okMsg, 'success')
        router.refresh()
      } else {
        toast(t('actionError'), 'error')
      }
    } finally {
      setBusy(null)
    }
  }

  const toggleBlock = (c: Company) => {
    if (!c.isBlocked) {
      const reason = window.prompt(t('companies.blockReasonPrompt'))
      if (reason === null) return
      patch(c.id, { isBlocked: true, blockReason: reason }, t('companies.blocked'))
    } else {
      patch(c.id, { isBlocked: false }, t('companies.unblocked'))
    }
  }

  if (companies.length === 0) return <p className="text-muted text-sm">{t('empty')}</p>

  return (
    <div className="flex flex-col gap-2">
      {companies.map(c => (
        <div key={c.id} className="flex items-center gap-4 rounded-2xl bg-white ring-1 ring-black/5 px-4 py-3">
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2">
              <p className="font-medium text-ink text-sm truncate">{c.name}</p>
              {c.isVerified && <BadgeCheck className="w-4 h-4 text-sky-blue flex-shrink-0" />}
              {c.isBlocked && <Badge variant="danger">{t('companies.blockedTag')}</Badge>}
            </div>
            <p className="text-xs text-muted truncate">{c.city || '—'} · {c.jobs} {t('companies.jobsCount')}</p>
            {c.isBlocked && c.blockReason && <p className="text-xs text-red-500 mt-0.5">{c.blockReason}</p>}
          </div>
          <Link href={`/companies/${c.id}`} className="text-muted hover:text-ink" target="_blank">
            <ExternalLink className="w-4 h-4" />
          </Link>
          <button
            onClick={() => patch(c.id, { isVerified: !c.isVerified }, c.isVerified ? t('companies.unverified') : t('companies.verified'))}
            disabled={busy === c.id}
            className={c.isVerified
              ? 'text-xs font-medium text-muted hover:text-ink rounded-full border border-black/10 bg-black/5 px-3 py-2 transition-colors'
              : 'text-xs font-medium text-sky-blue hover:text-sky-blue/80 rounded-full border border-sky-blue/20 bg-sky-light px-3 py-2 transition-colors'}
          >
            {c.isVerified ? t('companies.unverify') : t('companies.verify')}
          </button>
          <button
            onClick={() => toggleBlock(c)}
            disabled={busy === c.id}
            className={c.isBlocked ? 'btn-secondary text-xs py-2' : 'text-xs font-medium text-red-500 hover:text-red-600 rounded-full border border-red-200 bg-red-50 px-3 py-2 transition-colors'}
          >
            {c.isBlocked ? t('companies.unblock') : t('companies.block')}
          </button>
        </div>
      ))}
    </div>
  )
}
