import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { auth } from '@/lib/auth'
import { jobSchema } from '@/lib/validations'

export async function GET(_: NextRequest, { params }: { params: { id: string } }) {
  const job = await prisma.job.findUnique({
    where: { id: params.id },
    include: {
      company: true,
      _count: { select: { applications: true } },
    },
  })

  if (!job) return NextResponse.json({ error: 'NOT_FOUND' }, { status: 404 })

  // Increment views
  await prisma.job.update({ where: { id: params.id }, data: { views: { increment: 1 } } })

  return NextResponse.json(job)
}

export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  const session = await auth()
  if (!session) return NextResponse.json({ error: 'UNAUTHORIZED' }, { status: 401 })

  const job = await prisma.job.findUnique({
    where: { id: params.id },
    include: { company: true },
  })
  if (!job) return NextResponse.json({ error: 'NOT_FOUND' }, { status: 404 })

  const isOwner = job.company.ownerId === session.user.id
  if (!isOwner && session.user.role !== 'ADMIN') {
    return NextResponse.json({ error: 'FORBIDDEN' }, { status: 403 })
  }

  const body = await req.json()
  const parsed = jobSchema.partial().safeParse(body)
  if (!parsed.success) return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 })

  const { skills, isActive, ...rest } = body
  const data: any = { ...rest }
  if (skills !== undefined) data.skills = skills.split(',').map((s: string) => s.trim()).filter(Boolean)
  if (isActive !== undefined) data.isActive = isActive

  const updated = await prisma.job.update({ where: { id: params.id }, data })
  return NextResponse.json(updated)
}

export async function DELETE(_: NextRequest, { params }: { params: { id: string } }) {
  const session = await auth()
  if (!session) return NextResponse.json({ error: 'UNAUTHORIZED' }, { status: 401 })

  const job = await prisma.job.findUnique({
    where: { id: params.id },
    include: { company: true },
  })
  if (!job) return NextResponse.json({ error: 'NOT_FOUND' }, { status: 404 })

  const isOwner = job.company.ownerId === session.user.id
  if (!isOwner && session.user.role !== 'ADMIN') {
    return NextResponse.json({ error: 'FORBIDDEN' }, { status: 403 })
  }

  await prisma.job.delete({ where: { id: params.id } })
  return NextResponse.json({ success: true })
}
