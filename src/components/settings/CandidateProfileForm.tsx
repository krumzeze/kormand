'use client'

import { useState } from 'react'
import { useTranslations } from 'next-intl'
import Input from '@/components/ui/Input'
import Textarea from '@/components/ui/Textarea'
import Select from '@/components/ui/Select'
import { toast } from '@/components/ui/Toaster'

const LEVELS = ['INTERN', 'JUNIOR', 'MIDDLE', 'SENIOR', 'LEAD'] as const

interface CandidateProfileFormProps {
  profile: any
}

export default function CandidateProfileForm({ profile }: CandidateProfileFormProps) {
  const t = useTranslations('settings.candidate')
  const tl = useTranslations('jobs.level')

  const [headline, setHeadline] = useState(profile?.headline ?? '')
  const [about, setAbout] = useState(profile?.about ?? '')
  const [city, setCity] = useState(profile?.city ?? '')
  const [experienceLevel, setExperienceLevel] = useState(profile?.experienceLevel ?? '')
  const [skills, setSkills] = useState<string>(profile?.skills?.join(', ') ?? '')
  const [saving, setSaving] = useState(false)

  const submit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)
    try {
      const res = await fetch('/api/profile', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          headline,
          about,
          city,
          skills,
          ...(experienceLevel && { experienceLevel }),
        }),
      })
      if (res.ok) {
        toast(t('success'), 'success')
      } else {
        toast(t('errors.generic'), 'error')
      }
    } finally {
      setSaving(false)
    }
  }

  return (
    <form onSubmit={submit} className="flex flex-col gap-5">
      <p className="text-sm text-muted -mt-1">{t('viewHint')}</p>

      <Input label={t('headline')} value={headline} onChange={e => setHeadline(e.target.value)} placeholder={t('headlinePlaceholder')} />

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Input label={t('city')} value={city} onChange={e => setCity(e.target.value)} placeholder={t('cityPlaceholder')} />
        <Select
          label={t('experience')}
          placeholder={t('experiencePlaceholder')}
          value={experienceLevel}
          onChange={e => setExperienceLevel(e.target.value)}
          options={LEVELS.map(l => ({ value: l, label: tl(l) }))}
        />
      </div>

      <div className="flex flex-col gap-1.5">
        <Input label={t('skills')} value={skills} onChange={e => setSkills(e.target.value)} placeholder={t('skillsPlaceholder')} />
        <p className="text-xs text-muted">{t('skillsHint')}</p>
      </div>

      <Textarea label={t('about')} value={about} onChange={e => setAbout(e.target.value)} rows={6} placeholder={t('aboutPlaceholder')} />

      <button type="submit" disabled={saving} className="btn-gradient justify-center w-fit">
        {t('submit')}
      </button>
    </form>
  )
}
