import { getTranslations } from 'next-intl/server'
import { prisma } from '@/lib/prisma'
import AdminReportsTable from '@/components/admin/AdminReportsTable'

export default async function AdminReportsPage() {
  const t = await getTranslations('admin')
  const reports = await prisma.report.findMany({
    orderBy: [{ status: 'asc' }, { createdAt: 'desc' }],
    include: {
      reporter: { select: { name: true } },
      job: { select: { id: true, title: true } },
      company: { select: { id: true, name: true } },
    },
  })

  return (
    <div>
      <h1 className="font-heading font-bold text-ink text-2xl mb-6">{t('nav.reports')}</h1>
      <AdminReportsTable
        reports={reports.map(r => ({
          id: r.id,
          target: r.target,
          status: r.status,
          reason: r.reason,
          details: r.details,
          reporter: r.reporter.name,
          createdAt: r.createdAt.toISOString(),
          subjectId: r.target === 'JOB' ? r.job?.id ?? null : r.company?.id ?? null,
          subjectName: r.target === 'JOB' ? r.job?.title ?? null : r.company?.name ?? null,
        }))}
      />
    </div>
  )
}
