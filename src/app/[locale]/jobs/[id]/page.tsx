import { notFound } from 'next/navigation'
import { prisma } from '@/lib/prisma'
import { auth } from '@/lib/auth'
import JobDetailClient from '@/components/jobs/JobDetailClient'
import { calcMatchScore } from '@/lib/utils'

interface Props {
  params: { id: string; locale: string }
}

export default async function JobDetailPage({ params }: Props) {
  const job = await prisma.job.findUnique({
    where: { id: params.id },
    include: {
      company: true,
      _count: { select: { applications: true } },
    },
  })

  if (!job || !job.isActive || job.isBlocked) notFound()

  // Increment views
  await prisma.job.update({ where: { id: params.id }, data: { views: { increment: 1 } } })

  const session = await auth()

  let matchScore: number | undefined
  let alreadyApplied = false
  let candidateSkills: string[] = []

  if (session?.user.role === 'CANDIDATE') {
    const [profile, application] = await Promise.all([
      prisma.candidateProfile.findUnique({ where: { userId: session.user.id } }),
      prisma.application.findUnique({
        where: { jobId_userId: { jobId: job.id, userId: session.user.id } },
      }),
    ])
    candidateSkills = profile?.skills || []
    matchScore = calcMatchScore(job.skills, candidateSkills)
    alreadyApplied = !!application
  }

  // Similar jobs
  const similar = await prisma.job.findMany({
    where: {
      id: { not: job.id },
      category: job.category,
      isActive: true,
      isBlocked: false,
    },
    take: 3,
    include: {
      company: { select: { id: true, name: true, logoUrl: true, ratingAvg: true, city: true, isVerified: true } },
      _count: { select: { applications: true } },
    },
  })

  return (
    <div className="pt-28 pb-24">
      <JobDetailClient
        job={job as any}
        similar={similar as any}
        matchScore={matchScore}
        alreadyApplied={alreadyApplied}
        isLoggedIn={!!session}
        userRole={session?.user.role}
      />
    </div>
  )
}
