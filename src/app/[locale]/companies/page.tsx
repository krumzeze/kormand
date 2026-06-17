import { prisma } from '@/lib/prisma'
import { Link } from '@/i18n/navigation'
import { MapPin, Star, Briefcase, Globe } from 'lucide-react'

export default async function CompaniesPage() {
  const companies = await prisma.company.findMany({
    include: {
      _count: { select: { jobs: { where: { isActive: true } } } },
    },
    orderBy: { ratingAvg: 'desc' },
  })

  return (
    <div className="pt-28 pb-24 max-w-[1600px] mx-auto px-4 md:px-8">
      <div className="mb-10">
        <h1 className="font-heading font-bold text-ink" style={{ fontSize: 'clamp(1.8rem, 3vw, 2.5rem)' }}>
          Компании Таджикистана
        </h1>
        <p className="text-muted mt-2">{companies.length} работодателей на платформе</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {companies.map((company, i) => (
          <Link key={company.id} href={`/companies/${company.id}`} className="block group">
            <div className="p-1.5 rounded-3xl bg-black/[0.03] ring-1 ring-black/5 transition-all duration-500 group-hover:shadow-card-hover group-hover:-translate-y-1 group-hover:ring-sky-blue/20">
              <div className="rounded-[calc(1.5rem-0.375rem)] bg-white shadow-[inset_0_1px_1px_rgba(255,255,255,0.9)] p-6">
                <div className="w-14 h-14 rounded-2xl bg-sky-light text-sky-blue flex items-center justify-center text-xl font-bold font-heading mb-4">
                  {company.name[0]}
                </div>
                <h3 className="font-heading font-semibold text-ink text-lg group-hover:text-sky-blue transition-colors">{company.name}</h3>
                {company.industry && <p className="text-xs text-muted mt-1">{company.industry}</p>}
                {company.description && (
                  <p className="text-sm text-muted mt-3 line-clamp-2 leading-relaxed">{company.description}</p>
                )}
                <div className="flex items-center gap-4 mt-4 pt-4 border-t border-black/5">
                  <span className="flex items-center gap-1 text-xs text-muted">
                    <Star className="w-3.5 h-3.5 text-amber-400 fill-amber-400" />
                    {company.ratingAvg.toFixed(1)}
                  </span>
                  <span className="flex items-center gap-1 text-xs text-muted">
                    <Briefcase className="w-3.5 h-3.5 text-sky-blue" />
                    {company._count.jobs} вакансий
                  </span>
                  {company.city && (
                    <span className="flex items-center gap-1 text-xs text-muted ml-auto">
                      <MapPin className="w-3.5 h-3.5" />
                      {company.city}
                    </span>
                  )}
                </div>
              </div>
            </div>
          </Link>
        ))}
      </div>
    </div>
  )
}
