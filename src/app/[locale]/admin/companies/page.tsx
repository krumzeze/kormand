import { getTranslations } from 'next-intl/server'
import { prisma } from '@/lib/prisma'
import AdminCompaniesTable from '@/components/admin/AdminCompaniesTable'

export default async function AdminCompaniesPage() {
  const t = await getTranslations('admin')
  const companies = await prisma.company.findMany({
    orderBy: { createdAt: 'desc' },
    include: { _count: { select: { jobs: true } } },
  })

  return (
    <div>
      <h1 className="font-heading font-bold text-ink text-2xl mb-6">{t('nav.companies')}</h1>
      <AdminCompaniesTable
        companies={companies.map(c => ({
          id: c.id,
          name: c.name,
          city: c.city,
          jobs: c._count.jobs,
          isVerified: c.isVerified,
          isBlocked: c.isBlocked,
          blockReason: c.blockReason,
        }))}
      />
    </div>
  )
}
