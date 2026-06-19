import { getTranslations } from 'next-intl/server'
import { prisma } from '@/lib/prisma'
import { Briefcase, Building2, Flag, Users } from 'lucide-react'

export default async function AdminDashboardPage() {
  const t = await getTranslations('admin')

  const [jobs, blockedJobs, companies, verifiedCompanies, openReports, users] = await Promise.all([
    prisma.job.count(),
    prisma.job.count({ where: { isBlocked: true } }),
    prisma.company.count(),
    prisma.company.count({ where: { isVerified: true } }),
    prisma.report.count({ where: { status: 'OPEN' } }),
    prisma.user.count(),
  ])

  const cards = [
    { icon: Briefcase, label: t('dashboard.jobs'), value: jobs, hint: `${blockedJobs} ${t('dashboard.blocked')}` },
    { icon: Building2, label: t('dashboard.companies'), value: companies, hint: `${verifiedCompanies} ${t('dashboard.verified')}` },
    { icon: Flag, label: t('dashboard.openReports'), value: openReports, hint: '' },
    { icon: Users, label: t('dashboard.users'), value: users, hint: '' },
  ]

  return (
    <div>
      <h1 className="font-heading font-bold text-ink text-2xl mb-6">{t('dashboard.title')}</h1>
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {cards.map(({ icon: Icon, label, value, hint }) => (
          <div key={label} className="p-1.5 rounded-3xl bg-black/[0.03] ring-1 ring-black/5">
            <div className="rounded-[calc(1.5rem-0.375rem)] bg-white shadow-[inset_0_1px_1px_rgba(255,255,255,0.9)] p-5">
              <Icon className="w-5 h-5 text-sky-blue mb-3" />
              <p className="font-heading font-bold text-ink text-3xl">{value}</p>
              <p className="text-xs text-muted mt-1">{label}</p>
              {hint && <p className="text-[11px] text-muted/70 mt-0.5">{hint}</p>}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
