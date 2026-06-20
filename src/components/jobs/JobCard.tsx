'use client'

import { motion } from 'framer-motion'
import { Link, useRouter } from '@/i18n/navigation'
import { useTranslations } from 'next-intl'
import { MapPin, Star, Eye, Clock, ArrowUpRight, Zap } from 'lucide-react'
import Badge from '@/components/ui/Badge'
import VerifiedBadge from '@/components/VerifiedBadge'
import { formatSalary, timeAgo } from '@/lib/utils'
import { cn } from '@/lib/utils'
import type { Job, Company } from '@prisma/client'

type JobWithCompany = Job & {
  company: Pick<Company, 'id' | 'name' | 'logoUrl' | 'ratingAvg' | 'cities'> & { isVerified?: boolean }
  _count?: { applications: number }
  matchScore?: number
}

const typeColors: Record<string, 'sky' | 'turquoise' | 'lavender' | 'peach' | 'coral'> = {
  FULL_TIME: 'sky',
  PART_TIME: 'turquoise',
  CONTRACT: 'lavender',
  INTERNSHIP: 'peach',
  REMOTE: 'coral',
}

const levelLabels: Record<string, string> = {
  INTERN: 'Стажёр', JUNIOR: 'Junior', MIDDLE: 'Middle', SENIOR: 'Senior', LEAD: 'Lead',
}

const typeLabels: Record<string, string> = {
  FULL_TIME: 'Полная', PART_TIME: 'Частичная', CONTRACT: 'Контракт',
  INTERNSHIP: 'Стажировка', REMOTE: 'Удалённо',
}

interface JobCardProps {
  job: JobWithCompany
  index?: number
  compact?: boolean
}

export default function JobCard({ job, index = 0, compact = false }: JobCardProps) {
  const t = useTranslations('jobs')
  const router = useRouter()
  const salary = formatSalary(job.salaryMin, job.salaryMax, job.currency)

  // Карточка целиком — ссылка на вакансию; имя компании ведёт на её профиль,
  // поэтому гасим всплытие, чтобы не сработал внешний <Link>.
  const openCompany = (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    router.push(`/companies/${job.company.id}`)
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.05, duration: 0.5, ease: [0.32, 0.72, 0, 1] }}
    >
      <Link href={`/jobs/${job.id}`} className="block group">
        {/* Outer bezel */}
        <div className="p-1.5 rounded-3xl bg-black/[0.03] ring-1 ring-black/5 transition-all duration-500 ease-[cubic-bezier(0.32,0.72,0,1)] group-hover:shadow-card-hover group-hover:-translate-y-1 group-hover:ring-sky-blue/20">
          {/* Inner card */}
          <div className="rounded-[calc(1.5rem-0.375rem)] bg-white shadow-[inset_0_1px_1px_rgba(255,255,255,0.9)] p-5">
            <div className="flex items-start justify-between gap-3">
              {/* Company logo */}
              <div className="flex items-center gap-3 min-w-0">
                <div
                  className="w-11 h-11 rounded-2xl flex-shrink-0 flex items-center justify-center text-white font-bold text-sm"
                  style={{ background: 'linear-gradient(135deg, #7FB3FF22 0%, #4FD1C522 100%)', border: '1px solid rgba(127,179,255,0.2)' }}
                >
                  {job.company.logoUrl ? (
                    <img src={job.company.logoUrl} alt={job.company.name} className="w-full h-full rounded-2xl object-cover" />
                  ) : (
                    <span className="text-sky-blue">{job.company.name[0]}</span>
                  )}
                </div>
                <div className="min-w-0">
                  <div className="flex items-center gap-1">
                    <span
                      role="link"
                      tabIndex={0}
                      onClick={openCompany}
                      onKeyDown={e => { if (e.key === 'Enter') openCompany(e as any) }}
                      className="text-xs text-muted truncate hover:text-sky-blue hover:underline cursor-pointer"
                    >
                      {job.company.name}
                    </span>
                    {job.company.isVerified && <VerifiedBadge />}
                  </div>
                  <h3 className="font-heading font-semibold text-ink text-base leading-tight mt-0.5 truncate group-hover:text-sky-blue transition-colors duration-300">
                    {job.title}
                  </h3>
                </div>
              </div>

              {/* Featured / arrow */}
              <div className="flex flex-col items-end gap-1.5 flex-shrink-0">
                {job.isFeatured && (
                  <Badge variant="lavender" dot>
                    <span className="hidden sm:inline">{t('featured')}</span>
                    <span className="sm:hidden">★</span>
                  </Badge>
                )}
                <div className="w-7 h-7 rounded-full bg-black/5 flex items-center justify-center transition-all duration-300 group-hover:bg-sky-blue/10 group-hover:translate-x-0.5 group-hover:-translate-y-0.5">
                  <ArrowUpRight className="w-3.5 h-3.5 text-muted group-hover:text-sky-blue transition-colors duration-300" />
                </div>
              </div>
            </div>

            {/* Tags */}
            <div className="flex flex-wrap gap-2 mt-4">
              <Badge variant={typeColors[job.type] || 'sky'}>{typeLabels[job.type]}</Badge>
              <Badge variant="muted">{levelLabels[job.level]}</Badge>
              <Badge variant="muted">
                <MapPin className="w-3 h-3" />
                {job.city}
              </Badge>
            </div>

            {/* Skills */}
            {!compact && job.skills.length > 0 && (
              <div className="flex flex-wrap gap-1.5 mt-3">
                {job.skills.slice(0, 4).map(skill => (
                  <span key={skill} className="skill-tag">{skill}</span>
                ))}
                {job.skills.length > 4 && (
                  <span className="skill-tag">+{job.skills.length - 4}</span>
                )}
              </div>
            )}

            {/* Bottom row */}
            <div className="flex items-center justify-between mt-4 pt-4 border-t border-black/[0.05]">
              <div className="flex flex-col gap-0.5">
                {salary ? (
                  <span className="text-sm font-semibold text-ink">{salary}</span>
                ) : (
                  <span className="text-xs text-muted">Зарплата не указана</span>
                )}
                {/* Salary bar */}
                {job.salaryMin && job.salaryMax && (
                  <div className="w-28 h-1 rounded-full bg-black/5 overflow-hidden">
                    <motion.div
                      className="h-full rounded-full"
                      style={{ background: 'linear-gradient(90deg, #7FB3FF 0%, #4FD1C5 100%)' }}
                      initial={{ width: 0 }}
                      animate={{ width: `${Math.min(100, (job.salaryMax / 5000) * 100)}%` }}
                      transition={{ delay: index * 0.05 + 0.3, duration: 0.8, ease: [0.32, 0.72, 0, 1] }}
                    />
                  </div>
                )}
              </div>

              <div className="flex items-center gap-3">
                {/* Match score */}
                {job.matchScore !== undefined && job.matchScore > 0 && (
                  <div className="flex items-center gap-1 text-xs text-turquoise font-medium">
                    <Zap className="w-3 h-3" />
                    {job.matchScore}%
                  </div>
                )}
                {/* Rating */}
                <div className="flex items-center gap-1 text-xs text-muted">
                  <Star className="w-3 h-3 text-amber-400 fill-amber-400" />
                  {job.company.ratingAvg.toFixed(1)}
                </div>
                {/* Views */}
                <div className="flex items-center gap-1 text-xs text-muted">
                  <Eye className="w-3 h-3" />
                  {job.views}
                </div>
                {/* Date */}
                <div className="flex items-center gap-1 text-xs text-muted">
                  <Clock className="w-3 h-3" />
                  {timeAgo(job.createdAt)}
                </div>
              </div>
            </div>
          </div>
        </div>
      </Link>
    </motion.div>
  )
}
