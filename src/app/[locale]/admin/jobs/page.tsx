import { getTranslations } from 'next-intl/server'
import { prisma } from '@/lib/prisma'
import AdminJobsTable from '@/components/admin/AdminJobsTable'

export default async function AdminJobsPage() {
  const t = await getTranslations('admin')
  const jobs = await prisma.job.findMany({
    orderBy: { createdAt: 'desc' },
    include: { company: { select: { name: true } } },
  })

  return (
    <div>
      <h1 className="font-heading font-bold text-ink text-2xl mb-6">{t('nav.jobs')}</h1>
      <AdminJobsTable
        jobs={jobs.map(j => ({
          id: j.id,
          title: j.title,
          company: j.company.name,
          city: j.city,
          isActive: j.isActive,
          isBlocked: j.isBlocked,
          blockReason: j.blockReason,
        }))}
      />
    </div>
  )
}
