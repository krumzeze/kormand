'use client'

import { useState } from 'react'
import { useSession } from 'next-auth/react'
import { useTranslations } from 'next-intl'
import Input from '@/components/ui/Input'
import ImageUpload from '@/components/settings/ImageUpload'
import { toast } from '@/components/ui/Toaster'

interface AccountFormProps {
  user: any
}

export default function AccountForm({ user }: AccountFormProps) {
  const t = useTranslations('settings.account')
  const { update } = useSession()
  const [avatarUrl, setAvatarUrl] = useState<string | null>(user?.avatarUrl ?? null)
  const [name, setName] = useState(user?.name ?? '')
  const [saving, setSaving] = useState(false)

  const submit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (name.trim().length < 2) {
      toast(t('errors.name'), 'error')
      return
    }
    setSaving(true)
    try {
      const res = await fetch('/api/profile/account', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, avatarUrl: avatarUrl ?? '' }),
      })
      if (res.ok) {
        await update({ name, image: avatarUrl })
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
      <div>
        <p className="text-sm font-medium text-ink/70 mb-2">{t('avatar')}</p>
        <ImageUpload value={avatarUrl} onChange={setAvatarUrl} fallback={name?.[0]?.toUpperCase() || '?'} shape="circle" />
      </div>

      <Input label={t('name')} value={name} onChange={e => setName(e.target.value)} required />

      <button type="submit" disabled={saving} className="btn-gradient justify-center mt-1 w-fit">
        {t('submit')}
      </button>
    </form>
  )
}
