'use client'

import { useState } from 'react'
import { useTranslations } from 'next-intl'
import Input from '@/components/ui/Input'
import { toast } from '@/components/ui/Toaster'

export default function PasswordForm() {
  const t = useTranslations('settings')
  const [current, setCurrent] = useState('')
  const [next, setNext] = useState('')
  const [confirm, setConfirm] = useState('')
  const [saving, setSaving] = useState(false)

  const submit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (next.length < 8) {
      toast(t('errors.min'), 'error')
      return
    }
    if (next !== confirm) {
      toast(t('errors.mismatch'), 'error')
      return
    }
    setSaving(true)
    try {
      const res = await fetch('/api/profile/password', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ currentPassword: current, newPassword: next }),
      })
      if (res.ok) {
        setCurrent('')
        setNext('')
        setConfirm('')
        toast(t('success'), 'success')
      } else {
        const data = await res.json().catch(() => ({}))
        toast(data.error === 'WRONG_PASSWORD' ? t('errors.wrongCurrent') : t('errors.generic'), 'error')
      }
    } finally {
      setSaving(false)
    }
  }

  return (
    <form onSubmit={submit} className="flex flex-col gap-4">
      <Input
        label={t('currentPassword')}
        type="password"
        autoComplete="current-password"
        value={current}
        onChange={e => setCurrent(e.target.value)}
        required
      />
      <Input
        label={t('newPassword')}
        type="password"
        autoComplete="new-password"
        value={next}
        onChange={e => setNext(e.target.value)}
        required
      />
      <Input
        label={t('confirmPassword')}
        type="password"
        autoComplete="new-password"
        value={confirm}
        onChange={e => setConfirm(e.target.value)}
        required
      />
      <button type="submit" disabled={saving} className="btn-gradient justify-center mt-2">
        {t('submit')}
      </button>
    </form>
  )
}
