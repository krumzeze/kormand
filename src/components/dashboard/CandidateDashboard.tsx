'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { useTranslations } from 'next-intl'
import { Link } from '@/i18n/navigation'
import {
  User, Briefcase, Star, Clock, CheckCircle2, XCircle, Eye, MessageSquare, Zap,
  ChevronRight, Edit3, Upload, Target
} from 'lucide-react'
import Badge from '@/components/ui/Badge'
import JobCard from '@/components/jobs/JobCard'
import Input from '@/components/ui/Input'
import Button from '@/components/ui/Button'
import { cn, timeAgo } from '@/lib/utils'
import { toast } from '@/components/ui/Toaster'

const STATUS_CONFIG = {
  SENT: { label: 'Отправлен', variant: 'muted' as const, icon: Clock, color: '#6B6F80' },
  VIEWED: { label: 'Просмотрен', variant: 'sky' as const, icon: Eye, color: '#7FB3FF' },
  INTERVIEW: { label: 'Собеседование', variant: 'turquoise' as const, icon: MessageSquare, color: '#4FD1C5' },
  REJECTED: { label: 'Отказ', variant: 'danger' as const, icon: XCircle, color: '#EF4444' },
  ACCEPTED: { label: 'Принят', variant: 'success' as const, icon: CheckCircle2, color: '#10B981' },
}

interface CandidateDashboardProps {
  profile: any
  applications: any[]
  recommendations: any[]
  user: { name: string; email: string; phone?: string | null }
}

export default function CandidateDashboard({ profile, applications, recommendations, user }: CandidateDashboardProps) {
  const t = useTranslations('dashboard.candidate')
  const [activeTab, setActiveTab] = useState<'applications' | 'profile' | 'recommendations'>('applications')
  const [editMode, setEditMode] = useState(false)
  const [saving, setSaving] = useState(false)

  const [headline, setHeadline] = useState(profile?.headline || '')
  const [about, setAbout] = useState(profile?.about || '')
  const [city, setCity] = useState(profile?.city || '')
  const [skills, setSkills] = useState(profile?.skills?.join(', ') || '')

  // Profile completion
  const fields = [profile?.headline, profile?.about, profile?.city, profile?.skills?.length, profile?.resumeUrl]
  const completion = Math.round((fields.filter(Boolean).length / fields.length) * 100)

  const saveProfile = async () => {
    setSaving(true)
    try {
      const res = await fetch('/api/profile', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ headline, about, city, skills }),
      })
      if (res.ok) {
        toast('Профиль сохранён!', 'success')
        setEditMode(false)
      }
    } finally {
      setSaving(false)
    }
  }

  const TABS = [
    { key: 'applications', label: t('applications'), icon: Briefcase, count: applications.length },
    { key: 'profile', label: t('profile'), icon: User },
    { key: 'recommendations', label: t('recommendations'), icon: Zap, count: recommendations.length },
  ]

  return (
    <div className="max-w-[1600px] mx-auto px-4 md:px-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-10">
        <div>
          <span className="eyebrow bg-sky-light text-sky-blue border border-sky-blue/20 mb-3 inline-flex">
            <User className="w-3 h-3" />
            Соискатель
          </span>
          <h1 className="font-heading font-bold text-ink" style={{ fontSize: 'clamp(1.5rem, 3vw, 2rem)' }}>
            {t('title')}, {user.name.split(' ')[0]} 👋
          </h1>
        </div>

        {/* Profile completion */}
        <div className="p-1.5 rounded-2xl bg-black/[0.03] ring-1 ring-black/5">
          <div className="rounded-[calc(1rem-0.375rem)] bg-white px-5 py-4">
            <div className="flex items-center justify-between gap-8 mb-2">
              <span className="text-xs font-medium text-muted">{t('profileCompletion')}</span>
              <span className="font-heading font-bold text-ink text-sm">{completion}%</span>
            </div>
            <div className="w-48 h-2 rounded-full bg-black/5 overflow-hidden">
              <motion.div
                className="h-full rounded-full"
                style={{ background: 'linear-gradient(90deg, #7FB3FF 0%, #4FD1C5 100%)' }}
                initial={{ width: 0 }}
                animate={{ width: `${completion}%` }}
                transition={{ duration: 1, ease: [0.32, 0.72, 0, 1] }}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-1 mb-8 p-1 rounded-2xl bg-black/[0.04] w-fit">
        {TABS.map(tab => {
          const Icon = tab.icon
          return (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key as any)}
              className={cn(
                'flex items-center gap-2 rounded-xl px-4 py-2.5 text-sm font-medium transition-all duration-300',
                activeTab === tab.key
                  ? 'bg-white shadow-card text-ink'
                  : 'text-muted hover:text-ink'
              )}
            >
              <Icon className="w-4 h-4" />
              {tab.label}
              {'count' in tab && tab.count !== undefined && (
                <span className={cn(
                  'rounded-full px-2 py-0.5 text-[10px] font-bold',
                  activeTab === tab.key ? 'bg-sky-light text-sky-blue' : 'bg-black/5 text-muted'
                )}>{tab.count}</span>
              )}
            </button>
          )
        })}
      </div>

      {/* Applications tab */}
      {activeTab === 'applications' && (
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}>
          {applications.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-32 text-center">
              <div className="w-20 h-20 rounded-3xl bg-sky-light flex items-center justify-center mb-6">
                <Briefcase className="w-10 h-10 text-sky-blue" />
              </div>
              <h3 className="font-heading font-semibold text-ink text-xl">{t('noApplications')}</h3>
              <p className="text-muted mt-2">{t('noApplicationsHint')}</p>
              <Link href="/jobs" className="btn-gradient mt-8">
                Найти вакансии <ChevronRight className="w-4 h-4" />
              </Link>
            </div>
          ) : (
            <div className="flex flex-col gap-4">
              {applications.map((app, i) => {
                const config = STATUS_CONFIG[app.status as keyof typeof STATUS_CONFIG]
                const Icon = config.icon
                return (
                  <motion.div
                    key={app.id}
                    initial={{ opacity: 0, y: 16 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.06 }}
                    className="p-1.5 rounded-3xl bg-black/[0.03] ring-1 ring-black/5"
                  >
                    <div className="rounded-[calc(1.5rem-0.375rem)] bg-white shadow-[inset_0_1px_1px_rgba(255,255,255,0.9)] p-5">
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex items-center gap-3 min-w-0">
                          <div
                            className="w-11 h-11 rounded-2xl flex-shrink-0 flex items-center justify-center font-bold text-sm"
                            style={{ background: '#EEF5FF', color: '#7FB3FF' }}
                          >
                            {app.job.company.name[0]}
                          </div>
                          <div className="min-w-0">
                            <p className="text-xs text-muted">{app.job.company.name}</p>
                            <Link href={`/jobs/${app.job.id}`} className="font-semibold text-ink text-sm hover:text-sky-blue transition-colors">
                              {app.job.title}
                            </Link>
                          </div>
                        </div>

                        {/* Status badge */}
                        <div className="flex items-center gap-2 flex-shrink-0">
                          <Badge variant={config.variant} dot>{config.label}</Badge>
                        </div>
                      </div>

                      {/* Timeline */}
                      <div className="flex items-center gap-1 mt-4 overflow-x-auto pb-1">
                        {Object.entries(STATUS_CONFIG).filter(([k]) => k !== 'REJECTED').map(([key, cfg], idx, arr) => {
                          const statusOrder = ['SENT', 'VIEWED', 'INTERVIEW', 'ACCEPTED']
                          const currentIdx = statusOrder.indexOf(app.status)
                          const stepIdx = statusOrder.indexOf(key)
                          const isActive = key === app.status
                          const isDone = app.status !== 'REJECTED' && stepIdx < currentIdx
                          const isRejected = app.status === 'REJECTED'
                          return (
                            <div key={key} className="flex items-center gap-1 flex-shrink-0">
                              <div className={cn(
                                'w-7 h-7 rounded-full flex items-center justify-center text-xs transition-all duration-500',
                                isActive ? 'shadow-sm' : '',
                                isDone ? 'bg-emerald-100' : isActive ? '' : 'bg-black/5',
                                isRejected && isActive ? 'bg-red-100' : '',
                              )}
                                style={isActive && !isRejected ? { background: cfg.color + '22', border: `1.5px solid ${cfg.color}` } : {}}
                              >
                                <cfg.icon className="w-3.5 h-3.5" style={{ color: isDone ? '#10B981' : isActive ? cfg.color : '#6B6F80' }} />
                              </div>
                              {idx < arr.length - 1 && (
                                <div className={cn('w-8 h-0.5 rounded-full', isDone ? 'bg-emerald-300' : 'bg-black/8')} />
                              )}
                            </div>
                          )
                        })}
                      </div>

                      <div className="flex items-center justify-between mt-3">
                        {app.coverNote && (
                          <p className="text-xs text-muted truncate max-w-sm">&ldquo;{app.coverNote}&rdquo;</p>
                        )}
                        <span className="text-xs text-muted ml-auto">{timeAgo(app.createdAt)}</span>
                      </div>
                    </div>
                  </motion.div>
                )
              })}
            </div>
          )}
        </motion.div>
      )}

      {/* Profile tab */}
      {activeTab === 'profile' && (
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} className="max-w-2xl">
          <div className="p-1.5 rounded-3xl bg-black/[0.03] ring-1 ring-black/5">
            <div className="rounded-[calc(1.5rem-0.375rem)] bg-white shadow-[inset_0_1px_1px_rgba(255,255,255,0.9)] p-8">
              <div className="flex items-center justify-between mb-6">
                <h2 className="font-heading font-semibold text-ink text-xl">{t('profile')}</h2>
                <button
                  onClick={() => setEditMode(!editMode)}
                  className="flex items-center gap-2 rounded-xl px-3 py-2 text-xs font-medium text-muted hover:text-ink hover:bg-black/5 transition-all"
                >
                  <Edit3 className="w-3.5 h-3.5" />
                  {editMode ? 'Отмена' : t('editProfile')}
                </button>
              </div>

              {editMode ? (
                <div className="flex flex-col gap-4">
                  <Input label="Должность / Headline" value={headline} onChange={e => setHeadline(e.target.value)} placeholder="Frontend Developer, Data Scientist..." />
                  <div>
                    <label className="text-sm font-medium text-ink/70 mb-2 block">О себе</label>
                    <textarea value={about} onChange={e => setAbout(e.target.value)} rows={4} placeholder="Расскажите о своём опыте и целях..."
                      className="w-full rounded-2xl border border-black/10 px-4 py-3 text-sm outline-none focus:border-sky-blue/50 focus:ring-2 focus:ring-sky-blue/20 resize-none" />
                  </div>
                  <Input label="Город" value={city} onChange={e => setCity(e.target.value)} placeholder="Душанбе" />
                  <Input label="Навыки (через запятую)" value={skills} onChange={e => setSkills(e.target.value)} placeholder="React, TypeScript, Node.js..." />
                  <div className="flex gap-3 mt-2">
                    <Button variant="gradient" onClick={saveProfile} loading={saving} className="flex-1">
                      Сохранить
                    </Button>
                    <Button variant="secondary" onClick={() => setEditMode(false)}>Отмена</Button>
                  </div>
                </div>
              ) : (
                <div className="flex flex-col gap-5">
                  <div>
                    <p className="text-xs text-muted mb-1">Имя</p>
                    <p className="font-medium text-ink">{user.name}</p>
                  </div>
                  <div>
                    <p className="text-xs text-muted mb-1">Email</p>
                    <p className="text-sm text-ink">{user.email}</p>
                  </div>
                  {profile?.headline && (
                    <div>
                      <p className="text-xs text-muted mb-1">Должность</p>
                      <p className="font-medium text-ink">{profile.headline}</p>
                    </div>
                  )}
                  {profile?.city && (
                    <div>
                      <p className="text-xs text-muted mb-1">Город</p>
                      <p className="text-sm text-ink">{profile.city}</p>
                    </div>
                  )}
                  {profile?.about && (
                    <div>
                      <p className="text-xs text-muted mb-1">О себе</p>
                      <p className="text-sm text-muted leading-relaxed">{profile.about}</p>
                    </div>
                  )}
                  {profile?.skills?.length > 0 && (
                    <div>
                      <p className="text-xs text-muted mb-2">Навыки</p>
                      <div className="flex flex-wrap gap-2">
                        {profile.skills.map((s: string) => <span key={s} className="skill-tag">{s}</span>)}
                      </div>
                    </div>
                  )}
                  {!profile?.headline && !profile?.about && (
                    <div className="flex items-center gap-3 rounded-2xl bg-amber-50 border border-amber-200 p-4">
                      <Target className="w-5 h-5 text-amber-500 flex-shrink-0" />
                      <p className="text-sm text-amber-700">Заполните профиль, чтобы работодатели могли найти вас</p>
                    </div>
                  )}

                  <button
                    onClick={() => setEditMode(true)}
                    className="btn-secondary text-sm w-fit"
                  >
                    <Edit3 className="w-4 h-4" />
                    {t('editProfile')}
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* AI placeholder */}
          <div className="mt-4 p-4 rounded-3xl border border-dashed border-lavender/40 bg-lavender-light/30 flex items-center gap-4">
            <div className="w-10 h-10 rounded-2xl bg-lavender-light flex items-center justify-center flex-shrink-0">
              <Zap className="w-5 h-5 text-lavender" />
            </div>
            <div>
              <p className="text-sm font-medium text-ink">AI-карьерный ассистент</p>
              <p className="text-xs text-muted">Будет доступен в следующей версии — анализирует ваш профиль и предлагает пути роста</p>
            </div>
            <span className="text-xs text-lavender font-medium ml-auto flex-shrink-0">Скоро</span>
          </div>
        </motion.div>
      )}

      {/* Recommendations tab */}
      {activeTab === 'recommendations' && (
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}>
          {recommendations.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-32 text-center">
              <div className="w-20 h-20 rounded-3xl bg-lavender-light flex items-center justify-center mb-6">
                <Zap className="w-10 h-10 text-lavender" />
              </div>
              <h3 className="font-heading font-semibold text-ink text-xl">Заполните профиль</h3>
              <p className="text-muted mt-2 max-w-sm">Добавьте навыки в профиль, чтобы мы подобрали подходящие вакансии</p>
              <button onClick={() => setActiveTab('profile')} className="btn-gradient mt-8">
                Заполнить профиль
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
              {recommendations.map((job: any, i: number) => (
                <JobCard key={job.id} job={job} index={i} />
              ))}
            </div>
          )}
        </motion.div>
      )}
    </div>
  )
}
