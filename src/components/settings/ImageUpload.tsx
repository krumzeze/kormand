'use client'

import { useRef, useState } from 'react'
import { useTranslations } from 'next-intl'
import { Upload, Loader2, X } from 'lucide-react'
import { cn } from '@/lib/utils'
import { toast } from '@/components/ui/Toaster'

interface ImageUploadProps {
  value?: string | null
  onChange: (url: string | null) => void
  fallback?: string
  shape?: 'circle' | 'rounded'
}

export default function ImageUpload({ value, onChange, fallback, shape = 'rounded' }: ImageUploadProps) {
  const t = useTranslations('settings.image')
  const inputRef = useRef<HTMLInputElement>(null)
  const [uploading, setUploading] = useState(false)

  const radius = shape === 'circle' ? 'rounded-full' : 'rounded-2xl'

  const pick = () => inputRef.current?.click()

  const onFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    e.target.value = ''
    if (!file) return
    if (!file.type.startsWith('image/')) {
      toast(t('invalidType'), 'error')
      return
    }
    if (file.size > 5 * 1024 * 1024) {
      toast(t('tooLarge'), 'error')
      return
    }
    setUploading(true)
    try {
      const data = new FormData()
      data.append('file', file)
      const res = await fetch('/api/upload', { method: 'POST', body: data })
      if (res.ok) {
        const { url } = await res.json()
        onChange(url)
      } else {
        toast(t('failed'), 'error')
      }
    } catch {
      toast(t('failed'), 'error')
    } finally {
      setUploading(false)
    }
  }

  return (
    <div className="flex items-center gap-4">
      <div className={cn('relative w-20 h-20 flex-shrink-0 overflow-hidden bg-sky-light text-sky-blue flex items-center justify-center text-2xl font-bold font-heading', radius)}>
        {value
          ? <img src={value} alt="" className="w-full h-full object-cover" />
          : <span>{fallback}</span>
        }
        {uploading && (
          <div className="absolute inset-0 flex items-center justify-center bg-white/70">
            <Loader2 className="w-5 h-5 animate-spin text-sky-blue" />
          </div>
        )}
      </div>
      <div className="flex flex-col gap-2">
        <input ref={inputRef} type="file" accept="image/*" className="hidden" onChange={onFile} />
        <button type="button" onClick={pick} disabled={uploading}
          className="btn-secondary text-sm inline-flex items-center gap-2 disabled:opacity-50">
          <Upload className="w-4 h-4" />
          {value ? t('replace') : t('upload')}
        </button>
        {value && (
          <button type="button" onClick={() => onChange(null)}
            className="text-xs text-red-500 hover:underline inline-flex items-center gap-1 self-start">
            <X className="w-3 h-3" />
            {t('remove')}
          </button>
        )}
        <p className="text-xs text-muted">{t('hint')}</p>
      </div>
    </div>
  )
}
