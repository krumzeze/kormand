'use client'

import { useRef, useEffect, useState } from 'react'
import { motion, useInView } from 'framer-motion'
import { useTranslations } from 'next-intl'
import { Briefcase, Building2, MapPin, TrendingUp } from 'lucide-react'

function useCountUp(target: number, duration = 1800, inView = false) {
  const [value, setValue] = useState(0)
  useEffect(() => {
    if (!inView) return
    let start = 0
    const step = target / (duration / 16)
    const timer = setInterval(() => {
      start += step
      if (start >= target) { setValue(target); clearInterval(timer) }
      else setValue(Math.floor(start))
    }, 16)
    return () => clearInterval(timer)
  }, [target, duration, inView])
  return value
}

interface StatsSectionProps {
  jobCount: number
  companyCount: number
}

export default function StatsSection({ jobCount, companyCount }: StatsSectionProps) {
  const t = useTranslations('stats')
  const ref = useRef(null)
  const inView = useInView(ref, { once: true, margin: '-80px' })

  const jobs = useCountUp(jobCount, 1600, inView)
  const companies = useCountUp(companyCount, 1400, inView)
  const cities = useCountUp(6, 800, inView)
  const salary = useCountUp(1800, 1800, inView)

  const stats = [
    { icon: Briefcase, value: jobs, suffix: '+', label: t('jobs'), color: '#7FB3FF', bg: '#EEF5FF' },
    { icon: Building2, value: companies, suffix: '+', label: t('companies'), color: '#4FD1C5', bg: '#E6FAF8' },
    { icon: MapPin, value: cities, suffix: '', label: t('cities'), color: '#C7B6FF', bg: '#F3F0FF' },
    { icon: TrendingUp, value: salary, suffix: '$', label: t('avgSalary'), color: '#FF9E80', bg: '#FFD3B620', prefix: '~' },
  ]

  return (
    <section ref={ref} className="section-padding">
      <div className="container-wide">
        {/* Asymmetric layout — not a boring 4-in-a-row grid */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {stats.map((stat, i) => {
            const Icon = stat.icon
            return (
              <motion.div
                key={stat.label}
                initial={{ opacity: 0, y: 32 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1, duration: 0.6, ease: [0.32, 0.72, 0, 1] }}
                className={i === 0 ? 'lg:col-span-1' : ''}
              >
                {/* Double bezel card */}
                <div className="p-1.5 rounded-3xl bg-black/[0.03] ring-1 ring-black/5 h-full">
                  <div className="rounded-[calc(1.5rem-0.375rem)] bg-white shadow-[inset_0_1px_1px_rgba(255,255,255,0.9)] p-6 h-full flex flex-col">
                    <div className="w-10 h-10 rounded-2xl flex items-center justify-center mb-4" style={{ background: stat.bg }}>
                      <Icon className="w-5 h-5" style={{ color: stat.color }} />
                    </div>
                    <div className="font-heading font-bold text-ink leading-none" style={{ fontSize: 'clamp(1.8rem, 4vw, 2.8rem)' }}>
                      {stat.prefix}{stat.value.toLocaleString('ru-RU')}{stat.suffix}
                    </div>
                    <p className="text-sm text-muted mt-2">{stat.label}</p>
                  </div>
                </div>
              </motion.div>
            )
          })}
        </div>
      </div>
    </section>
  )
}
