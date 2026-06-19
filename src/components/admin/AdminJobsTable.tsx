'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useTranslations } from 'next-intl'
import { Link } from '@/i18n/navigation'
import { ExternalLink } from 'lucide-react'
import Badge from '@/components/ui/Badge'
import { toast } from '@/components/ui/Toaster'

interface Job {
  id: string
  title: string
  company: string
  city: string
  isActive: boolean
  isBlocked: boolean
  blockReason: string | null
}

export default function AdminJobsTable({ jobs }: { jobs: Job[] }) {
  const t = useTranslations('admin')
  const router = useRouter()
  const [busy, setBusy] = useState<string | null>(null)

  const toggleBlock = async (job: Job) => {
    const next = !job.isBlocked
    let blockReason: string | undefined
    if (next) {
      const input = window.prompt(t('jobs.blockReasonPrompt'))
      if (input === null) return
      blockReason = input
    }
    setBusy(job.id)
    try {
      const res = await fetch(`/api/admin/jobs/${job.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isBlocked: next, blockReason }),
      })
      if (res.ok) {
        toast(next ? t('jobs.blocked') : t('jobs.unblocked'), 'success')
        router.refresh()
      } else {
        toast(t('actionError'), 'error')
      }
    } finally {
      setBusy(null)
    }
  }

  if (jobs.length === 0) return <p className="text-muted text-sm">{t('empty')}</p>

  return (
    <div className="flex flex-col gap-2">
      {jobs.map(job => (
        <div key={job.id} className="flex items-center gap-4 rounded-2xl bg-white ring-1 ring-black/5 px-4 py-3">
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2">
              <p className="font-medium text-ink text-sm truncate">{job.title}</p>
              {job.isBlocked && <Badge variant="danger">{t('jobs.blockedTag')}</Badge>}
              {!job.isActive && <Badge variant="muted">{t('jobs.inactive')}</Badge>}
            </div>
            <p className="text-xs text-muted truncate">{job.company} · {job.city}</p>
            {job.isBlocked && job.blockReason && (
              <p className="text-xs text-red-500 mt-0.5">{job.blockReason}</p>
            )}
          </div>
          <Link href={`/jobs/${job.id}`} className="text-muted hover:text-ink" target="_blank">
            <ExternalLink className="w-4 h-4" />
          </Link>
          <button
            onClick={() => toggleBlock(job)}
            disabled={busy === job.id}
            className={job.isBlocked ? 'btn-secondary text-xs py-2' : 'text-xs font-medium text-red-500 hover:text-red-600 rounded-full border border-red-200 bg-red-50 px-3 py-2 transition-colors'}
          >
            {job.isBlocked ? t('jobs.unblock') : t('jobs.block')}
          </button>
        </div>
      ))}
    </div>
  )
}
