'use client'

import { useState, useCallback, useTransition } from 'react'
import { useRouter, usePathname } from 'next/navigation'
import { useLocale, useTranslations } from 'next-intl'
import { motion, AnimatePresence } from 'framer-motion'
import { Search, SlidersHorizontal, X, MapPin, Briefcase, ChevronLeft, ChevronRight } from 'lucide-react'
import JobCard from './JobCard'
import Badge from '@/components/ui/Badge'
import { CATEGORIES, CITIES, calcMatchScore } from '@/lib/utils'
import { cn } from '@/lib/utils'

const JOB_TYPES = [
  { value: 'FULL_TIME', label: 'Полная' },
  { value: 'PART_TIME', label: 'Частичная' },
  { value: 'CONTRACT', label: 'Контракт' },
  { value: 'INTERNSHIP', label: 'Стажировка' },
  { value: 'REMOTE', label: 'Удалённо' },
]

const LEVELS = [
  { value: 'INTERN', label: 'Стажёр' },
  { value: 'JUNIOR', label: 'Junior' },
  { value: 'MIDDLE', label: 'Middle' },
  { value: 'SENIOR', label: 'Senior' },
  { value: 'LEAD', label: 'Lead' },
]

interface JobsClientProps {
  initialJobs: any[]
  total: number
  page: number
  limit: number
  searchParams: Record<string, string | undefined>
  candidateSkills: string[]
}

export default function JobsClient({ initialJobs, total, page, limit, searchParams, candidateSkills }: JobsClientProps) {
  const t = useTranslations('jobs')
  const locale = useLocale()
  const router = useRouter()
  const pathname = usePathname()
  const [isPending, startTransition] = useTransition()

  const [filtersOpen, setFiltersOpen] = useState(false)

  // Local filter state
  const [q, setQ] = useState(searchParams.q || '')
  const [city, setCity] = useState(searchParams.city || '')
  const [category, setCategory] = useState(searchParams.category || '')
  const [type, setType] = useState(searchParams.type || '')
  const [level, setLevel] = useState(searchParams.level || '')
  const [sort, setSort] = useState(searchParams.sort || 'newest')

  const applyFilters = useCallback((overrides: Record<string, string> = {}) => {
    const params = new URLSearchParams()
    const merged = { q, city, category, type, level, sort, page: '1', ...overrides }
    Object.entries(merged).forEach(([k, v]) => { if (v) params.set(k, v) })
    startTransition(() => router.push(`${pathname}?${params.toString()}`))
  }, [q, city, category, type, level, sort, pathname, router])

  const clearFilters = () => {
    setQ(''); setCity(''); setCategory(''); setType(''); setLevel('')
    startTransition(() => router.push(pathname))
  }

  const goPage = (p: number) => {
    const params = new URLSearchParams(searchParams as Record<string, string>)
    params.set('page', String(p))
    startTransition(() => router.push(`${pathname}?${params.toString()}`))
  }

  const totalPages = Math.ceil(total / limit)
  const hasFilters = !!(searchParams.q || searchParams.city || searchParams.category || searchParams.type || searchParams.level)

  // Add match scores to jobs
  const jobsWithMatch = initialJobs.map(job => ({
    ...job,
    matchScore: candidateSkills.length > 0 ? calcMatchScore(job.skills, candidateSkills) : undefined,
  }))

  return (
    <div className="max-w-[1600px] mx-auto px-4 md:px-8 pb-24">
      {/* Header */}
      <div className="mb-8">
        <h1 className="font-heading font-bold text-ink" style={{ fontSize: 'clamp(1.8rem, 3vw, 2.5rem)' }}>
          {t('title')}
        </h1>
        <p className="text-muted mt-1">
          {total} {t('results')}
          {searchParams.q && <span> по запросу «{searchParams.q}»</span>}
        </p>
      </div>

      {/* Search bar + filter toggle */}
      <div className="sticky top-20 z-20 mb-8">
        <div className="p-1.5 rounded-3xl bg-black/[0.04] ring-1 ring-black/8 shadow-glass glass">
          <div className="rounded-[calc(1.5rem-0.375rem)] bg-white/90 shadow-[inset_0_1px_1px_rgba(255,255,255,0.9)] p-2">
            <div className="flex flex-col sm:flex-row gap-2">
              {/* Search */}
              <div className="flex items-center gap-2.5 flex-1 px-3 py-2">
                <Search className="w-4 h-4 text-muted flex-shrink-0" />
                <input
                  type="text"
                  placeholder={t('searchPlaceholder')}
                  value={q}
                  onChange={e => setQ(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && applyFilters({ q })}
                  className="flex-1 text-sm text-ink placeholder:text-muted outline-none bg-transparent"
                />
                {q && (
                  <button onClick={() => { setQ(''); applyFilters({ q: '' }) }}>
                    <X className="w-3.5 h-3.5 text-muted hover:text-ink transition-colors" />
                  </button>
                )}
              </div>

              {/* Divider */}
              <div className="hidden sm:block w-px bg-black/8 my-1" />

              {/* City */}
              <div className="flex items-center gap-2 px-3 py-2">
                <MapPin className="w-4 h-4 text-muted flex-shrink-0" />
                <select
                  value={city}
                  onChange={e => { setCity(e.target.value); applyFilters({ city: e.target.value }) }}
                  className="text-sm text-ink outline-none bg-transparent cursor-pointer"
                >
                  <option value="">{t('allCities')}</option>
                  {CITIES.map(c => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>

              {/* Sort */}
              <div className="hidden sm:block w-px bg-black/8 my-1" />
              <div className="flex items-center gap-2 px-3 py-2">
                <select
                  value={sort}
                  onChange={e => { setSort(e.target.value); applyFilters({ sort: e.target.value }) }}
                  className="text-sm text-ink outline-none bg-transparent cursor-pointer"
                >
                  <option value="newest">{t('sort.newest')}</option>
                  <option value="salary">{t('sort.salary')}</option>
                </select>
              </div>

              {/* Filters button */}
              <button
                onClick={() => setFiltersOpen(!filtersOpen)}
                className={cn(
                  'flex items-center gap-2 rounded-2xl px-4 py-2.5 text-sm font-medium transition-all duration-300',
                  filtersOpen || hasFilters
                    ? 'bg-ink text-bg'
                    : 'bg-black/5 text-ink hover:bg-black/8'
                )}
              >
                <SlidersHorizontal className="w-4 h-4" />
                {t('filters')}
                {hasFilters && <span className="w-1.5 h-1.5 rounded-full bg-sky-blue" />}
              </button>
            </div>
          </div>
        </div>

        {/* Expandable filters */}
        <AnimatePresence>
          {filtersOpen && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.3, ease: [0.32, 0.72, 0, 1] }}
              className="overflow-hidden"
            >
              <div className="mt-2 p-4 bg-white rounded-3xl border border-black/5 shadow-card">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  {/* Category */}
                  <div>
                    <label className="text-xs font-medium text-muted mb-2 block">{t('category')}</label>
                    <select
                      value={category}
                      onChange={e => setCategory(e.target.value)}
                      className="w-full text-sm text-ink rounded-xl border border-black/10 px-3 py-2 outline-none bg-white focus:border-sky-blue/50"
                    >
                      <option value="">{t('allCategories')}</option>
                      {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                    </select>
                  </div>

                  {/* Type */}
                  <div>
                    <label className="text-xs font-medium text-muted mb-2 block">{t('type.FULL_TIME').replace('Полная', 'Тип')}</label>
                    <select
                      value={type}
                      onChange={e => setType(e.target.value)}
                      className="w-full text-sm text-ink rounded-xl border border-black/10 px-3 py-2 outline-none bg-white focus:border-sky-blue/50"
                    >
                      <option value="">{t('allTypes')}</option>
                      {JOB_TYPES.map(jt => <option key={jt.value} value={jt.value}>{jt.label}</option>)}
                    </select>
                  </div>

                  {/* Level */}
                  <div>
                    <label className="text-xs font-medium text-muted mb-2 block">Уровень</label>
                    <select
                      value={level}
                      onChange={e => setLevel(e.target.value)}
                      className="w-full text-sm text-ink rounded-xl border border-black/10 px-3 py-2 outline-none bg-white focus:border-sky-blue/50"
                    >
                      <option value="">{t('allLevels')}</option>
                      {LEVELS.map(l => <option key={l.value} value={l.value}>{l.label}</option>)}
                    </select>
                  </div>

                  {/* Actions */}
                  <div className="flex items-end gap-2">
                    <button
                      onClick={() => applyFilters()}
                      className="flex-1 btn-gradient text-xs py-2.5 px-4"
                    >
                      Применить
                    </button>
                    {hasFilters && (
                      <button
                        onClick={clearFilters}
                        className="flex items-center gap-1 rounded-xl px-3 py-2.5 text-xs text-muted hover:text-ink border border-black/10 hover:border-black/20 transition-all"
                      >
                        <X className="w-3 h-3" />
                        Сбросить
                      </button>
                    )}
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Jobs grid */}
      <div className={cn('transition-opacity duration-300', isPending && 'opacity-50')}>
        {jobsWithMatch.length === 0 ? (
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex flex-col items-center justify-center py-32 text-center"
          >
            <div className="w-20 h-20 rounded-3xl bg-lavender-light flex items-center justify-center mb-6">
              <Briefcase className="w-10 h-10 text-lavender" />
            </div>
            <h3 className="font-heading font-semibold text-ink text-xl">{t('noResults')}</h3>
            <p className="text-muted mt-2 max-w-sm">{t('noResultsHint')}</p>
            {hasFilters && (
              <button onClick={clearFilters} className="btn-secondary mt-6">
                Сбросить фильтры
              </button>
            )}
          </motion.div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
            {jobsWithMatch.map((job, i) => (
              <JobCard key={job.id} job={job} index={i} />
            ))}
          </div>
        )}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-2 mt-12">
          <button
            onClick={() => goPage(page - 1)}
            disabled={page <= 1 || isPending}
            className="w-10 h-10 rounded-full flex items-center justify-center bg-white border border-black/10 hover:border-black/20 disabled:opacity-40 disabled:cursor-not-allowed transition-all"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>

          {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
            const p = page <= 3 ? i + 1 : page - 2 + i
            if (p < 1 || p > totalPages) return null
            return (
              <button
                key={p}
                onClick={() => goPage(p)}
                disabled={isPending}
                className={cn(
                  'w-10 h-10 rounded-full text-sm font-medium transition-all duration-300',
                  p === page
                    ? 'bg-ink text-bg'
                    : 'bg-white border border-black/10 text-ink hover:border-black/20'
                )}
              >
                {p}
              </button>
            )
          })}

          <button
            onClick={() => goPage(page + 1)}
            disabled={page >= totalPages || isPending}
            className="w-10 h-10 rounded-full flex items-center justify-center bg-white border border-black/10 hover:border-black/20 disabled:opacity-40 disabled:cursor-not-allowed transition-all"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      )}
    </div>
  )
}
