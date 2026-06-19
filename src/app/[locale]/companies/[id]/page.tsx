import { notFound } from 'next/navigation'
import { prisma } from '@/lib/prisma'
import { MapPin, Globe, Star, Briefcase } from 'lucide-react'
import JobCard from '@/components/jobs/JobCard'
import ReportButton from '@/components/ReportButton'
import VerifiedBadge from '@/components/VerifiedBadge'

export default async function CompanyPage({ params }: { params: { id: string } }) {
  const company = await prisma.company.findUnique({
    where: { id: params.id },
    include: {
      jobs: {
        where: { isActive: true, isBlocked: false },
        orderBy: { createdAt: 'desc' },
        include: {
          company: { select: { id: true, name: true, logoUrl: true, ratingAvg: true, city: true } },
          _count: { select: { applications: true } },
        },
      },
    },
  })

  if (!company || company.isBlocked) notFound()

  return (
    <div className="pt-28 pb-24 max-w-5xl mx-auto px-4 md:px-8">
      {/* Company header */}
      <div className="p-1.5 rounded-3xl bg-black/[0.03] ring-1 ring-black/5 mb-8">
        <div className="rounded-[calc(1.5rem-0.375rem)] bg-white shadow-[inset_0_1px_1px_rgba(255,255,255,0.9)] p-8">
          <div className="flex items-start gap-6">
            <div className="w-20 h-20 rounded-3xl flex items-center justify-center text-3xl font-bold font-heading bg-sky-light text-sky-blue flex-shrink-0">
              {company.logoUrl
                ? <img src={company.logoUrl} alt={company.name} className="w-full h-full rounded-3xl object-cover" />
                : company.name[0]
              }
            </div>
            <div className="flex-1">
              <div className="flex items-center gap-2">
                <h1 className="font-heading font-bold text-ink text-3xl">{company.name}</h1>
                {company.isVerified && <VerifiedBadge withLabel />}
              </div>
              {company.industry && <p className="text-muted mt-1">{company.industry}</p>}
              <div className="flex flex-wrap items-center gap-4 mt-4">
                {company.city && (
                  <span className="flex items-center gap-1.5 text-sm text-muted">
                    <MapPin className="w-4 h-4" /> {company.city}
                  </span>
                )}
                <span className="flex items-center gap-1.5 text-sm text-muted">
                  <Star className="w-4 h-4 text-amber-400 fill-amber-400" /> {company.ratingAvg.toFixed(1)}
                </span>
                <span className="flex items-center gap-1.5 text-sm text-muted">
                  <Briefcase className="w-4 h-4" /> {company.jobs.length} активных вакансий
                </span>
                {company.website && (
                  <a href={company.website} target="_blank" rel="noopener noreferrer"
                    className="flex items-center gap-1.5 text-sm text-sky-blue hover:underline">
                    <Globe className="w-4 h-4" /> Сайт компании
                  </a>
                )}
              </div>
            </div>
          </div>
          {company.description && (
            <p className="text-muted leading-relaxed mt-6 pt-6 border-t border-black/5">{company.description}</p>
          )}
          <div className="mt-6 pt-6 border-t border-black/5">
            <ReportButton target="COMPANY" companyId={company.id} />
          </div>
        </div>
      </div>

      {/* Jobs */}
      <h2 className="font-heading font-semibold text-ink text-xl mb-6">
        Открытые вакансии ({company.jobs.length})
      </h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {company.jobs.map((job, i) => (
          <JobCard key={job.id} job={job as any} index={i} />
        ))}
      </div>
    </div>
  )
}
