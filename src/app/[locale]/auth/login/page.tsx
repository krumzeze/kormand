'use client'

import { useState } from 'react'
import { signIn } from 'next-auth/react'
import { useTranslations, useLocale } from 'next-intl'
import { Link } from '@/i18n/navigation'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import { Mail, Lock, ArrowRight } from 'lucide-react'
import Input from '@/components/ui/Input'
import Button from '@/components/ui/Button'

export default function LoginPage() {
  const t = useTranslations('auth')
  const locale = useLocale()
  const router = useRouter()

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      const res = await signIn('credentials', {
        email,
        password,
        redirect: false,
      })
      if (res?.error) {
        setError(t('errors.invalidCredentials'))
      } else {
        router.push(`/${locale}`)
        router.refresh()
      }
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-[100dvh] flex items-center justify-center relative overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0 pointer-events-none" style={{ background: 'radial-gradient(at 30% 30%, #EEF5FF 0px, transparent 55%), radial-gradient(at 70% 70%, #F3F0FF 0px, transparent 55%)' }} />
      <motion.div
        className="blob w-80 h-80 -top-20 right-10 opacity-30"
        style={{ background: '#C7B6FF' }}
        animate={{ scale: [1, 1.1, 1] }}
        transition={{ duration: 8, repeat: Infinity }}
      />
      <motion.div
        className="blob w-64 h-64 bottom-10 left-10 opacity-30"
        style={{ background: '#7FB3FF' }}
        animate={{ scale: [1, 1.15, 1] }}
        transition={{ duration: 10, repeat: Infinity, delay: 2 }}
      />

      <div className="relative z-10 w-full max-w-md px-4">
        {/* Logo */}
        <motion.div
          initial={{ opacity: 0, y: -16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="flex justify-center mb-8"
        >
          <Link href="/" className="flex items-center gap-2">
            <div className="w-9 h-9 rounded-xl flex items-center justify-center text-white font-bold"
              style={{ background: 'linear-gradient(135deg, #7FB3FF 0%, #4FD1C5 100%)' }}>К</div>
            <span className="font-heading font-bold text-ink text-xl">Kormand</span>
          </Link>
        </motion.div>

        {/* Card */}
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1, duration: 0.6, ease: [0.32, 0.72, 0, 1] }}
          className="p-1.5 rounded-4xl bg-black/[0.03] ring-1 ring-black/8 shadow-glass-lg"
        >
          <div className="rounded-[calc(2rem-0.375rem)] bg-white/95 shadow-[inset_0_1px_1px_rgba(255,255,255,1)] p-8">
            <h1 className="font-heading font-bold text-ink text-2xl">{t('loginTitle')}</h1>
            <p className="text-muted text-sm mt-1.5">{t('loginSubtitle')}</p>

            <form onSubmit={handleSubmit} className="mt-8 flex flex-col gap-4">
              <Input
                label={t('email')}
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                placeholder="you@example.com"
                required
                icon={<Mail className="w-4 h-4" />}
              />
              <Input
                label={t('password')}
                type="password"
                value={password}
                onChange={e => setPassword(e.target.value)}
                placeholder="••••••••"
                required
                icon={<Lock className="w-4 h-4" />}
              />

              {error && (
                <motion.p
                  initial={{ opacity: 0, y: -8 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="text-xs text-red-500 bg-red-50 rounded-xl px-4 py-3"
                >
                  {error}
                </motion.p>
              )}

              <Button type="submit" variant="gradient" size="lg" loading={loading} className="w-full mt-2">
                {t('login')}
                <div className="w-6 h-6 rounded-full bg-white/20 flex items-center justify-center ml-auto">
                  <ArrowRight className="w-3.5 h-3.5" />
                </div>
              </Button>
            </form>

            <p className="text-center text-sm text-muted mt-6">
              {t('noAccount')}{' '}
              <Link href="/auth/register" className="text-sky-blue font-medium hover:underline">
                {t('register')}
              </Link>
            </p>
          </div>
        </motion.div>
      </div>
    </div>
  )
}
