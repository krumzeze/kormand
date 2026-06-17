'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { useTranslations } from 'next-intl'
import { useRouter } from 'next/navigation'
import { Briefcase, Eye, Send, Building2, AlertCircle } from 'lucide-react'
import Input from '@/components/ui/Input'
import Textarea from '@/components/ui/Textarea'
import Select from '@/components/ui/Select'
import Button from '@/components/ui/Button'
import Badge from '@/components/ui/Badge'
import { CATEGORIES, CITIES } from '@/lib/utils'
import { toast } from '@/components/ui/Toaster'
import { cn } from '@/lib/utils'
import { Link } from '@/i18n/navigation'

const JOB_TYPES = [
  { value: 'FULL_TIME', label: 'Полная занятость' },
  { value: 'PART_TIME', label: 'Частичная занятость' },
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

interface PostJobClientProps {
  hasCompany: boolean
  locale: string
}

export default function PostJobClient({ hasCompany, locale }: PostJobClientProps) {
  const t = useTranslations('postJob')
  const router = useRouter()

  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [city, setCity] = useState('')
  const [category, setCategory] = useState('')
  const [type, setType] = useState('FULL_TIME')
  const [level, setLevel] = useState('MIDDLE')
  const [salaryMin, setSalaryMin] = useState('')
  const [salaryMax, setSalaryMax] = useState('')
  const [currency, setCurrency] = useState('TJS')
  const [skills, setSkills] = useState('')
  const [loading, setLoading] = useState(false)
  const [preview, setPreview] = useState(false)
  const [errors, setErrors] = useState<Record<string, string>>({})

  // Company setup first
  const [companyName, setCompanyName] = useState('')
  const [companyIndustry, setCompanyIndustry] = useState('')
  const [settingUpCompany, setSettingUpCompany] = useState(!hasCompany)
  const [savingCompany, setSavingCompany] = useState(false)

  const handleSaveCompany = async () => {
    if (!companyName.trim()) return
    setSavingCompany(true)
    try {
      const res = await fetch('/api/companies', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: companyName, industry: companyIndustry }),
      })
      if (res.ok) {
        setSettingUpCompany(false)
        toast('Профиль компании создан!', 'success')
      }
    } finally {
      setSavingCompany(false)
    }
  }

  const validate = () => {
    const e: Record<string, string> = {}
    if (!title.trim()) e.title = 'Укажите должность'
    if (description.length < 50) e.description = 'Описание слишком короткое (минимум 50 символов)'
    if (!city) e.city = 'Выберите город'
    if (!category) e.category = 'Выберите категорию'
    setErrors(e)
    return Object.keys(e).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!validate()) return
    setLoading(true)
    try {
      const res = await fetch('/api/jobs', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title, description, city, category, type, level,
          salaryMin: salaryMin ? Number(salaryMin) : undefined,
          salaryMax: salaryMax ? Number(salaryMax) : undefined,
          currency,
          skills,
        }),
      })
      if (res.ok) {
        const job = await res.json()
        toast(t('success'), 'success')
        router.push(`/${locale}/jobs/${job.id}`)
      } else {
        toast('Ошибка при публикации', 'error')
      }
    } finally {
      setLoading(false)
    }
  }

  if (settingUpCompany) {
    return (
      <div className="max-w-lg mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          className="p-1.5 rounded-4xl bg-black/[0.03] ring-1 ring-black/8"
        >
          <div className="rounded-[calc(2rem-0.375rem)] bg-white p-8">
            <div className="w-14 h-14 rounded-2xl bg-sky-light flex items-center justify-center mb-6">
              <Building2 className="w-7 h-7 text-sky-blue" />
            </div>
            <h2 className="font-heading font-bold text-ink text-2xl">Создайте профиль компании</h2>
            <p className="text-muted text-sm mt-2">Это нужно сделать один раз перед публикацией первой вакансии.</p>

            <div className="mt-8 flex flex-col gap-4">
              <Input label="Название компании" value={companyName} onChange={e => setCompanyName(e.target.value)} placeholder="TechAsia, Мой Бизнес..." required />
              <Input label="Отрасль" value={companyIndustry} onChange={e => setCompanyIndustry(e.target.value)} placeholder="IT, Маркетинг..." />
              <Button variant="gradient" onClick={handleSaveCompany} loading={savingCompany} className="w-full mt-2">
                Продолжить
              </Button>
            </div>
          </div>
        </motion.div>
      </div>
    )
  }

  return (
    <div className="max-w-3xl mx-auto px-4">
      {/* Header */}
      <div className="mb-10">
        <span className="eyebrow bg-sky-light text-sky-blue border border-sky-blue/20 mb-4 inline-flex">
          <Briefcase className="w-3 h-3" />
          Работодатель
        </span>
        <h1 className="font-heading font-bold text-ink" style={{ fontSize: 'clamp(1.8rem, 3vw, 2.5rem)' }}>
          {t('title')}
        </h1>
        <p className="text-muted mt-2">{t('subtitle')}</p>
      </div>

      {/* Preview toggle */}
      <div className="flex items-center gap-2 mb-6">
        <button
          onClick={() => setPreview(false)}
          className={cn('btn-secondary text-xs py-2 px-4', !preview && 'bg-ink text-bg border-ink')}
        >
          <Briefcase className="w-3.5 h-3.5" />
          Форма
        </button>
        <button
          onClick={() => setPreview(true)}
          className={cn('btn-secondary text-xs py-2 px-4', preview && 'bg-ink text-bg border-ink')}
        >
          <Eye className="w-3.5 h-3.5" />
          {t('preview')}
        </button>
      </div>

      {!preview ? (
        <motion.form
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          onSubmit={handleSubmit}
          className="p-1.5 rounded-3xl bg-black/[0.03] ring-1 ring-black/5"
        >
          <div className="rounded-[calc(1.5rem-0.375rem)] bg-white shadow-[inset_0_1px_1px_rgba(255,255,255,0.9)] p-8">
            <div className="flex flex-col gap-6">
              <Input
                label={t('jobTitle')}
                value={title}
                onChange={e => setTitle(e.target.value)}
                placeholder={t('jobTitlePlaceholder')}
                error={errors.title}
              />

              <Textarea
                label={t('description')}
                value={description}
                onChange={e => setDescription(e.target.value)}
                placeholder={t('descriptionPlaceholder')}
                rows={8}
                error={errors.description}
              />

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Select
                  label={t('category')}
                  value={category}
                  onChange={e => setCategory(e.target.value)}
                  options={CATEGORIES.map(c => ({ value: c, label: c }))}
                  placeholder="Выберите категорию"
                  error={errors.category}
                />
                <Select
                  label={t('city')}
                  value={city}
                  onChange={e => setCity(e.target.value)}
                  options={CITIES.map(c => ({ value: c, label: c }))}
                  placeholder="Выберите город"
                  error={errors.city}
                />
                <Select
                  label={t('type')}
                  value={type}
                  onChange={e => setType(e.target.value)}
                  options={JOB_TYPES}
                />
                <Select
                  label={t('level')}
                  value={level}
                  onChange={e => setLevel(e.target.value)}
                  options={LEVELS}
                />
              </div>

              {/* Salary */}
              <div>
                <label className="text-sm font-medium text-ink/70 mb-2 block">Зарплата (необязательно)</label>
                <div className="flex items-center gap-3">
                  <input
                    type="number"
                    value={salaryMin}
                    onChange={e => setSalaryMin(e.target.value)}
                    placeholder={t('salaryMin')}
                    className="flex-1 rounded-2xl border border-black/10 px-4 py-3 text-sm outline-none focus:border-sky-blue/50 focus:ring-2 focus:ring-sky-blue/20"
                  />
                  <span className="text-muted text-sm">–</span>
                  <input
                    type="number"
                    value={salaryMax}
                    onChange={e => setSalaryMax(e.target.value)}
                    placeholder={t('salaryMax')}
                    className="flex-1 rounded-2xl border border-black/10 px-4 py-3 text-sm outline-none focus:border-sky-blue/50 focus:ring-2 focus:ring-sky-blue/20"
                  />
                  <select
                    value={currency}
                    onChange={e => setCurrency(e.target.value)}
                    className="rounded-2xl border border-black/10 px-4 py-3 text-sm outline-none bg-white focus:border-sky-blue/50"
                  >
                    <option value="TJS">TJS</option>
                    <option value="USD">USD</option>
                  </select>
                </div>
              </div>

              <Input
                label={t('skills')}
                value={skills}
                onChange={e => setSkills(e.target.value)}
                placeholder={t('skillsPlaceholder')}
              />

              <Button type="submit" variant="gradient" size="lg" loading={loading} className="w-full mt-2">
                <Send className="w-4 h-4" />
                {t('publish')}
              </Button>
            </div>
          </div>
        </motion.form>
      ) : (
        // Preview card
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="p-1.5 rounded-3xl bg-black/[0.03] ring-1 ring-black/5">
          <div className="rounded-[calc(1.5rem-0.375rem)] bg-white p-8">
            <h2 className="font-heading font-bold text-ink text-2xl">{title || 'Название вакансии'}</h2>
            <div className="flex flex-wrap gap-2 mt-4">
              {type && <Badge variant="sky">{JOB_TYPES.find(j => j.value === type)?.label}</Badge>}
              {level && <Badge variant="muted">{LEVELS.find(l => l.value === level)?.label}</Badge>}
              {city && <Badge variant="muted">{city}</Badge>}
            </div>
            {description && (
              <div className="mt-6 text-sm text-muted leading-relaxed whitespace-pre-wrap">{description}</div>
            )}
            {skills && (
              <div className="flex flex-wrap gap-2 mt-6">
                {skills.split(',').map(s => s.trim()).filter(Boolean).map(s => (
                  <span key={s} className="skill-tag">{s}</span>
                ))}
              </div>
            )}
            {(salaryMin || salaryMax) && (
              <div className="mt-6 pt-6 border-t border-black/5">
                <span className="font-semibold text-ink">
                  {salaryMin && salaryMax ? `${salaryMin} – ${salaryMax} ${currency}` :
                   salaryMin ? `от ${salaryMin} ${currency}` : `до ${salaryMax} ${currency}`}
                </span>
              </div>
            )}
          </div>
        </motion.div>
      )}
    </div>
  )
}
