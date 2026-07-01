import { notFound } from 'next/navigation'
import { prisma } from '@/lib/prisma'
import { Link } from '@/i18n/navigation'
import { formatSalary, timeAgo } from '@/lib/utils'
import { MapPin, Clock, Eye, ExternalLink, ArrowLeft } from 'lucide-react'
import Badge from '@/components/ui/Badge'

interface Props {
  params: { id: string; locale: string }
}

const levelLabels: Record<string, string> = {
  INTERN: 'Стажёр', JUNIOR: 'Junior', MIDDLE: 'Middle', SENIOR: 'Senior', LEAD: 'Lead',
}
const typeLabels: Record<string, string> = {
  FULL_TIME: 'Полная', PART_TIME: 'Частичная', CONTRACT: 'Контракт',
  INTERNSHIP: 'Стажировка', REMOTE: 'Удалённо',
}

export default async function ExternalJobDetailPage({ params }: Props) {
  const job = await prisma.job.findFirst({
    where: { id: params.id, source: 'somon', isActive: true, isBlocked: false },
  })

  if (!job) notFound()

  await prisma.job.update({ where: { id: job.id }, data: { views: { increment: 1 } } })

  const salary = formatSalary(job.salaryMin, job.salaryMax, job.currency)

  return (
    <div className="pt-28 pb-24 max-w-3xl mx-auto px-4">
      <Link href="/external-jobs" className="inline-flex items-center gap-1.5 text-sm text-muted hover:text-ink transition-colors mb-6">
        <ArrowLeft className="w-4 h-4" />
        К вакансиям с somon.tj
      </Link>

      <div className="p-1.5 rounded-3xl bg-black/[0.03] ring-1 ring-black/5">
        <div className="rounded-[calc(1.5rem-0.375rem)] bg-white p-6 md:p-8">
          <div className="flex items-center gap-1.5 text-xs text-muted">
            <ExternalLink className="w-3 h-3" />
            Источник: somon.tj
          </div>
          <h1 className="font-heading text-2xl font-bold text-ink mt-2">{job.title}</h1>

          <div className="flex flex-wrap gap-2 mt-4">
            <Badge variant="sky">{typeLabels[job.type]}</Badge>
            <Badge variant="muted">{levelLabels[job.level]}</Badge>
            <Badge variant="muted"><MapPin className="w-3 h-3" />{job.city}</Badge>
            {job.category && <Badge variant="muted">{job.category}</Badge>}
          </div>

          <div className="flex items-center gap-4 mt-4 text-sm">
            {salary ? (
              <span className="font-semibold text-ink">{salary}</span>
            ) : (
              <span className="text-muted">Зарплата не указана</span>
            )}
            <span className="flex items-center gap-1 text-xs text-muted"><Eye className="w-3 h-3" />{job.views}</span>
            <span className="flex items-center gap-1 text-xs text-muted"><Clock className="w-3 h-3" />{timeAgo(job.createdAt)}</span>
          </div>

          {job.description && (
            <div className="mt-6 pt-6 border-t border-black/[0.05]">
              <h2 className="font-heading font-semibold text-ink text-lg mb-3">Описание</h2>
              <p className="text-sm text-muted leading-relaxed whitespace-pre-line">{job.description}</p>
            </div>
          )}

          <div className="mt-8 pt-6 border-t border-black/[0.05]">
            <a
              href={job.sourceUrl ?? '#'}
              target="_blank"
              rel="nofollow noopener noreferrer"
              className="inline-flex items-center justify-center gap-2 rounded-full font-medium px-8 py-4 text-base text-white transition-all duration-500 ease-[cubic-bezier(0.32,0.72,0,1)] hover:scale-[1.02] hover:shadow-glass-lg"
              style={{ background: 'linear-gradient(135deg, #7FB3FF 0%, #4FD1C5 100%)' }}
            >
              Откликнуться на somon.tj
              <ExternalLink className="w-4 h-4" />
            </a>
            <p className="text-xs text-muted mt-3">
              Отклик и контакты работодателя — на оригинальной странице somon.tj. Мы лишь показываем объявление.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
