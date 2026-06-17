import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { auth } from '@/lib/auth'
import { candidateProfileSchema } from '@/lib/validations'

export async function GET() {
  const session = await auth()
  if (!session) return NextResponse.json({ error: 'UNAUTHORIZED' }, { status: 401 })

  if (session.user.role === 'CANDIDATE') {
    const profile = await prisma.candidateProfile.findUnique({
      where: { userId: session.user.id },
    })
    return NextResponse.json(profile)
  }

  if (session.user.role === 'EMPLOYER') {
    const company = await prisma.company.findUnique({
      where: { ownerId: session.user.id },
      include: { _count: { select: { jobs: true } } },
    })
    return NextResponse.json(company)
  }

  return NextResponse.json(null)
}

export async function PATCH(req: NextRequest) {
  const session = await auth()
  if (!session || session.user.role !== 'CANDIDATE') {
    return NextResponse.json({ error: 'FORBIDDEN' }, { status: 403 })
  }

  const body = await req.json()
  const parsed = candidateProfileSchema.safeParse(body)
  if (!parsed.success) return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 })

  const { skills, ...rest } = parsed.data
  const skillsArr = skills ? skills.split(',').map(s => s.trim()).filter(Boolean) : undefined

  const profile = await prisma.candidateProfile.upsert({
    where: { userId: session.user.id },
    update: { ...rest, ...(skillsArr && { skills: skillsArr }) },
    create: { userId: session.user.id, ...rest, skills: skillsArr || [] },
  })

  return NextResponse.json(profile)
}
