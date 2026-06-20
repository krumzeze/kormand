'use client'

import { useState } from 'react'
import { useTranslations } from 'next-intl'
import { Link } from '@/i18n/navigation'
import { ExternalLink } from 'lucide-react'
import Input from '@/components/ui/Input'
import Textarea from '@/components/ui/Textarea'
import ImageUpload from '@/components/settings/ImageUpload'
import { toast } from '@/components/ui/Toaster'

interface CompanyProfileFormProps {
  company: any
}

export default function CompanyProfileForm({ company }: CompanyProfileFormProps) {
  const t = useTranslations('settings.company')
  const [logoUrl, setLogoUrl] = useState<string | null>(company?.logoUrl ?? null)
  const [name, setName] = useState(company?.name ?? '')
  const [industry, setIndustry] = useState(company?.industry ?? '')
  const [cities, setCities] = useState<string>(company?.cities?.join(', ') ?? '')
  const [website, setWebsite] = useState(company?.website ?? '')
  const [description, setDescription] = useState(company?.description ?? '')
  const [saving, setSaving] = useState(false)

  const submit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (name.trim().length < 2) {
      toast(t('errors.name'), 'error')
      return
    }
    setSaving(true)
    try {
      const citiesArr = cities.split(',').map(c => c.trim()).filter(Boolean)
      const res = await fetch('/api/companies', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, industry, cities: citiesArr, website, description, logoUrl: logoUrl ?? '' }),
      })
      if (res.ok) {
        toast(t('success'), 'success')
      } else {
        const data = await res.json().catch(() => ({}))
        toast(data.error?.fieldErrors?.website ? t('errors.website') : t('errors.generic'), 'error')
      }
    } finally {
      setSaving(false)
    }
  }

  return (
    <form onSubmit={submit} className="flex flex-col gap-5">
      <div>
        <p className="text-sm font-medium text-ink/70 mb-2">{t('logo')}</p>
        <ImageUpload value={logoUrl} onChange={setLogoUrl} fallback={name?.[0]?.toUpperCase() || '?'} />
      </div>

      <Input label={t('name')} value={name} onChange={e => setName(e.target.value)} required />
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Input label={t('industry')} value={industry} onChange={e => setIndustry(e.target.value)} placeholder={t('industryPlaceholder')} />
        <div className="flex flex-col gap-1.5">
          <Input label={t('cities')} value={cities} onChange={e => setCities(e.target.value)} placeholder={t('citiesPlaceholder')} />
          <p className="text-xs text-muted">{t('citiesHint')}</p>
        </div>
      </div>
      <Input label={t('website')} type="url" value={website} onChange={e => setWebsite(e.target.value)} placeholder="https://example.tj" />
      <Textarea label={t('description')} value={description} onChange={e => setDescription(e.target.value)} rows={6} placeholder={t('descriptionPlaceholder')} />

      <div className="flex items-center gap-4 pt-1">
        <button type="submit" disabled={saving} className="btn-gradient justify-center">
          {t('submit')}
        </button>
        {company?.id && (
          <Link href={`/companies/${company.id}`} target="_blank"
            className="text-sm text-sky-blue hover:underline inline-flex items-center gap-1.5">
            <ExternalLink className="w-4 h-4" />
            {t('viewPublic')}
          </Link>
        )}
      </div>
    </form>
  )
}
