import { notFound } from 'next/navigation'
import { prisma } from '@/lib/prisma'
import { auth } from '@/lib/auth'
import ExternalJobCard from '@/components/jobs/ExternalJobCard'

export const dynamic = 'force-dynamic'

async function getExternalJobs() {
  return prisma.job.findMany({
    where: { source: 'somon', isActive: true, isBlocked: false },
    orderBy: { createdAt: 'desc' },
    take: 60,
  })
}

export default async function ExternalJobsPage() {
  // Витрина импорта somon.tj временно доступна только владельцу (см. правила somon).
  const session = await auth()
  if (!session?.user.isRoot) notFound()

  const jobs = await getExternalJobs()

  return (
    <div className="pt-28 pb-20 max-w-6xl mx-auto px-4">
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
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {jobs.map((job, i) => (
            <ExternalJobCard key={job.id} job={job} index={i} />
          ))}
        </div>
      )}
    </div>
  )
}
