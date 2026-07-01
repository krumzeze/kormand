import { prisma } from '@/lib/prisma'
import { auth } from '@/lib/auth'
import JobsClient from '@/components/jobs/JobsClient'

interface SearchParams {
  q?: string
  city?: string
  category?: string
  type?: string
  level?: string
  salaryMin?: string
  page?: string
  sort?: string
  [key: string]: string | undefined
}

async function getJobs(params: SearchParams) {
  const {
    q = '', city = '', category = '', type = '',
    level = '', salaryMin, page = '1', sort = 'newest',
  } = params

  const pageNum = Number(page)
  const limit = 12

  const where: any = { isActive: true, isBlocked: false, source: null }
  if (q) {
    where.OR = [
      { title: { contains: q, mode: 'insensitive' } },
      { description: { contains: q, mode: 'insensitive' } },
    ]
  }
  if (city) where.city = city
  if (category) where.category = category
  if (type) where.type = type
  if (level) where.level = level
  if (salaryMin) where.salaryMax = { gte: Number(salaryMin) }

  const orderBy: any = sort === 'salary' ? { salaryMax: 'desc' } : { createdAt: 'desc' }

  const [jobs, total] = await Promise.all([
    prisma.job.findMany({
      where,
      orderBy,
      skip: (pageNum - 1) * limit,
      take: limit,
      include: {
        company: { select: { id: true, name: true, logoUrl: true, ratingAvg: true, cities: true, isVerified: true } },
        _count: { select: { applications: true } },
      },
    }),
    prisma.job.count({ where }),
  ])

  return { jobs, total, page: pageNum, limit }
}

export default async function JobsPage({ searchParams }: { searchParams: SearchParams }) {
  const { jobs, total, page, limit } = await getJobs(searchParams)
  const session = await auth()

  // Get candidate skills for match scoring
  let candidateSkills: string[] = []
  if (session?.user.role === 'CANDIDATE') {
    const profile = await prisma.candidateProfile.findUnique({
      where: { userId: session.user.id },
      select: { skills: true },
    })
    candidateSkills = profile?.skills || []
  }

  return (
    <div className="pt-28">
      <JobsClient
        initialJobs={jobs as any}
        total={total}
        page={page}
        limit={limit}
        searchParams={searchParams}
        candidateSkills={candidateSkills}
      />
    </div>
  )
}
