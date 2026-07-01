'use client'

import { motion } from 'framer-motion'
import { Link } from '@/i18n/navigation'
import { MapPin, Eye, Clock, ArrowUpRight, ExternalLink } from 'lucide-react'
import Badge from '@/components/ui/Badge'
import { formatSalary, timeAgo } from '@/lib/utils'
import type { Job } from '@prisma/client'

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

export default function ExternalJobCard({ job, index = 0 }: { job: Job; index?: number }) {
  const salary = formatSalary(job.salaryMin, job.salaryMax, job.currency)

  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.05, duration: 0.5, ease: [0.32, 0.72, 0, 1] }}
    >
      <Link href={`/external-jobs/${job.id}`} className="block group">
        <div className="p-1.5 rounded-3xl bg-black/[0.03] ring-1 ring-black/5 transition-all duration-500 ease-[cubic-bezier(0.32,0.72,0,1)] group-hover:shadow-card-hover group-hover:-translate-y-1 group-hover:ring-sky-blue/20">
          <div className="rounded-[calc(1.5rem-0.375rem)] bg-white shadow-[inset_0_1px_1px_rgba(255,255,255,0.9)] p-5">
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0">
                <div className="flex items-center gap-1 text-xs text-muted">
                  <ExternalLink className="w-3 h-3" />
                  somon.tj
                </div>
                <h3 className="font-heading font-semibold text-ink text-base leading-tight mt-0.5 truncate group-hover:text-sky-blue transition-colors duration-300">
                  {job.title}
                </h3>
              </div>
              <div className="w-7 h-7 rounded-full bg-black/5 flex items-center justify-center flex-shrink-0 transition-all duration-300 group-hover:bg-sky-blue/10 group-hover:translate-x-0.5 group-hover:-translate-y-0.5">
                <ArrowUpRight className="w-3.5 h-3.5 text-muted group-hover:text-sky-blue transition-colors duration-300" />
              </div>
            </div>

            <div className="flex flex-wrap gap-2 mt-4">
              <Badge variant={typeColors[job.type] || 'sky'}>{typeLabels[job.type]}</Badge>
              <Badge variant="muted">{levelLabels[job.level]}</Badge>
              <Badge variant="muted">
                <MapPin className="w-3 h-3" />
                {job.city}
              </Badge>
              {job.category && <Badge variant="muted">{job.category}</Badge>}
            </div>

            <div className="flex items-center justify-between mt-4 pt-4 border-t border-black/[0.05]">
              {salary ? (
                <span className="text-sm font-semibold text-ink">{salary}</span>
              ) : (
                <span className="text-xs text-muted">Зарплата не указана</span>
              )}
              <div className="flex items-center gap-3">
                <div className="flex items-center gap-1 text-xs text-muted">
                  <Eye className="w-3 h-3" />
                  {job.views}
                </div>
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
