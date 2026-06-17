'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { X, Save } from 'lucide-react'
import Input from '@/components/ui/Input'
import Textarea from '@/components/ui/Textarea'
import Select from '@/components/ui/Select'
import Button from '@/components/ui/Button'
import { CATEGORIES, CITIES } from '@/lib/utils'
import { toast } from '@/components/ui/Toaster'

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

interface EditJobModalProps {
  job: any
  onClose: () => void
  onSaved: () => void
}

export default function EditJobModal({ job, onClose, onSaved }: EditJobModalProps) {
  const [title, setTitle] = useState(job.title)
  const [description, setDescription] = useState(job.description)
  const [city, setCity] = useState(job.city)
  const [category, setCategory] = useState(job.category)
  const [type, setType] = useState(job.type)
  const [level, setLevel] = useState(job.level)
  const [salaryMin, setSalaryMin] = useState(job.salaryMin?.toString() ?? '')
  const [salaryMax, setSalaryMax] = useState(job.salaryMax?.toString() ?? '')
  const [currency, setCurrency] = useState(job.currency)
  const [skills, setSkills] = useState((job.skills ?? []).join(', '))
  const [loading, setLoading] = useState(false)
  const [errors, setErrors] = useState<Record<string, string>>({})

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
      const res = await fetch(`/api/jobs/${job.id}`, {
        method: 'PATCH',
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
        toast('Вакансия обновлена', 'success')
        onSaved()
      } else {
        toast('Ошибка при сохранении', 'error')
      }
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto bg-ink/30 backdrop-blur-sm p-4 py-10">
      <motion.div
        initial={{ opacity: 0, y: 24, scale: 0.98 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.3, ease: [0.32, 0.72, 0, 1] }}
        className="w-full max-w-2xl p-1.5 rounded-3xl bg-black/[0.03] ring-1 ring-black/8"
        onClick={e => e.stopPropagation()}
      >
        <div className="rounded-[calc(1.5rem-0.375rem)] bg-white p-8">
          <div className="flex items-center justify-between mb-8">
            <h2 className="font-heading font-bold text-ink text-2xl">Редактировать вакансию</h2>
            <button
              onClick={onClose}
              className="w-9 h-9 rounded-xl flex items-center justify-center text-muted hover:text-ink hover:bg-black/5 transition-all"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <form onSubmit={handleSubmit} className="flex flex-col gap-6">
            <Input
              label="Должность"
              value={title}
              onChange={e => setTitle(e.target.value)}
              error={errors.title}
            />

            <Textarea
              label="Описание"
              value={description}
              onChange={e => setDescription(e.target.value)}
              rows={8}
              error={errors.description}
            />

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Select
                label="Категория"
                value={category}
                onChange={e => setCategory(e.target.value)}
                options={CATEGORIES.map(c => ({ value: c, label: c }))}
                placeholder="Выберите категорию"
                error={errors.category}
              />
              <Select
                label="Город"
                value={city}
                onChange={e => setCity(e.target.value)}
                options={CITIES.map(c => ({ value: c, label: c }))}
                placeholder="Выберите город"
                error={errors.city}
              />
              <Select
                label="Тип занятости"
                value={type}
                onChange={e => setType(e.target.value)}
                options={JOB_TYPES}
              />
              <Select
                label="Уровень"
                value={level}
                onChange={e => setLevel(e.target.value)}
                options={LEVELS}
              />
            </div>

            <div>
              <label className="text-sm font-medium text-ink/70 mb-2 block">Зарплата (необязательно)</label>
              <div className="flex items-center gap-3">
                <input
                  type="number"
                  value={salaryMin}
                  onChange={e => setSalaryMin(e.target.value)}
                  placeholder="От"
                  className="flex-1 rounded-2xl border border-black/10 px-4 py-3 text-sm outline-none focus:border-sky-blue/50 focus:ring-2 focus:ring-sky-blue/20"
                />
                <span className="text-muted text-sm">–</span>
                <input
                  type="number"
                  value={salaryMax}
                  onChange={e => setSalaryMax(e.target.value)}
                  placeholder="До"
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
              label="Навыки (через запятую)"
              value={skills}
              onChange={e => setSkills(e.target.value)}
              placeholder="React, TypeScript, ..."
            />

            <div className="flex items-center gap-3 mt-2">
              <Button type="submit" variant="gradient" loading={loading} className="flex-1">
                <Save className="w-4 h-4" />
                Сохранить
              </Button>
              <Button type="button" variant="secondary" onClick={onClose}>
                Отмена
              </Button>
            </div>
          </form>
        </div>
      </motion.div>
    </div>
  )
}
