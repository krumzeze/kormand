import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { auth } from '@/lib/auth'
import { companyProfileSchema } from '@/lib/validations'

export async function GET() {
  const companies = await prisma.company.findMany({
    where: { isBlocked: false },
    include: {
      _count: { select: { jobs: { where: { isActive: true, isBlocked: false } } } },
    },
    orderBy: { ratingAvg: 'desc' },
  })
  return NextResponse.json(companies)
}

export async function POST(req: NextRequest) {
  const session = await auth()
  if (!session || session.user.role !== 'EMPLOYER') {
    return NextResponse.json({ error: 'FORBIDDEN' }, { status: 403 })
  }

  const body = await req.json()
  const parsed = companyProfileSchema.safeParse(body)
  if (!parsed.success) return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 })

  const existing = await prisma.company.findUnique({ where: { ownerId: session.user.id } })
  if (existing) {
    return NextResponse.json({ error: 'COMPANY_EXISTS' }, { status: 409 })
  }

  const company = await prisma.company.create({
    data: { ...parsed.data, ownerId: session.user.id },
  })
  return NextResponse.json(company, { status: 201 })
}

export async function PATCH(req: NextRequest) {
  const session = await auth()
  if (!session || session.user.role !== 'EMPLOYER') {
    return NextResponse.json({ error: 'FORBIDDEN' }, { status: 403 })
  }

  const body = await req.json()
  const parsed = companyProfileSchema.partial().safeParse(body)
  if (!parsed.success) return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 })

  const company = await prisma.company.upsert({
    where: { ownerId: session.user.id },
    update: parsed.data,
    create: { ...parsed.data as any, name: body.name || 'Моя компания', ownerId: session.user.id },
  })
  return NextResponse.json(company)
}
