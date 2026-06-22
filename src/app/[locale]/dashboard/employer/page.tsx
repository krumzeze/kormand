import { auth } from '@/lib/auth'
import { redirect } from 'next/navigation'
import { prisma } from '@/lib/prisma'
import EmployerDashboard from '@/components/dashboard/EmployerDashboard'

export default async function EmployerPage({ params }: { params: { locale: string } }) {
  const session = await auth()
  if (!session || session.user.role !== 'EMPLOYER') {
    redirect(`/${params.locale}/auth/login`)
  }

  const company = await prisma.company.findUnique({
    where: { ownerId: session.user.id },
    include: {
      jobs: {
        orderBy: { createdAt: 'desc' },
        include: {
          _count: { select: { applications: true } },
          applications: {
            include: {
              user: { select: { id: true, name: true, email: true, phone: true, phoneVerifiedAt: true, avatarUrl: true } },
            },
            orderBy: { createdAt: 'desc' },
          },
        },
      },
    },
  })

  const totalViews = company?.jobs.reduce((sum, j) => sum + j.views, 0) || 0
  const totalApplications = company?.jobs.reduce((sum, j) => sum + j._count.applications, 0) || 0

  return (
    <div className="pt-28 pb-24">
      <EmployerDashboard
        company={company as any}
        totalViews={totalViews}
        totalApplications={totalApplications}
        locale={params.locale}
      />
    </div>
  )
}
