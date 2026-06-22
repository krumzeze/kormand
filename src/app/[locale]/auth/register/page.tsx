'use client'

import { useState } from 'react'
import { useTranslations, useLocale } from 'next-intl'
import { Link } from '@/i18n/navigation'
import { useRouter } from 'next/navigation'
import { signIn } from 'next-auth/react'
import { motion, AnimatePresence } from 'framer-motion'
import { Mail, Lock, User, Phone, ArrowRight, Briefcase, UserCheck } from 'lucide-react'
import Input from '@/components/ui/Input'
import Button from '@/components/ui/Button'
import { cn } from '@/lib/utils'

export default function RegisterPage() {
  const t = useTranslations('auth')
  const locale = useLocale()
  const router = useRouter()

  const [role, setRole] = useState<'CANDIDATE' | 'EMPLOYER'>('CANDIDATE')
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [phone, setPhone] = useState('')
  const [accepted, setAccepted] = useState(false)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    if (!accepted) {
      setError(t('consentError'))
      return
    }
    setLoading(true)
    try {
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, password, role, phone, acceptedTerms: accepted }),
      })
      const data = await res.json()

      if (!res.ok) {
        if (data.error === 'EMAIL_TAKEN') setError(t('errors.emailTaken'))
        else setError(t('errors.required'))
        return
      }

      // Auto-login
      const loginRes = await signIn('credentials', { email, password, redirect: false })
      if (loginRes?.ok) {
        router.push(`/${locale}/${role === 'EMPLOYER' ? 'dashboard/employer' : 'dashboard/candidate'}`)
      } else {
        router.push(`/${locale}/auth/login`)
      }
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-[100dvh] flex items-center justify-center relative overflow-hidden py-8">
      <div className="absolute inset-0 pointer-events-none" style={{ background: 'radial-gradient(at 70% 20%, #E6FAF8 0px, transparent 55%), radial-gradient(at 20% 80%, #EEF5FF 0px, transparent 55%)' }} />
      <motion.div className="blob w-72 h-72 top-10 left-20 opacity-30" style={{ background: '#4FD1C5' }} animate={{ scale: [1, 1.1, 1] }} transition={{ duration: 10, repeat: Infinity }} />

      <div className="relative z-10 w-full max-w-md px-4">
        <motion.div initial={{ opacity: 0, y: -16 }} animate={{ opacity: 1, y: 0 }} className="flex justify-center mb-8">
          <Link href="/" className="flex items-center gap-2">
            <div className="w-9 h-9 rounded-xl flex items-center justify-center text-white font-bold" style={{ background: 'linear-gradient(135deg, #7FB3FF 0%, #4FD1C5 100%)' }}>К</div>
            <span className="font-heading font-bold text-ink text-xl">Kormand</span>
          </Link>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1, duration: 0.6, ease: [0.32, 0.72, 0, 1] }}
          className="p-1.5 rounded-4xl bg-black/[0.03] ring-1 ring-black/8 shadow-glass-lg"
        >
          <div className="rounded-[calc(2rem-0.375rem)] bg-white/95 shadow-[inset_0_1px_1px_rgba(255,255,255,1)] p-8">
            <h1 className="font-heading font-bold text-ink text-2xl">{t('registerTitle')}</h1>
            <p className="text-muted text-sm mt-1.5">{t('registerSubtitle')}</p>

            {/* Role picker */}
            <div className="mt-6 p-1 rounded-2xl bg-black/[0.04] flex gap-1">
              {(['CANDIDATE', 'EMPLOYER'] as const).map(r => (
                <button
                  key={r}
                  type="button"
                  onClick={() => setRole(r)}
                  className={cn(
                    'flex-1 flex items-center justify-center gap-2 rounded-xl px-4 py-2.5 text-sm font-medium transition-all duration-300',
                    role === r
                      ? 'bg-white shadow-card text-ink'
                      : 'text-muted hover:text-ink'
                  )}
                >
                  {r === 'CANDIDATE'
                    ? <UserCheck className="w-4 h-4" />
                    : <Briefcase className="w-4 h-4" />
                  }
                  {t(r === 'CANDIDATE' ? 'candidate' : 'employer')}
                </button>
              ))}
            </div>
            <AnimatePresence mode="wait">
              <motion.p
                key={role}
                initial={{ opacity: 0, y: 4 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -4 }}
                className="text-xs text-muted text-center mt-2"
              >
                {role === 'CANDIDATE' ? t('candidateDesc') : t('employerDesc')}
              </motion.p>
            </AnimatePresence>

            <form onSubmit={handleSubmit} className="mt-6 flex flex-col gap-4">
              <Input label={t('name')} type="text" value={name} onChange={e => setName(e.target.value)} placeholder="Ваше полное имя" required icon={<User className="w-4 h-4" />} />
              <Input label={t('email')} type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="you@example.com" required icon={<Mail className="w-4 h-4" />} />
              <Input label={t('password')} type="password" value={password} onChange={e => setPassword(e.target.value)} placeholder="Минимум 8 символов" required icon={<Lock className="w-4 h-4" />} />
              <Input label={t('phone')} type="tel" value={phone} onChange={e => setPhone(e.target.value)} placeholder="+992..." icon={<Phone className="w-4 h-4" />} />

              <label className="flex items-start gap-3 cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={accepted}
                  onChange={e => setAccepted(e.target.checked)}
                  className="mt-0.5 h-4 w-4 shrink-0 cursor-pointer rounded border-ink/20 text-sky-blue focus:ring-sky-blue/40"
                />
                <span className="text-xs text-muted leading-relaxed">
                  {t.rich('consent', {
                    terms: chunks => (
                      <Link href="/terms" target="_blank" onClick={e => e.stopPropagation()} className="text-sky-blue hover:underline">{chunks}</Link>
                    ),
                    privacy: chunks => (
                      <Link href="/privacy" target="_blank" onClick={e => e.stopPropagation()} className="text-sky-blue hover:underline">{chunks}</Link>
                    ),
                  })}
                </span>
              </label>

              {error && (
                <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-xs text-red-500 bg-red-50 rounded-xl px-4 py-3">
                  {error}
                </motion.p>
              )}

              <Button type="submit" variant="gradient" size="lg" loading={loading} disabled={!accepted} className="w-full mt-2">
                {t('register')}
                <div className="w-6 h-6 rounded-full bg-white/20 flex items-center justify-center ml-auto">
                  <ArrowRight className="w-3.5 h-3.5" />
                </div>
              </Button>
            </form>

            <p className="text-center text-sm text-muted mt-6">
              {t('hasAccount')}{' '}
              <Link href="/auth/login" className="text-sky-blue font-medium hover:underline">{t('login')}</Link>
            </p>
          </div>
        </motion.div>
      </div>
    </div>
  )
}
