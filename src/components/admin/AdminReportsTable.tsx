'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useTranslations } from 'next-intl'
import { Link } from '@/i18n/navigation'
import { ExternalLink } from 'lucide-react'
import Badge from '@/components/ui/Badge'
import { toast } from '@/components/ui/Toaster'

interface Report {
  id: string
  target: 'JOB' | 'COMPANY'
  status: 'OPEN' | 'RESOLVED' | 'DISMISSED'
  reason: string
  details: string | null
  reporter: string
  createdAt: string
  subjectId: string | null
  subjectName: string | null
}

const statusVariant: Record<Report['status'], 'warning' | 'success' | 'muted'> = {
  OPEN: 'warning',
  RESOLVED: 'success',
  DISMISSED: 'muted',
}

export default function AdminReportsTable({ reports }: { reports: Report[] }) {
  const t = useTranslations('admin')
  const router = useRouter()
  const [busy, setBusy] = useState<string | null>(null)

  const resolve = async (id: string, status: 'RESOLVED' | 'DISMISSED') => {
    setBusy(id)
    try {
      const res = await fetch(`/api/admin/reports/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status }),
      })
      if (res.ok) {
        toast(t('reports.handled'), 'success')
        router.refresh()
      } else {
        toast(t('actionError'), 'error')
      }
    } finally {
      setBusy(null)
    }
  }

  if (reports.length === 0) return <p className="text-muted text-sm">{t('empty')}</p>

  return (
    <div className="flex flex-col gap-2">
      {reports.map(r => (
        <div key={r.id} className="rounded-2xl bg-white ring-1 ring-black/5 px-4 py-3">
          <div className="flex items-center gap-2 flex-wrap">
            <Badge variant={statusVariant[r.status]}>{t(`reports.status.${r.status}`)}</Badge>
            <Badge variant="muted">{t(`reports.target.${r.target}`)}</Badge>
            <span className="text-sm font-medium text-ink">{r.reason}</span>
            {r.subjectId && r.subjectName && (
              <Link
                href={r.target === 'JOB' ? `/jobs/${r.subjectId}` : `/companies/${r.subjectId}`}
                target="_blank"
                className="inline-flex items-center gap-1 text-xs text-sky-blue hover:underline"
              >
                {r.subjectName}
                <ExternalLink className="w-3 h-3" />
              </Link>
            )}
          </div>
          {r.details && <p className="text-sm text-muted mt-2">{r.details}</p>}
          <div className="flex items-center justify-between mt-2">
            <p className="text-xs text-muted">{t('reports.by')} {r.reporter}</p>
            {r.status === 'OPEN' && (
              <div className="flex gap-2">
                <button
                  onClick={() => resolve(r.id, 'RESOLVED')}
                  disabled={busy === r.id}
                  className="text-xs font-medium text-emerald-600 rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1.5 hover:text-emerald-700 transition-colors"
                >
                  {t('reports.resolve')}
                </button>
                <button
                  onClick={() => resolve(r.id, 'DISMISSED')}
                  disabled={busy === r.id}
                  className="text-xs font-medium text-muted rounded-full border border-black/10 bg-black/5 px-3 py-1.5 hover:text-ink transition-colors"
                >
                  {t('reports.dismiss')}
                </button>
              </div>
            )}
          </div>
        </div>
      ))}
    </div>
  )
}
