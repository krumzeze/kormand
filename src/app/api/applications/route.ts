import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { auth } from '@/lib/auth'
import { applicationSchema } from '@/lib/validations'
import { calcMatchScore } from '@/lib/utils'

export async function POST(req: NextRequest) {
  const session = await auth()
  if (!session || session.user.role !== 'CANDIDATE') {
    return NextResponse.json({ error: 'FORBIDDEN' }, { status: 403 })
  }

  const body = await req.json()
  const parsed = applicationSchema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 })
  }

  const { jobId, coverNote, resumeUrl } = parsed.data

  // Check job exists
  const job = await prisma.job.findUnique({ where: { id: jobId } })
  if (!job || !job.isActive || job.isBlocked) {
    return NextResponse.json({ error: 'JOB_NOT_FOUND' }, { status: 404 })
  }

  // Check duplicate
  const existing = await prisma.application.findUnique({
    where: { jobId_userId: { jobId, userId: session.user.id } },
  })
  if (existing) {
    return NextResponse.json({ error: 'ALREADY_APPLIED' }, { status: 409 })
  }

  // Calculate match score
  const candidateProfile = await prisma.candidateProfile.findUnique({
    where: { userId: session.user.id },
  })
  const matchScore = candidateProfile
    ? calcMatchScore(job.skills, candidateProfile.skills)
    : null

  const application = await prisma.application.create({
    data: { jobId, userId: session.user.id, coverNote, resumeUrl: resumeUrl || null, matchScore },
    include: { job: { select: { title: true } } },
  })

  return NextResponse.json(application, { status: 201 })
}

export async function GET(req: NextRequest) {
  const session = await auth()
  if (!session) return NextResponse.json({ error: 'UNAUTHORIZED' }, { status: 401 })

  const { searchParams } = req.nextUrl
  const jobId = searchParams.get('jobId')

  if (session.user.role === 'CANDIDATE') {
    // Return my applications
    const apps = await prisma.application.findMany({
      where: { userId: session.user.id },
      include: {
        job: {
          include: {
            company: { select: { name: true, logoUrl: true } },
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    })
    return NextResponse.json(apps)
  }

  if (session.user.role === 'EMPLOYER') {
    // Return applications for employer's jobs
    const company = await prisma.company.findUnique({
      where: { ownerId: session.user.id },
    })
    if (!company) return NextResponse.json([])

    const where: any = { job: { companyId: company.id } }
    if (jobId) where.jobId = jobId

    const apps = await prisma.application.findMany({
      where,
      include: {
        user: { select: { id: true, name: true, email: true, phone: true, avatarUrl: true } },
        job: { select: { title: true } },
      },
      orderBy: { createdAt: 'desc' },
    })
    return NextResponse.json(apps)
  }

  return NextResponse.json([])
}
