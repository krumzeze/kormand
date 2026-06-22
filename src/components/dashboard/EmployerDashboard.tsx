'use client'

import { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useTranslations } from 'next-intl'
import { Link } from '@/i18n/navigation'
import {
  Briefcase, BarChart3, Building2, Eye, Users, Plus,
  ChevronDown, ChevronRight, CheckCircle2, XCircle, Clock,
  MessageSquare, Send, Edit3, Zap, Trash2, MoreHorizontal,
  ExternalLink, Power
} from 'lucide-react'
import Badge from '@/components/ui/Badge'
import { cn, timeAgo } from '@/lib/utils'
import { toast } from '@/components/ui/Toaster'
import EditJobModal from '@/components/dashboard/EditJobModal'

const STATUS_CONFIG = {
  SENT: { label: 'Отправлен', variant: 'muted' as const },
  VIEWED: { label: 'Просмотрен', variant: 'sky' as const },
  INTERVIEW: { label: 'Собеседование', variant: 'turquoise' as const },
  REJECTED: { label: 'Отказ', variant: 'danger' as const },
  ACCEPTED: { label: 'Принят', variant: 'success' as const },
}

interface EmployerDashboardProps {
  company: any
  totalViews: number
  totalApplications: number
  locale: string
}

export default function EmployerDashboard({ company, totalViews, totalApplications, locale }: EmployerDashboardProps) {
  const t = useTranslations('dashboard.employer')
  const [activeTab, setActiveTab] = useState<'jobs' | 'applications' | 'stats'>('jobs')
  const [expandedJob, setExpandedJob] = useState<string | null>(null)
  const [updatingStatus, setUpdatingStatus] = useState<string | null>(null)
  const [editingJob, setEditingJob] = useState<any | null>(null)
  const [deletingId, setDeletingId] = useState<string | null>(null)
  const [menuJobId, setMenuJobId] = useState<string | null>(null)
  const menuRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!menuJobId) return
    const onClick = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) setMenuJobId(null)
    }
    document.addEventListener('mousedown', onClick)
    return () => document.removeEventListener('mousedown', onClick)
  }, [menuJobId])

  const updateApplicationStatus = async (appId: string, status: string) => {
    setUpdatingStatus(appId)
    try {
      const res = await fetch(`/api/applications/${appId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status }),
      })
      if (res.ok) {
        toast('Статус обновлён', 'success')
        // Reload for fresh data
        window.location.reload()
      }
    } finally {
      setUpdatingStatus(null)
    }
  }

  const deleteJob = async (job: any) => {
    if (!confirm(`Удалить вакансию «${job.title}»? Это действие необратимо.`)) return
    setDeletingId(job.id)
    try {
      const res = await fetch(`/api/jobs/${job.id}`, { method: 'DELETE' })
      if (res.ok) {
        toast('Вакансия удалена', 'success')
        window.location.reload()
      } else {
        toast('Не удалось удалить вакансию', 'error')
      }
    } finally {
      setDeletingId(null)
    }
  }

  const toggleJobActive = async (jobId: string, current: boolean) => {
    const res = await fetch(`/api/jobs/${jobId}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ isActive: !current }),
    })
    if (res.ok) {
      toast(current ? 'Вакансия деактивирована' : 'Вакансия активирована', 'success')
      window.location.reload()
    }
  }

  if (!company) {
    return (
      <div className="max-w-lg mx-auto px-4 text-center py-32">
        <div className="w-20 h-20 rounded-3xl bg-sky-light flex items-center justify-center mb-6 mx-auto">
          <Building2 className="w-10 h-10 text-sky-blue" />
        </div>
        <h2 className="font-heading font-bold text-ink text-2xl">Создайте профиль компании</h2>
        <p className="text-muted mt-3 mb-8">Разместите первую вакансию и начните получать отклики</p>
        <Link href="/post-job" className="btn-gradient">
          <Plus className="w-4 h-4" />
          Разместить вакансию
        </Link>
      </div>
    )
  }

  const allApplications = company.jobs.flatMap((j: any) => j.applications.map((a: any) => ({ ...a, jobTitle: j.title })))

  const TABS = [
    { key: 'jobs', label: t('myJobs'), icon: Briefcase, count: company.jobs.length },
    { key: 'applications', label: t('applications'), icon: Users, count: allApplications.length },
    { key: 'stats', label: t('stats'), icon: BarChart3 },
  ]

  return (
    <div className="max-w-[1600px] mx-auto px-4 md:px-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-10">
        <div>
          <span className="eyebrow bg-turquoise-light text-turquoise border border-turquoise/20 mb-3 inline-flex">
            <Building2 className="w-3 h-3" />
            Работодатель
          </span>
          <h1 className="font-heading font-bold text-ink" style={{ fontSize: 'clamp(1.5rem, 3vw, 2rem)' }}>
            {company.name}
          </h1>
          {(company.industry || company.cities?.length > 0) && (
            <p className="text-muted text-sm mt-1">{[company.industry, company.cities?.join(', ')].filter(Boolean).join(' · ')}</p>
          )}
        </div>
        <Link href="/post-job" className="btn-gradient w-fit">
          <Plus className="w-4 h-4" />
          {t('postJob')}
        </Link>
      </div>

      {/* Quick stats */}
      <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-10">
        {[
          { label: 'Активных вакансий', value: company.jobs.filter((j: any) => j.isActive).length, color: '#7FB3FF', bg: '#EEF5FF', Icon: Briefcase },
          { label: 'Просмотров', value: totalViews, color: '#4FD1C5', bg: '#E6FAF8', Icon: Eye },
          { label: 'Откликов', value: totalApplications, color: '#C7B6FF', bg: '#F3F0FF', Icon: Users },
        ].map((stat, i) => (
          <motion.div key={i} initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.08 }}
            className="p-1.5 rounded-2xl bg-black/[0.03] ring-1 ring-black/5">
            <div className="rounded-[calc(1rem-0.375rem)] bg-white p-5">
              <div className="w-8 h-8 rounded-xl flex items-center justify-center mb-3" style={{ background: stat.bg }}>
                <stat.Icon className="w-4 h-4" style={{ color: stat.color }} />
              </div>
              <div className="font-heading font-bold text-ink text-2xl">{stat.value}</div>
              <p className="text-xs text-muted mt-0.5">{stat.label}</p>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-1 mb-8 p-1 rounded-2xl bg-black/[0.04] w-fit">
        {TABS.map(tab => {
          const Icon = tab.icon
          return (
            <button key={tab.key} onClick={() => setActiveTab(tab.key as any)}
              className={cn('flex items-center gap-2 rounded-xl px-4 py-2.5 text-sm font-medium transition-all duration-300',
                activeTab === tab.key ? 'bg-white shadow-card text-ink' : 'text-muted hover:text-ink')}>
              <Icon className="w-4 h-4" />
              {tab.label}
              {'count' in tab && tab.count !== undefined && (
                <span className={cn('rounded-full px-2 py-0.5 text-[10px] font-bold',
                  activeTab === tab.key ? 'bg-sky-light text-sky-blue' : 'bg-black/5 text-muted')}>{tab.count}</span>
              )}
            </button>
          )
        })}
      </div>

      {/* Jobs tab */}
      {activeTab === 'jobs' && (
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}>
          {company.jobs.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-32 text-center">
              <div className="w-20 h-20 rounded-3xl bg-turquoise-light flex items-center justify-center mb-6">
                <Briefcase className="w-10 h-10 text-turquoise" />
              </div>
              <h3 className="font-heading font-semibold text-ink text-xl">{t('noJobs')}</h3>
              <p className="text-muted mt-2">{t('noJobsHint')}</p>
              <Link href="/post-job" className="btn-gradient mt-8">
                <Plus className="w-4 h-4" />
                {t('postJob')}
              </Link>
            </div>
          ) : (
            <div className="flex flex-col gap-4">
              {company.jobs.map((job: any, i: number) => (
                <motion.div key={job.id} initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.06 }}
                  className="p-1.5 rounded-3xl bg-black/[0.03] ring-1 ring-black/5">
                  <div className="rounded-[calc(1.5rem-0.375rem)] bg-white shadow-[inset_0_1px_1px_rgba(255,255,255,0.9)]">
                    {/* Job header */}
                    <div className="p-5 flex items-center justify-between gap-4 cursor-pointer"
                      onClick={() => setExpandedJob(expandedJob === job.id ? null : job.id)}>
                      <div className="flex items-center gap-3 min-w-0">
                        <div className={cn('w-2 h-2 rounded-full flex-shrink-0', job.isActive ? 'bg-emerald-400' : 'bg-muted')} />
                        <div className="min-w-0">
                          <p className="font-semibold text-ink text-sm truncate">{job.title}</p>
                          <p className="text-xs text-muted mt-0.5">{job.city} · {timeAgo(job.createdAt)}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-3 flex-shrink-0">
                        <div className="flex items-center gap-1.5 text-xs text-muted">
                          <Users className="w-3.5 h-3.5" />
                          {job._count.applications}
                        </div>
                        <div className="flex items-center gap-1.5 text-xs text-muted">
                          <Eye className="w-3.5 h-3.5" />
                          {job.views}
                        </div>
                        <Badge variant={job.isActive ? 'success' : 'muted'} dot>
                          {job.isActive ? 'Активна' : 'Не активна'}
                        </Badge>
                        <div className="relative" ref={menuJobId === job.id ? menuRef : undefined}>
                          <button
                            onClick={e => { e.stopPropagation(); setMenuJobId(menuJobId === job.id ? null : job.id) }}
                            className={cn('w-8 h-8 rounded-xl flex items-center justify-center text-muted hover:text-ink hover:bg-black/5 transition-all', menuJobId === job.id && 'bg-black/5 text-ink')}
                            aria-label="Действия"
                          >
                            <MoreHorizontal className="w-4 h-4" />
                          </button>
                          <AnimatePresence>
                            {menuJobId === job.id && (
                              <motion.div
                                initial={{ opacity: 0, scale: 0.96, y: -4 }}
                                animate={{ opacity: 1, scale: 1, y: 0 }}
                                exit={{ opacity: 0, scale: 0.96, y: -4 }}
                                transition={{ duration: 0.15 }}
                                className="absolute right-0 top-10 z-20 w-48 rounded-2xl bg-white p-1.5 shadow-glass-lg ring-1 ring-black/5"
                                onClick={e => e.stopPropagation()}
                              >
                                <Link href={`/jobs/${job.id}`}
                                  className="flex items-center gap-2.5 rounded-xl px-3 py-2 text-sm text-ink hover:bg-black/5 transition-colors">
                                  <ExternalLink className="w-4 h-4 text-muted" /> Открыть
                                </Link>
                                <button
                                  onClick={() => { setMenuJobId(null); setEditingJob(job) }}
                                  className="w-full flex items-center gap-2.5 rounded-xl px-3 py-2 text-sm text-ink hover:bg-black/5 transition-colors"
                                >
                                  <Edit3 className="w-4 h-4 text-muted" /> Изменить
                                </button>
                                <button
                                  onClick={() => { setMenuJobId(null); toggleJobActive(job.id, job.isActive) }}
                                  className="w-full flex items-center gap-2.5 rounded-xl px-3 py-2 text-sm text-ink hover:bg-black/5 transition-colors"
                                >
                                  <Power className="w-4 h-4 text-muted" /> {job.isActive ? t('deactivate') : t('activate')}
                                </button>
                                <div className="my-1 h-px bg-black/5" />
                                <button
                                  onClick={() => { setMenuJobId(null); deleteJob(job) }}
                                  disabled={deletingId === job.id}
                                  className="w-full flex items-center gap-2.5 rounded-xl px-3 py-2 text-sm text-red-500 hover:bg-red-50 transition-colors disabled:opacity-50"
                                >
                                  <Trash2 className="w-4 h-4" /> Удалить
                                </button>
                              </motion.div>
                            )}
                          </AnimatePresence>
                        </div>
                        <ChevronDown className={cn('w-4 h-4 text-muted transition-transform duration-300', expandedJob === job.id && 'rotate-180')} />
                      </div>
                    </div>

                    {/* Expanded applicants */}
                    <AnimatePresence>
                      {expandedJob === job.id && job.applications.length > 0 && (
                        <motion.div
                          initial={{ height: 0, opacity: 0 }}
                          animate={{ height: 'auto', opacity: 1 }}
                          exit={{ height: 0, opacity: 0 }}
                          transition={{ duration: 0.3, ease: [0.32, 0.72, 0, 1] }}
                          className="overflow-hidden border-t border-black/5"
                        >
                          <div className="p-5">
                            <p className="text-xs font-medium text-muted mb-4">{t('pipeline')}</p>
                            <div className="flex flex-col gap-3">
                              {job.applications.map((app: any) => (
                                <div key={app.id} className="flex items-center justify-between gap-4 p-4 rounded-2xl bg-black/[0.02] border border-black/5">
                                  <Link href={`/dashboard/employer/applications/${app.id}`} className="flex items-center gap-3 min-w-0 group">
                                    <div className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold bg-lavender-light text-lavender overflow-hidden flex-shrink-0">
                                      {app.user.avatarUrl
                                        ? <img src={app.user.avatarUrl} alt="" className="w-full h-full object-cover" />
                                        : app.user.name?.[0]?.toUpperCase()}
                                    </div>
                                    <div className="min-w-0">
                                      <p className="text-sm font-medium text-ink group-hover:text-sky-blue transition-colors truncate">{app.user.name}</p>
                                      <p className="text-xs text-muted truncate">{app.user.email}{app.user.phoneVerifiedAt && app.user.phone ? ` · ${app.user.phone}` : ''}</p>
                                    </div>
                                  </Link>
                                  <div className="flex items-center gap-2">
                                    <Badge variant={STATUS_CONFIG[app.status as keyof typeof STATUS_CONFIG].variant} dot>
                                      {STATUS_CONFIG[app.status as keyof typeof STATUS_CONFIG].label}
                                    </Badge>
                                    <select
                                      value={app.status}
                                      disabled={updatingStatus === app.id}
                                      onChange={e => updateApplicationStatus(app.id, e.target.value)}
                                      className="text-xs text-ink rounded-xl border border-black/10 px-2 py-1.5 outline-none bg-white focus:border-sky-blue/50 cursor-pointer"
                                    >
                                      {Object.entries(STATUS_CONFIG).map(([k, v]) => (
                                        <option key={k} value={k}>{v.label}</option>
                                      ))}
                                    </select>
                                  </div>
                                </div>
                              ))}
                            </div>
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </motion.div>
      )}

      {/* All applications tab */}
      {activeTab === 'applications' && (
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}>
          {allApplications.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-32 text-center">
              <div className="w-20 h-20 rounded-3xl bg-sky-light flex items-center justify-center mb-6">
                <Users className="w-10 h-10 text-sky-blue" />
              </div>
              <h3 className="font-heading font-semibold text-ink text-xl">Откликов пока нет</h3>
              <p className="text-muted mt-2">Опубликуйте вакансии и кандидаты начнут откликаться</p>
            </div>
          ) : (
            <div className="flex flex-col gap-3">
              {allApplications.map((app: any, i: number) => (
                <motion.div key={app.id} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}
                  className="p-1.5 rounded-2xl bg-black/[0.03] ring-1 ring-black/5">
                  <div className="rounded-[calc(1rem-0.375rem)] bg-white p-4 flex items-center justify-between gap-4 flex-wrap">
                    <Link href={`/dashboard/employer/applications/${app.id}`} className="flex items-center gap-3 min-w-0 group">
                      <div className="w-9 h-9 rounded-full flex items-center justify-center text-xs font-bold bg-lavender-light text-lavender overflow-hidden flex-shrink-0">
                        {app.user.avatarUrl
                          ? <img src={app.user.avatarUrl} alt="" className="w-full h-full object-cover" />
                          : app.user.name?.[0]?.toUpperCase()}
                      </div>
                      <div className="min-w-0">
                        <p className="font-medium text-ink text-sm group-hover:text-sky-blue transition-colors truncate">{app.user.name}</p>
                        <p className="text-xs text-muted truncate">{app.jobTitle}</p>
                      </div>
                    </Link>
                    <div className="flex items-center gap-3">
                      <Badge variant={STATUS_CONFIG[app.status as keyof typeof STATUS_CONFIG].variant} dot>
                        {STATUS_CONFIG[app.status as keyof typeof STATUS_CONFIG].label}
                      </Badge>
                      <select
                        value={app.status}
                        disabled={updatingStatus === app.id}
                        onChange={e => updateApplicationStatus(app.id, e.target.value)}
                        className="text-xs text-ink rounded-xl border border-black/10 px-2 py-1.5 outline-none bg-white cursor-pointer"
                      >
                        {Object.entries(STATUS_CONFIG).map(([k, v]) => (
                          <option key={k} value={k}>{v.label}</option>
                        ))}
                      </select>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </motion.div>
      )}

      {/* Stats tab */}
      {activeTab === 'stats' && (
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Application statuses breakdown */}
            <div className="p-1.5 rounded-3xl bg-black/[0.03] ring-1 ring-black/5">
              <div className="rounded-[calc(1.5rem-0.375rem)] bg-white p-6">
                <h3 className="font-heading font-semibold text-ink mb-6">Отклики по статусам</h3>
                {Object.entries(STATUS_CONFIG).map(([status, cfg]) => {
                  const count = allApplications.filter((a: any) => a.status === status).length
                  const pct = allApplications.length ? Math.round(count / allApplications.length * 100) : 0
                  return (
                    <div key={status} className="flex items-center gap-3 mb-4">
                      <span className="text-xs text-muted w-24 flex-shrink-0">{cfg.label}</span>
                      <div className="flex-1 h-2 rounded-full bg-black/5 overflow-hidden">
                        <motion.div
                          className="h-full w-full rounded-full origin-left"
                          style={{ background: 'linear-gradient(90deg, #7FB3FF 0%, #4FD1C5 100%)' }}
                          initial={{ scaleX: 0 }}
                          whileInView={{ scaleX: pct / 100 }}
                          transition={{ duration: 0.8 }}
                        />
                      </div>
                      <span className="text-xs font-medium text-ink w-6 text-right">{count}</span>
                    </div>
                  )
                })}
              </div>
            </div>

            {/* Top jobs by views */}
            <div className="p-1.5 rounded-3xl bg-black/[0.03] ring-1 ring-black/5">
              <div className="rounded-[calc(1.5rem-0.375rem)] bg-white p-6">
                <h3 className="font-heading font-semibold text-ink mb-6">Вакансии по просмотрам</h3>
                {company.jobs.slice().sort((a: any, b: any) => b.views - a.views).slice(0, 5).map((job: any, i: number) => (
                  <div key={job.id} className="flex items-center gap-3 mb-3">
                    <span className="text-xs text-muted w-3">{i + 1}</span>
                    <span className="text-sm text-ink truncate flex-1">{job.title}</span>
                    <div className="flex items-center gap-1.5 text-xs text-muted">
                      <Eye className="w-3.5 h-3.5" /> {job.views}
                    </div>
                  </div>
                ))}
                {company.jobs.length === 0 && <p className="text-sm text-muted">Нет данных</p>}
              </div>
            </div>
          </div>

          {/* AI placeholder */}
          <div className="mt-6 p-5 rounded-3xl border border-dashed border-lavender/40 bg-lavender-light/30 flex items-center gap-4">
            <div className="w-10 h-10 rounded-2xl bg-lavender-light flex items-center justify-center flex-shrink-0">
              <Zap className="w-5 h-5 text-lavender" />
            </div>
            <div>
              <p className="text-sm font-medium text-ink">Умный мэтчинг кандидатов</p>
              <p className="text-xs text-muted">В следующей версии — AI автоматически ранжирует кандидатов по совпадению с вакансией</p>
            </div>
            <span className="text-xs text-lavender font-medium ml-auto flex-shrink-0">Скоро</span>
          </div>
        </motion.div>
      )}

      {editingJob && (
        <EditJobModal
          job={editingJob}
          onClose={() => setEditingJob(null)}
          onSaved={() => { setEditingJob(null); window.location.reload() }}
        />
      )}
    </div>
  )
}
