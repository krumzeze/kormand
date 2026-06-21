'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Badge from '@/components/ui/Badge'
import { toast } from '@/components/ui/Toaster'

const STATUS_CONFIG = {
  SENT: { label: 'Отправлен', variant: 'muted' as const },
  VIEWED: { label: 'Просмотрен', variant: 'sky' as const },
  INTERVIEW: { label: 'Собеседование', variant: 'turquoise' as const },
  REJECTED: { label: 'Отказ', variant: 'danger' as const },
  ACCEPTED: { label: 'Принят', variant: 'success' as const },
}

export default function ApplicantStatusSelect({ appId, status }: { appId: string; status: string }) {
  const router = useRouter()
  const [value, setValue] = useState(status)
  const [saving, setSaving] = useState(false)

  const update = async (next: string) => {
    setSaving(true)
    setValue(next)
    try {
      const res = await fetch(`/api/applications/${appId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: next }),
      })
      if (res.ok) {
        toast('Статус обновлён', 'success')
        router.refresh()
      } else {
        setValue(status)
        toast('Не удалось обновить статус', 'error')
      }
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="flex items-center gap-3">
      <Badge variant={STATUS_CONFIG[value as keyof typeof STATUS_CONFIG].variant} dot>
        {STATUS_CONFIG[value as keyof typeof STATUS_CONFIG].label}
      </Badge>
      <select
        value={value}
        disabled={saving}
        onChange={e => update(e.target.value)}
        className="text-sm text-ink rounded-xl border border-black/10 px-3 py-2 outline-none bg-white focus:border-sky-blue/50 cursor-pointer"
      >
        {Object.entries(STATUS_CONFIG).map(([k, v]) => (
          <option key={k} value={k}>{v.label}</option>
        ))}
      </select>
    </div>
  )
}
