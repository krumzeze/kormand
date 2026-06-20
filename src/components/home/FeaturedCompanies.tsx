'use client'

import { motion } from 'framer-motion'
import { Link } from '@/i18n/navigation'
import { Star, Briefcase, ArrowUpRight } from 'lucide-react'
import type { Company } from '@prisma/client'

type CompanyWithCount = Company & { _count: { jobs: number } }

const ACCENT_COLORS = [
  { bg: '#EEF5FF', text: '#7FB3FF' },
  { bg: '#E6FAF8', text: '#4FD1C5' },
  { bg: '#F3F0FF', text: '#C7B6FF' },
  { bg: '#FFD3B620', text: '#FF9E80' },
  { bg: '#EEF5FF', text: '#7FB3FF' },
  { bg: '#E6FAF8', text: '#4FD1C5' },
]

interface FeaturedCompaniesProps {
  companies: CompanyWithCount[]
}

export default function FeaturedCompanies({ companies }: FeaturedCompaniesProps) {
  return (
    <section className="section-padding">
      <div className="container-wide">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12">
          <div>
            <motion.span
              initial={{ opacity: 0, x: -16 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              className="eyebrow bg-turquoise-light text-turquoise border border-turquoise/20 mb-4 inline-flex"
            >
              Работодатели
            </motion.span>
            <motion.h2
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.1 }}
              className="font-heading font-bold text-ink"
              style={{ fontSize: 'clamp(1.8rem, 3.5vw, 3rem)' }}
            >
              Лучшие компании
            </motion.h2>
          </div>
        </div>

        {/* Companies bento — varying sizes */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {companies.map((company, i) => {
            const colors = ACCENT_COLORS[i % ACCENT_COLORS.length]
            return (
              <motion.div
                key={company.id}
                initial={{ opacity: 0, y: 24 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.08, duration: 0.5, ease: [0.32, 0.72, 0, 1] }}
              >
                {/* Double bezel */}
                <Link href={`/companies/${company.id}`} className="block p-1.5 rounded-3xl bg-black/[0.03] ring-1 ring-black/5 group transition-all duration-500 hover:shadow-card-hover hover:-translate-y-1 hover:ring-sky-blue/20">
                  <div className="rounded-[calc(1.5rem-0.375rem)] bg-white shadow-[inset_0_1px_1px_rgba(255,255,255,0.9)] p-6">
                    <div className="flex items-start justify-between">
                      <div
                        className="w-14 h-14 rounded-2xl flex items-center justify-center text-xl font-bold font-heading"
                        style={{ background: colors.bg, color: colors.text }}
                      >
                        {company.logoUrl
                          ? <img src={company.logoUrl} alt={company.name} className="w-full h-full rounded-2xl object-cover" />
                          : company.name[0]
                        }
                      </div>
                      <div
                        className="w-8 h-8 rounded-full flex items-center justify-center transition-all duration-300 group-hover:translate-x-0.5 group-hover:-translate-y-0.5"
                        style={{ background: colors.bg }}
                      >
                        <ArrowUpRight className="w-4 h-4" style={{ color: colors.text }} />
                      </div>
                    </div>

                    <h3 className="font-heading font-semibold text-ink text-lg mt-4">{company.name}</h3>
                    {company.industry && <p className="text-xs text-muted mt-1">{company.industry}</p>}

                    <div className="flex items-center gap-4 mt-4 pt-4 border-t border-black/5">
                      <div className="flex items-center gap-1.5 text-xs text-muted">
                        <div className="w-5 h-5 rounded-full flex items-center justify-center" style={{ background: '#FFF9E6' }}>
                          <Star className="w-3 h-3 text-amber-400 fill-amber-400" />
                        </div>
                        {company.ratingAvg.toFixed(1)}
                      </div>
                      <div className="flex items-center gap-1.5 text-xs text-muted">
                        <div className="w-5 h-5 rounded-full flex items-center justify-center" style={{ background: colors.bg }}>
                          <Briefcase className="w-3 h-3" style={{ color: colors.text }} />
                        </div>
                        {company._count.jobs} вакансий
                      </div>
                      {company.cities?.length > 0 && (
                        <span className="text-xs text-muted ml-auto truncate max-w-[40%]">{company.cities.join(', ')}</span>
                      )}
                    </div>
                  </div>
                </Link>
              </motion.div>
            )
          })}
        </div>
      </div>
    </section>
  )
}
