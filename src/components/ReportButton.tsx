'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useTranslations, useLocale } from 'next-intl'
import { Flag, X, Send } from 'lucide-react'
import { toast } from '@/components/ui/Toaster'

interface Props {
  target: 'JOB' | 'COMPANY'
  jobId?: string
  companyId?: string
}

const reasonKeys = ['fraud', 'spam', 'misleading', 'offensive', 'other'] as const

export default function ReportButton({ target, jobId, companyId }: Props) {
  const t = useTranslations('report')
  const locale = useLocale()
  const [open, setOpen] = useState(false)
  const [reason, setReason] = useState('')
  const [details, setDetails] = useState('')
  const [sending, setSending] = useState(false)

  const submit = async () => {
    if (!reason) {
      toast(t('reasonRequired'), 'error')
      return
    }
    setSending(true)
    try {
      const res = await fetch('/api/reports', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ target, jobId, companyId, reason, details }),
      })
      if (res.status === 401) {
        window.location.href = `/${locale}/auth/login`
        return
      }
      if (res.ok) {
        setOpen(false)
        setReason('')
        setDetails('')
        toast(t('success'), 'success')
      } else {
        toast(t('error'), 'error')
      }
    } finally {
      setSending(false)
    }
  }

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="inline-flex items-center gap-1.5 text-xs text-muted hover:text-red-500 transition-colors"
      >
        <Flag className="w-3.5 h-3.5" />
        {t('button')}
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-4"
            style={{ backdropFilter: 'blur(8px)', background: 'rgba(26,27,37,0.4)' }}
            onClick={e => e.target === e.currentTarget && setOpen(false)}
          >
            <motion.div
              initial={{ opacity: 0, y: 40, scale: 0.96 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 40, scale: 0.96 }}
              transition={{ duration: 0.3, ease: [0.32, 0.72, 0, 1] }}
              className="w-full max-w-lg bg-white rounded-3xl p-8 shadow-glass-lg"
            >
              <div className="flex items-start justify-between mb-6">
                <h3 className="font-heading font-semibold text-ink text-xl">{t('title')}</h3>
                <button onClick={() => setOpen(false)} className="w-8 h-8 rounded-full bg-black/5 flex items-center justify-center hover:bg-black/10 transition-colors">
                  <X className="w-4 h-4" />
                </button>
              </div>

              <div className="mb-5">
                <label className="text-sm font-medium text-ink/70 mb-2 block">{t('reason')}</label>
                <div className="flex flex-wrap gap-2">
                  {reasonKeys.map(key => {
                    const label = t(`reasons.${key}`)
                    return (
                      <button
                        key={key}
                        onClick={() => setReason(label)}
                        className={`rounded-full border px-3 py-1.5 text-xs font-medium transition-colors ${
                          reason === label
                            ? 'bg-ink text-bg border-transparent'
                            : 'bg-black/5 text-muted border-transparent hover:text-ink'
                        }`}
                      >
                        {label}
                      </button>
                    )
                  })}
                </div>
              </div>

              <div className="mb-6">
                <label className="text-sm font-medium text-ink/70 mb-2 block">{t('details')}</label>
                <textarea
                  value={details}
                  onChange={e => setDetails(e.target.value)}
                  placeholder={t('detailsPlaceholder')}
                  rows={4}
                  className="w-full rounded-2xl border border-black/10 bg-white/60 px-4 py-3 text-sm text-ink placeholder:text-muted outline-none transition-all duration-300 focus:border-sky-blue/50 focus:ring-2 focus:ring-sky-blue/20 resize-none"
                />
              </div>

              <div className="flex gap-3">
                <button onClick={submit} disabled={sending} className="btn-gradient flex-1 justify-center">
                  <Send className="w-4 h-4" />
                  {t('submit')}
                </button>
                <button onClick={() => setOpen(false)} className="btn-secondary">
                  {t('cancel')}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}
