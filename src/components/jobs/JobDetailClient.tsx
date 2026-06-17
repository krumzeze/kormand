'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useTranslations, useLocale } from 'next-intl'
import { Link } from '@/i18n/navigation'
import {
  MapPin, Briefcase, Star, Eye, Clock, Zap, ArrowLeft,
  Globe, Building2, Send, CheckCircle2, X
} from 'lucide-react'
import Badge from '@/components/ui/Badge'
import JobCard from './JobCard'
import { formatSalary, timeAgo } from '@/lib/utils'
import { toast } from '@/components/ui/Toaster'

const typeLabels: Record<string, string> = {
  FULL_TIME: 'Полная занятость', PART_TIME: 'Частичная', CONTRACT: 'Контракт',
  INTERNSHIP: 'Стажировка', REMOTE: 'Удалённо',
}
const levelLabels: Record<string, string> = {
  INTERN: 'Стажёр', JUNIOR: 'Junior', MIDDLE: 'Middle', SENIOR: 'Senior', LEAD: 'Lead',
}

interface Props {
  job: any
  similar: any[]
  matchScore?: number
  alreadyApplied: boolean
  isLoggedIn: boolean
  userRole?: string
}

export default function JobDetailClient({ job, similar, matchScore, alreadyApplied, isLoggedIn, userRole }: Props) {
  const t = useTranslations()
  const locale = useLocale()
  const [applyOpen, setApplyOpen] = useState(false)
  const [coverNote, setCoverNote] = useState('')
  const [applying, setApplying] = useState(false)
  const [applied, setApplied] = useState(alreadyApplied)

  const salary = formatSalary(job.salaryMin, job.salaryMax, job.currency)

  const handleApply = async () => {
    if (!isLoggedIn) {
      window.location.href = `/${locale}/auth/login`
      return
    }
    setApplying(true)
    try {
      const res = await fetch('/api/applications', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ jobId: job.id, coverNote }),
      })
      if (res.ok) {
        setApplied(true)
        setApplyOpen(false)
        toast(t('application.success'), 'success')
      } else {
        const data = await res.json()
        toast(data.error === 'ALREADY_APPLIED' ? 'Вы уже откликались на эту вакансию' : t('common.error'), 'error')
      }
    } finally {
      setApplying(false)
    }
  }

  return (
    <div className="max-w-[1600px] mx-auto px-4 md:px-8">
      {/* Back */}
      <Link
        href="/jobs"
        className="inline-flex items-center gap-2 text-sm text-muted hover:text-ink transition-colors duration-300 mb-8 group"
      >
        <div className="w-7 h-7 rounded-full bg-black/5 flex items-center justify-center transition-all duration-300 group-hover:bg-black/10">
          <ArrowLeft className="w-3.5 h-3.5" />
        </div>
        Назад к вакансиям
      </Link>

      <div className="grid lg:grid-cols-3 gap-8">
        {/* Main content */}
        <div className="lg:col-span-2">
          {/* Job header card */}
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, ease: [0.32, 0.72, 0, 1] }}
            className="p-1.5 rounded-3xl bg-black/[0.03] ring-1 ring-black/5 mb-6"
          >
            <div className="rounded-[calc(1.5rem-0.375rem)] bg-white shadow-[inset_0_1px_1px_rgba(255,255,255,0.9)] p-8">
              <div className="flex items-start gap-4">
                {/* Company logo */}
                <div
                  className="w-16 h-16 rounded-2xl flex-shrink-0 flex items-center justify-center text-2xl font-bold font-heading"
                  style={{ background: '#EEF5FF', color: '#7FB3FF' }}
                >
                  {job.company.logoUrl
                    ? <img src={job.company.logoUrl} alt={job.company.name} className="w-full h-full rounded-2xl object-cover" />
                    : job.company.name[0]
                  }
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div>
                      <p className="text-sm text-muted">{job.company.name}</p>
                      <h1 className="font-heading font-bold text-ink text-2xl md:text-3xl mt-1 leading-tight">
                        {job.title}
                      </h1>
                    </div>
                    {job.isFeatured && <Badge variant="lavender" dot>Рекомендуем</Badge>}
                  </div>

                  <div className="flex flex-wrap gap-2 mt-4">
                    <Badge variant="sky">{typeLabels[job.type]}</Badge>
                    <Badge variant="muted">{levelLabels[job.level]}</Badge>
                    <Badge variant="muted">
                      <MapPin className="w-3 h-3" />
                      {job.city}
                    </Badge>
                    <Badge variant="muted">
                      <Clock className="w-3 h-3" />
                      {timeAgo(job.createdAt)}
                    </Badge>
                  </div>
                </div>
              </div>

              {/* Salary + match */}
              {(salary || matchScore !== undefined) && (
                <div className="flex flex-wrap items-center gap-4 mt-6 pt-6 border-t border-black/5">
                  {salary && (
                    <div>
                      <p className="text-xs text-muted mb-1">Зарплата</p>
                      <p className="font-heading font-semibold text-ink text-xl">{salary}</p>
                      {job.salaryMin && job.salaryMax && (
                        <div className="w-40 h-1.5 rounded-full bg-black/5 mt-2 overflow-hidden">
                          <motion.div
                            className="h-full rounded-full"
                            style={{ background: 'linear-gradient(90deg, #7FB3FF 0%, #4FD1C5 100%)' }}
                            initial={{ width: 0 }}
                            animate={{ width: `${Math.min(100, (job.salaryMax / 5000) * 100)}%` }}
                            transition={{ delay: 0.4, duration: 1, ease: [0.32, 0.72, 0, 1] }}
                          />
                        </div>
                      )}
                    </div>
                  )}
                  {matchScore !== undefined && matchScore > 0 && (
                    <div className="flex items-center gap-2 px-4 py-2 rounded-2xl bg-turquoise-light border border-turquoise/20">
                      <Zap className="w-4 h-4 text-turquoise" />
                      <span className="text-sm font-medium text-turquoise">Совпадение {matchScore}%</span>
                    </div>
                  )}
                </div>
              )}
            </div>
          </motion.div>

          {/* Description */}
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1, duration: 0.5, ease: [0.32, 0.72, 0, 1] }}
            className="p-1.5 rounded-3xl bg-black/[0.03] ring-1 ring-black/5 mb-6"
          >
            <div className="rounded-[calc(1.5rem-0.375rem)] bg-white shadow-[inset_0_1px_1px_rgba(255,255,255,0.9)] p-8">
              <h2 className="font-heading font-semibold text-ink text-lg mb-5">{t('jobs.description')}</h2>
              <div
                className="prose prose-sm max-w-none text-muted leading-relaxed"
                dangerouslySetInnerHTML={{
                  __html: job.description
                    .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
                    .replace(/\n/g, '<br />')
                }}
              />

              {/* Skills */}
              {job.skills.length > 0 && (
                <div className="mt-8">
                  <h3 className="font-medium text-ink text-sm mb-3">{t('jobs.skills')}</h3>
                  <div className="flex flex-wrap gap-2">
                    {job.skills.map((skill: string) => (
                      <span key={skill} className="skill-tag">{skill}</span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </motion.div>

          {/* Similar jobs */}
          {similar.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2, duration: 0.5 }}
            >
              <h2 className="font-heading font-semibold text-ink text-lg mb-4">{t('jobs.similarJobs')}</h2>
              <div className="grid gap-4">
                {similar.map((j, i) => <JobCard key={j.id} job={j} index={i} compact />)}
              </div>
            </motion.div>
          )}
        </div>

        {/* Sidebar */}
        <div className="lg:col-span-1">
          <div className="sticky top-28 flex flex-col gap-4">
            {/* Apply button card */}
            <motion.div
              initial={{ opacity: 0, x: 24 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.15, duration: 0.5, ease: [0.32, 0.72, 0, 1] }}
              className="p-1.5 rounded-3xl bg-black/[0.03] ring-1 ring-black/5"
            >
              <div className="rounded-[calc(1.5rem-0.375rem)] bg-white shadow-[inset_0_1px_1px_rgba(255,255,255,0.9)] p-6">
                <div className="flex items-center gap-3 mb-4">
                  <Eye className="w-4 h-4 text-muted" />
                  <span className="text-sm text-muted">{job.views} просмотров</span>
                  <span className="text-sm text-muted">·</span>
                  <span className="text-sm text-muted">{job._count.applications} откликов</span>
                </div>

                {userRole === 'CANDIDATE' || !userRole ? (
                  applied ? (
                    <div className="flex items-center gap-3 rounded-2xl p-4 bg-emerald-50 border border-emerald-200">
                      <CheckCircle2 className="w-5 h-5 text-emerald-600 flex-shrink-0" />
                      <div>
                        <p className="text-sm font-medium text-emerald-700">{t('application.success')}</p>
                        <p className="text-xs text-emerald-600 mt-0.5">{t('application.successDesc')}</p>
                      </div>
                    </div>
                  ) : (
                    <button
                      onClick={() => isLoggedIn ? setApplyOpen(true) : window.location.href = `/${locale}/auth/login`}
                      className="btn-gradient w-full justify-center text-sm py-3.5"
                    >
                      <Send className="w-4 h-4" />
                      {t('jobs.apply')}
                    </button>
                  )
                ) : userRole === 'EMPLOYER' ? (
                  <p className="text-xs text-muted text-center">Работодатели не могут откликаться</p>
                ) : null}

                {!isLoggedIn && (
                  <p className="text-xs text-muted text-center mt-3">
                    <Link href="/auth/login" className="text-sky-blue hover:underline">Войдите</Link>, чтобы откликнуться
                  </p>
                )}
              </div>
            </motion.div>

            {/* Company card */}
            <motion.div
              initial={{ opacity: 0, x: 24 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2, duration: 0.5 }}
              className="p-1.5 rounded-3xl bg-black/[0.03] ring-1 ring-black/5"
            >
              <div className="rounded-[calc(1.5rem-0.375rem)] bg-white shadow-[inset_0_1px_1px_rgba(255,255,255,0.9)] p-6">
                <h3 className="font-heading font-semibold text-ink mb-4">{t('jobs.aboutCompany')}</h3>
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-12 h-12 rounded-2xl flex items-center justify-center text-lg font-bold font-heading bg-sky-light text-sky-blue">
                    {job.company.name[0]}
                  </div>
                  <div>
                    <p className="font-medium text-ink text-sm">{job.company.name}</p>
                    {job.company.industry && <p className="text-xs text-muted">{job.company.industry}</p>}
                  </div>
                </div>

                {job.company.description && (
                  <p className="text-sm text-muted leading-relaxed mb-4">{job.company.description}</p>
                )}

                <div className="flex items-center gap-4 pt-4 border-t border-black/5">
                  <div className="flex items-center gap-1.5 text-xs text-muted">
                    <Star className="w-3.5 h-3.5 text-amber-400 fill-amber-400" />
                    {job.company.ratingAvg.toFixed(1)}
                  </div>
                  {job.company.city && (
                    <div className="flex items-center gap-1.5 text-xs text-muted">
                      <MapPin className="w-3.5 h-3.5" />
                      {job.company.city}
                    </div>
                  )}
                  {job.company.website && (
                    <a
                      href={job.company.website}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-1.5 text-xs text-sky-blue hover:underline ml-auto"
                    >
                      <Globe className="w-3.5 h-3.5" />
                      Сайт
                    </a>
                  )}
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </div>

      {/* Apply modal */}
      <AnimatePresence>
        {applyOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-4"
            style={{ backdropFilter: 'blur(8px)', background: 'rgba(26,27,37,0.4)' }}
            onClick={e => e.target === e.currentTarget && setApplyOpen(false)}
          >
            <motion.div
              initial={{ opacity: 0, y: 40, scale: 0.96 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 40, scale: 0.96 }}
              transition={{ duration: 0.3, ease: [0.32, 0.72, 0, 1] }}
              className="w-full max-w-lg bg-white rounded-3xl p-8 shadow-glass-lg"
            >
              <div className="flex items-start justify-between mb-6">
                <div>
                  <h3 className="font-heading font-semibold text-ink text-xl">{t('application.title')}</h3>
                  <p className="text-sm text-muted mt-1">{job.title} · {job.company.name}</p>
                </div>
                <button onClick={() => setApplyOpen(false)} className="w-8 h-8 rounded-full bg-black/5 flex items-center justify-center hover:bg-black/10 transition-colors">
                  <X className="w-4 h-4" />
                </button>
              </div>

              <div className="mb-6">
                <label className="text-sm font-medium text-ink/70 mb-2 block">{t('application.coverNote')}</label>
                <textarea
                  value={coverNote}
                  onChange={e => setCoverNote(e.target.value)}
                  placeholder={t('application.coverNotePlaceholder')}
                  rows={5}
                  className="w-full rounded-2xl border border-black/10 bg-white/60 px-4 py-3 text-sm text-ink placeholder:text-muted outline-none transition-all duration-300 focus:border-sky-blue/50 focus:ring-2 focus:ring-sky-blue/20 resize-none"
                />
              </div>

              <div className="flex gap-3">
                <button
                  onClick={handleApply}
                  disabled={applying}
                  className="btn-gradient flex-1 justify-center"
                >
                  {applying ? (
                    <svg className="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                    </svg>
                  ) : <Send className="w-4 h-4" />}
                  {t('application.submit')}
                </button>
                <button onClick={() => setApplyOpen(false)} className="btn-secondary">
                  {t('common.cancel')}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
