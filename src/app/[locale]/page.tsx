import { prisma } from '@/lib/prisma'
import HeroSection from '@/components/home/HeroSection'
import StatsSection from '@/components/home/StatsSection'
import TrendingJobs from '@/components/home/TrendingJobs'
import FeaturedCompanies from '@/components/home/FeaturedCompanies'
import CTASection from '@/components/home/CTASection'

async function getHomeData() {
  const [jobCount, companyCount, featuredJobs, companies] = await Promise.all([
    prisma.job.count({ where: { isActive: true } }),
    prisma.company.count(),
    prisma.job.findMany({
      where: { isActive: true },
      orderBy: [{ isFeatured: 'desc' }, { createdAt: 'desc' }],
      take: 8,
      include: {
        company: { select: { id: true, name: true, logoUrl: true, ratingAvg: true, city: true } },
        _count: { select: { applications: true } },
      },
    }),
    prisma.company.findMany({
      take: 6,
      orderBy: { ratingAvg: 'desc' },
      include: { _count: { select: { jobs: { where: { isActive: true } } } } },
    }),
  ])

  return { jobCount, companyCount, featuredJobs, companies }
}

export default async function HomePage() {
  const { jobCount, companyCount, featuredJobs, companies } = await getHomeData()

  return (
    <>
      <HeroSection jobCount={jobCount} />
      <StatsSection jobCount={jobCount} companyCount={companyCount} />
      <TrendingJobs jobs={featuredJobs} />
      <FeaturedCompanies companies={companies} />
      <CTASection />
    </>
  )
}
