import { auth } from '@/lib/auth'
import { redirect } from 'next/navigation'
import { prisma } from '@/lib/prisma'
import CandidateDashboard from '@/components/dashboard/CandidateDashboard'

export default async function CandidatePage({ params }: { params: { locale: string } }) {
  const session = await auth()
  if (!session || session.user.role !== 'CANDIDATE') {
    redirect(`/${params.locale}/auth/login`)
  }

  const [profile, applications, user] = await Promise.all([
    prisma.candidateProfile.findUnique({ where: { userId: session.user.id } }),
    prisma.application.findMany({
      where: { userId: session.user.id },
      include: {
        job: {
          include: {
            company: { select: { name: true, logoUrl: true } },
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    }),
    prisma.user.findUnique({
      where: { id: session.user.id },
      select: { name: true, email: true, phone: true },
    }),
  ])

  // Recommendations: jobs matching skills
  const recommendations = profile?.skills?.length
    ? await prisma.job.findMany({
        where: {
          isActive: true,
          isBlocked: false,
          skills: { hasSome: profile.skills },
        },
        take: 4,
        orderBy: { createdAt: 'desc' },
        include: {
          company: { select: { id: true, name: true, logoUrl: true, ratingAvg: true, city: true, isVerified: true } },
          _count: { select: { applications: true } },
        },
      })
    : []

  return (
    <div className="pt-28 pb-24">
      <CandidateDashboard
        profile={profile}
        applications={applications as any}
        recommendations={recommendations as any}
        user={user!}
      />
    </div>
  )
}
