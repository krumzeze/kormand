'use client'

import { useEffect, useState } from 'react'
import { cn } from '@/lib/utils'

export type ToastType = 'success' | 'error' | 'info'

interface Toast {
  id: string
  message: string
  type: ToastType
}

let toastFn: ((msg: string, type?: ToastType) => void) | null = null

export function toast(message: string, type: ToastType = 'info') {
  toastFn?.(message, type)
}

export function Toaster() {
  const [toasts, setToasts] = useState<Toast[]>([])

  useEffect(() => {
    toastFn = (message, type = 'info') => {
      const id = Math.random().toString(36).slice(2)
      setToasts(prev => [...prev, { id, message, type }])
      setTimeout(() => setToasts(prev => prev.filter(t => t.id !== id)), 3500)
    }
    return () => { toastFn = null }
  }, [])

  return (
    <div className="fixed bottom-6 right-6 z-50 flex flex-col gap-2 pointer-events-none">
      {toasts.map(t => (
        <div
          key={t.id}
          className={cn(
            'pointer-events-auto flex items-center gap-3 rounded-2xl px-4 py-3 text-sm font-medium shadow-glass-lg',
            'animate-slide-up backdrop-blur-xl border',
            t.type === 'success' && 'bg-emerald-50/90 text-emerald-700 border-emerald-200',
            t.type === 'error' && 'bg-red-50/90 text-red-600 border-red-200',
            t.type === 'info' && 'bg-white/90 text-ink border-black/10',
          )}
        >
          {t.type === 'success' && <span>✓</span>}
          {t.type === 'error' && <span>✕</span>}
          {t.message}
        </div>
      ))}
    </div>
  )
}
