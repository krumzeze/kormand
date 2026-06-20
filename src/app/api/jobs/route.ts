import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { auth } from '@/lib/auth'
import { jobSchema } from '@/lib/validations'

export async function GET(req: NextRequest) {
  const { searchParams } = req.nextUrl
  const q = searchParams.get('q') || ''
  const city = searchParams.get('city') || ''
  const category = searchParams.get('category') || ''
  const type = searchParams.get('type') || ''
  const level = searchParams.get('level') || ''
  const salaryMin = searchParams.get('salaryMin') ? Number(searchParams.get('salaryMin')) : undefined
  const page = Number(searchParams.get('page') || '1')
  const limit = Number(searchParams.get('limit') || '12')
  const sort = searchParams.get('sort') || 'newest'
  const featured = searchParams.get('featured') === 'true'

  const where: any = { isActive: true, isBlocked: false }

  if (q) {
    where.OR = [
      { title: { contains: q, mode: 'insensitive' } },
      { description: { contains: q, mode: 'insensitive' } },
      { skills: { has: q } },
    ]
  }
  if (city) where.city = city
  if (category) where.category = category
  if (type) where.type = type
  if (level) where.level = level
  if (salaryMin) where.salaryMax = { gte: salaryMin }
  if (featured) where.isFeatured = true

  const orderBy: any =
    sort === 'salary' ? { salaryMax: 'desc' } : { createdAt: 'desc' }

  const [jobs, total] = await Promise.all([
    prisma.job.findMany({
      where,
      orderBy,
      skip: (page - 1) * limit,
      take: limit,
      include: {
        company: {
          select: { id: true, name: true, logoUrl: true, ratingAvg: true, cities: true, isVerified: true },
        },
        _count: { select: { applications: true } },
      },
    }),
    prisma.job.count({ where }),
  ])

  return NextResponse.json({ data: jobs, total, page, limit })
}

export async function POST(req: NextRequest) {
  const session = await auth()
  if (!session || session.user.role !== 'EMPLOYER') {
    return NextResponse.json({ error: 'FORBIDDEN' }, { status: 403 })
  }

  const body = await req.json()
  const parsed = jobSchema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 })
  }

  const company = await prisma.company.findUnique({
    where: { ownerId: session.user.id },
  })
  if (!company) {
    return NextResponse.json({ error: 'COMPANY_NOT_FOUND' }, { status: 404 })
  }

  const { skills, ...rest } = parsed.data
  const skillsArr = skills ? skills.split(',').map(s => s.trim()).filter(Boolean) : []

  const job = await prisma.job.create({
    data: { ...rest, skills: skillsArr, companyId: company.id },
    include: { company: { select: { name: true, logoUrl: true } } },
  })

  return NextResponse.json(job, { status: 201 })
}
