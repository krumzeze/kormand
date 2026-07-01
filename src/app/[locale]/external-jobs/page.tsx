import { prisma } from '@/lib/prisma'
import { formatSalary, timeAgo } from '@/lib/utils'
import { MapPin, ArrowUpRight, ExternalLink } from 'lucide-react'

export const dynamic = 'force-dynamic'

async function getExternalJobs() {
  return prisma.job.findMany({
    where: { source: 'somon', isActive: true, isBlocked: false },
    orderBy: { createdAt: 'desc' },
    take: 60,
  })
}

export default async function ExternalJobsPage() {
  const jobs = await getExternalJobs()

  return (
    <div className="pt-28 pb-20 max-w-4xl mx-auto px-4">
      <div className="mb-8">
        <h1 className="font-heading text-2xl font-bold text-ink">Вакансии с somon.tj</h1>
        <p className="text-sm text-muted mt-2">
          Экспериментальная витрина. Объявления импортированы с somon.tj и обновляются
          автоматически. Отклик оформляется на оригинальной странице источника.
        </p>
      </div>

      {jobs.length === 0 ? (
        <p className="text-muted">Пока нет импортированных вакансий.</p>
      ) : (
        <div className="grid gap-3">
          {jobs.map(job => {
            const salary = formatSalary(job.salaryMin, job.salaryMax, job.currency)
            return (
              <a
                key={job.id}
                href={job.sourceUrl ?? '#'}
                target="_blank"
                rel="nofollow noopener noreferrer"
                className="group block rounded-2xl bg-white ring-1 ring-black/5 p-5 transition-all hover:-translate-y-0.5 hover:ring-sky-blue/20 hover:shadow-card-hover"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <div className="flex items-center gap-1.5 text-xs text-muted">
                      <ExternalLink className="w-3 h-3" />
                      somon.tj
                    </div>
                    <h3 className="font-heading font-semibold text-ink text-base leading-tight mt-1 truncate group-hover:text-sky-blue transition-colors">
                      {job.title}
                    </h3>
                  </div>
                  <div className="w-7 h-7 rounded-full bg-black/5 flex items-center justify-center flex-shrink-0 transition-all group-hover:bg-sky-blue/10">
                    <ArrowUpRight className="w-3.5 h-3.5 text-muted group-hover:text-sky-blue" />
                  </div>
                </div>

                <div className="flex flex-wrap items-center gap-3 mt-3 text-xs text-muted">
                  <span className="inline-flex items-center gap-1">
                    <MapPin className="w-3 h-3" />
                    {job.city}
                  </span>
                  <span>{job.category}</span>
                  {salary && <span className="text-ink font-medium">{salary}</span>}
                  <span className="ml-auto">{timeAgo(job.createdAt)}</span>
                </div>
              </a>
            )
          })}
        </div>
      )}
    </div>
  )
}
