'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { useRouter } from 'next/navigation'
import { useLocale, useTranslations } from 'next-intl'
import { Search, MapPin, Sparkles, ArrowRight } from 'lucide-react'
import { CITIES } from '@/lib/utils'

const FLOATING_CARDS = [
  { title: 'Senior React Dev', company: 'TechAsia', salary: '33 000–55 000 сом.', color: '#EEF5FF', accent: '#7FB3FF' },
  { title: 'DevOps Engineer', company: 'DushanbeSoft', salary: '27 000–44 000 сом.', color: '#E6FAF8', accent: '#4FD1C5' },
  { title: 'UI/UX Designer', company: 'TalentPlus', salary: '20 000–35 000 сом.', color: '#F3F0FF', accent: '#C7B6FF' },
]

interface HeroSectionProps {
  jobCount: number
}

export default function HeroSection({ jobCount }: HeroSectionProps) {
  const t = useTranslations('hero')
  const locale = useLocale()
  const router = useRouter()

  const [query, setQuery] = useState('')
  const [city, setCity] = useState('')

  const handleSearch = () => {
    const params = new URLSearchParams()
    if (query) params.set('q', query)
    if (city) params.set('city', city)
    router.push(`/${locale}/jobs?${params.toString()}`)
  }

  return (
    <section className="relative flex items-center overflow-hidden pt-28 pb-16 lg:min-h-[100dvh] lg:pt-24 lg:pb-0">
      {/* Mesh gradient background */}
      <div className="absolute inset-0 pointer-events-none" style={{ background: 'radial-gradient(at 30% 20%, #EEF5FF 0px, transparent 55%), radial-gradient(at 80% 10%, #F3F0FF 0px, transparent 50%), radial-gradient(at 10% 80%, #E6FAF8 0px, transparent 50%), radial-gradient(at 70% 80%, #FFD3B620 0px, transparent 50%)' }} />

      {/* Animated blobs */}
      <motion.div
        className="blob w-96 h-96 -top-20 -right-20"
        style={{ background: '#C7B6FF' }}
        animate={{ x: [0, 30, 0], y: [0, -20, 0] }}
        transition={{ duration: 12, repeat: Infinity, ease: 'easeInOut' }}
      />
      <motion.div
        className="blob w-72 h-72 bottom-10 left-10"
        style={{ background: '#7FB3FF' }}
        animate={{ x: [0, -22, 0], y: [0, 22, 0] }}
        transition={{ duration: 10, repeat: Infinity, ease: 'easeInOut', delay: 2 }}
      />
      <motion.div
        className="blob w-64 h-64 top-1/3 left-1/2"
        style={{ background: '#4FD1C5' }}
        animate={{ x: [0, 18, 0], y: [0, -14, 0] }}
        transition={{ duration: 14, repeat: Infinity, ease: 'easeInOut', delay: 4 }}
      />

      <div className="max-w-[1600px] mx-auto px-4 md:px-8 w-full py-16">
        <div className="grid lg:grid-cols-2 gap-12 items-center py-6 lg:py-16">
          {/* Left: content — pinned to its own GPU layer so the (otherwise
              demoted) Framer-animated text renders dark & crisp at rest, not
              washed-out gray. */}
          <div style={{ transform: 'translateZ(0)' }}>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, ease: [0.32, 0.72, 0, 1] }}
            >
              <span className="eyebrow bg-sky-light text-sky-blue border border-sky-blue/20 mb-6 inline-flex">
                <Sparkles className="w-3 h-3" />
                {t('badge')}
              </span>
            </motion.div>

            <motion.h1
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, delay: 0.1, ease: [0.32, 0.72, 0, 1] }}
              className="font-heading font-bold text-ink leading-[1.05] text-balance"
              style={{ fontSize: 'clamp(2.5rem, 6vw, 5rem)' }}
            >
              {t('title')}{' '}
              <span className="gradient-text">{t('titleAccent')}</span>
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2, ease: [0.32, 0.72, 0, 1] }}
              className="text-muted text-lg leading-relaxed mt-6 max-w-lg"
            >
              {t('subtitle')}
            </motion.p>

            {/* Search bar */}
            <motion.div
              initial={{ opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.3, ease: [0.32, 0.72, 0, 1] }}
              className="mt-10"
            >
              {/* Double-bezel search */}
              <div className="p-1.5 rounded-3xl bg-black/[0.04] ring-1 ring-black/8 shadow-glass">
                <div className="rounded-[calc(1.5rem-0.375rem)] bg-white shadow-[inset_0_1px_1px_rgba(255,255,255,0.9)] p-2">
                  <div className="flex flex-col sm:flex-row gap-2">
                    {/* Query input */}
                    <div className="flex items-center gap-2.5 flex-1 px-3 py-2.5 rounded-2xl hover:bg-black/[0.02] transition-colors">
                      <Search className="w-4 h-4 text-muted flex-shrink-0" />
                      <input
                        type="text"
                        placeholder={t('searchPlaceholder')}
                        value={query}
                        onChange={e => setQuery(e.target.value)}
                        onKeyDown={e => e.key === 'Enter' && handleSearch()}
                        className="flex-1 text-sm text-ink placeholder:text-muted outline-none bg-transparent"
                      />
                    </div>
                    {/* Divider */}
                    <div className="hidden sm:block w-px bg-black/8 my-1" />
                    {/* City select */}
                    <div className="flex items-center gap-2.5 px-3 py-2.5 rounded-2xl hover:bg-black/[0.02] transition-colors">
                      <MapPin className="w-4 h-4 text-muted flex-shrink-0" />
                      <select
                        value={city}
                        onChange={e => setCity(e.target.value)}
                        className="text-sm text-ink outline-none bg-transparent cursor-pointer"
                      >
                        <option value="">{t('cityPlaceholder')}</option>
                        {CITIES.map(c => <option key={c} value={c}>{c}</option>)}
                      </select>
                    </div>
                    {/* Search button */}
                    <button
                      onClick={handleSearch}
                      className="flex items-center justify-center gap-2 rounded-2xl px-6 py-3 text-sm font-medium text-white transition-all duration-500 ease-[cubic-bezier(0.32,0.72,0,1)] hover:shadow-glass hover:scale-[1.02] active:scale-[0.98]"
                      style={{ background: 'linear-gradient(135deg, #7FB3FF 0%, #4FD1C5 100%)' }}
                    >
                      {t('searchBtn')}
                      <div className="w-5 h-5 rounded-full bg-white/20 flex items-center justify-center">
                        <ArrowRight className="w-3 h-3" />
                      </div>
                    </button>
                  </div>
                </div>
              </div>

              {/* Hint */}
              <p className="text-xs text-muted mt-4 ml-2">
                {t('forEmployers')}{' '}
                <a href={`/${locale}/auth/register`} className="text-sky-blue font-medium hover:underline">
                  {t('postJob')}
                </a>
              </p>
            </motion.div>

            {/* Popular categories */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.5, duration: 0.5 }}
              className="flex flex-wrap gap-2 mt-8"
            >
              {['IT', 'Маркетинг', 'Финансы', 'Образование'].map((cat, i) => (
                <motion.a
                  key={cat}
                  href={`/${locale}/jobs?category=${cat}`}
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.5 + i * 0.07 }}
                  className="inline-flex items-center rounded-full px-4 py-1.5 text-xs font-medium bg-white/80 text-ink border border-black/8 hover:border-sky-blue/40 hover:text-sky-blue transition-all duration-300 hover:shadow-sm"
                >
                  {cat}
                </motion.a>
              ))}
            </motion.div>
          </div>

          {/* Right: floating job cards */}
          <motion.div
            initial={{ opacity: 0, x: 40 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, delay: 0.2, ease: [0.32, 0.72, 0, 1] }}
            className="relative hidden lg:flex justify-center items-center h-[600px]"
          >
            {FLOATING_CARDS.map((card, i) => (
              <motion.div
                key={card.title}
                className="absolute w-[340px] rounded-3xl p-7 shadow-glass-lg border border-white/80"
                style={{
                  background: `${card.color}f2`,
                  willChange: 'transform',
                  left: i === 0 ? '8%' : i === 1 ? '22%' : '3%',
                  top: i === 0 ? '5%' : i === 1 ? '38%' : '68%',
                  rotate: i === 0 ? '-3deg' : i === 1 ? '2deg' : '-1deg',
                  zIndex: 3 - i,
                }}
                animate={{ y: [0, -8 - i * 4, 0] }}
                transition={{ duration: 4 + i, repeat: Infinity, ease: 'easeInOut', delay: i * 1.2 }}
              >
                <div className="flex items-center gap-3.5 mb-4">
                  <div className="w-12 h-12 rounded-2xl flex items-center justify-center text-white font-bold text-base"
                    style={{ background: card.accent + '33', border: `1px solid ${card.accent}44` }}>
                    <span style={{ color: card.accent }}>{card.company[0]}</span>
                  </div>
                  <div>
                    <p className="text-sm text-muted">{card.company}</p>
                    <p className="text-base font-semibold text-ink">{card.title}</p>
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium" style={{ color: card.accent }}>{card.salary}</span>
                  <span className="text-xs text-muted bg-white/60 rounded-full px-2.5 py-1">Душанбе</span>
                </div>
              </motion.div>
            ))}

            {/* Central stat bubble */}
            <motion.div
              className="absolute w-40 h-40 rounded-full flex flex-col items-center justify-center shadow-glass-lg border border-white/80 z-10"
              style={{ background: 'rgba(252,251,249,0.96)', willChange: 'transform', right: '2%', top: '14%' }}
              animate={{ scale: [1, 1.04, 1] }}
              transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
            >
              <span className="font-heading font-bold text-4xl text-ink">{jobCount}+</span>
              <span className="text-xs text-muted text-center leading-tight mt-1">активных<br />вакансий</span>
            </motion.div>
          </motion.div>
        </div>
      </div>
    </section>
  )
}
