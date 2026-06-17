'use client'

import { motion } from 'framer-motion'
import { useTranslations } from 'next-intl'
import { useLocale } from 'next-intl'
import { Link } from '@/i18n/navigation'
import JobCard from '@/components/jobs/JobCard'
import { ArrowRight } from 'lucide-react'
import type { Job, Company } from '@prisma/client'

type JobWithCompany = Job & {
  company: Pick<Company, 'id' | 'name' | 'logoUrl' | 'ratingAvg' | 'city'>
  _count: { applications: number }
}

interface TrendingJobsProps {
  jobs: JobWithCompany[]
}

export default function TrendingJobs({ jobs }: TrendingJobsProps) {
  const t = useTranslations()
  const locale = useLocale()

  return (
    <section className="section-padding bg-white/40">
      <div className="container-wide">
        {/* Section header — editorial asymmetric */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12">
          <div>
            <motion.span
              initial={{ opacity: 0, x: -16 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              className="eyebrow bg-lavender-light text-lavender border border-lavender/30 mb-4 inline-flex"
            >
              Популярные
            </motion.span>
            <motion.h2
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.1, duration: 0.6, ease: [0.32, 0.72, 0, 1] }}
              className="font-heading font-bold text-ink"
              style={{ fontSize: 'clamp(1.8rem, 3.5vw, 3rem)' }}
            >
              Горячие вакансии
            </motion.h2>
          </div>
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2 }}
          >
            <Link
              href="/jobs"
              className="group flex items-center gap-2 text-sm font-medium text-muted hover:text-ink transition-colors duration-300"
            >
              Все вакансии
              <div className="w-7 h-7 rounded-full bg-black/5 flex items-center justify-center transition-all duration-300 group-hover:bg-ink group-hover:text-bg">
                <ArrowRight className="w-3.5 h-3.5" />
              </div>
            </Link>
          </motion.div>
        </div>

        {/* Jobs grid — asymmetric bento */}
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {jobs.map((job, i) => (
            <JobCard key={job.id} job={job} index={i} />
          ))}
        </div>

        {/* Bottom CTA */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mt-12"
        >
          <Link href="/jobs" className="btn-gradient inline-flex">
            Смотреть все вакансии
            <div className="w-5 h-5 rounded-full bg-white/20 flex items-center justify-center">
              <ArrowRight className="w-3 h-3" />
            </div>
          </Link>
        </motion.div>
      </div>
    </section>
  )
}
