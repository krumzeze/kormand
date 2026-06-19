'use client'

import { useState, useEffect } from 'react'
import { useSession, signOut } from 'next-auth/react'
import { useTranslations, useLocale } from 'next-intl'
import { Link, usePathname } from '@/i18n/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import { Menu, X, Briefcase, User, LogOut, ChevronDown, Globe, ShieldCheck, Settings } from 'lucide-react'
import { cn } from '@/lib/utils'
import { useRouter } from 'next/navigation'

export default function Header() {
  const t = useTranslations('nav')
  const locale = useLocale()
  const { data: session } = useSession()
  const pathname = usePathname()
  const router = useRouter()

  const [menuOpen, setMenuOpen] = useState(false)
  const [scrolled, setScrolled] = useState(false)
  const [userMenuOpen, setUserMenuOpen] = useState(false)

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20)
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  const switchLocale = () => {
    const next = locale === 'ru' ? 'tj' : 'ru'
    router.push(`/${next}${pathname}`)
  }

  const navLinks = [
    { href: '/jobs', label: t('jobs') },
    { href: '/companies', label: t('companies') },
  ]

  return (
    <>
      <header className="fixed top-0 left-0 right-0 z-40 flex justify-center pt-5 px-4">
        <motion.nav
          initial={{ y: -20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.6, ease: [0.32, 0.72, 0, 1] }}
          className={cn(
            'flex items-center justify-between w-full max-w-[1600px] mx-auto gap-1 rounded-full px-3 py-2 transition-all duration-500',
            scrolled
              ? 'glass shadow-glass-lg border border-white/80'
              : 'glass border border-white/60 shadow-glass'
          )}
        >
          {/* Logo */}
          <Link
            href="/"
            className="flex items-center gap-2 rounded-full px-4 py-2 mr-2 hover:bg-black/5 transition-colors duration-300"
          >
            <div className="w-7 h-7 rounded-xl flex items-center justify-center text-white text-sm font-bold"
              style={{ background: 'linear-gradient(135deg, #7FB3FF 0%, #4FD1C5 100%)' }}>
              К
            </div>
            <span className="font-heading font-semibold text-ink text-sm">Kormand</span>
          </Link>

          {/* Desktop links */}
          <div className="hidden md:flex items-center gap-1">
            {navLinks.map(link => (
              <Link
                key={link.href}
                href={link.href}
                className={cn(
                  'rounded-full px-4 py-2 text-sm font-medium transition-all duration-300',
                  pathname === link.href
                    ? 'bg-ink text-bg'
                    : 'text-muted hover:text-ink hover:bg-black/5'
                )}
              >
                {link.label}
              </Link>
            ))}
          </div>

          <div className="hidden md:flex items-center gap-1 ml-2">
            {/* Lang switcher */}
            <button
              onClick={switchLocale}
              className="flex items-center gap-1.5 rounded-full px-3 py-2 text-sm text-muted hover:text-ink hover:bg-black/5 transition-all duration-300"
            >
              <Globe className="w-3.5 h-3.5" />
              <span className="uppercase text-xs font-medium">{locale === 'ru' ? 'TJ' : 'RU'}</span>
            </button>

            {session ? (
              <div className="relative">
                <button
                  onClick={() => setUserMenuOpen(!userMenuOpen)}
                  className="flex items-center gap-2 rounded-full pl-3 pr-2 py-2 text-sm font-medium text-ink hover:bg-black/5 transition-all duration-300"
                >
                  <div className="w-6 h-6 rounded-full flex items-center justify-center text-xs text-white font-bold"
                    style={{ background: 'linear-gradient(135deg, #C7B6FF 0%, #7FB3FF 100%)' }}>
                    {session.user.name?.[0]?.toUpperCase()}
                  </div>
                  <span className="hidden lg:block max-w-24 truncate">{session.user.name}</span>
                  <ChevronDown className={cn('w-3.5 h-3.5 transition-transform duration-300', userMenuOpen && 'rotate-180')} />
                </button>

                <AnimatePresence>
                  {userMenuOpen && (
                    <motion.div
                      initial={{ opacity: 0, y: 8, scale: 0.96 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: 8, scale: 0.96 }}
                      transition={{ duration: 0.2, ease: [0.32, 0.72, 0, 1] }}
                      className="absolute right-0 top-full mt-2 w-52 glass rounded-2xl shadow-glass-lg border border-white/80 p-1.5 overflow-hidden"
                    >
                      <Link
                        href={session.user.role === 'EMPLOYER' ? '/dashboard/employer' : '/dashboard/candidate'}
                        className="flex items-center gap-2.5 rounded-xl px-3 py-2.5 text-sm text-ink hover:bg-black/5 transition-colors"
                        onClick={() => setUserMenuOpen(false)}
                      >
                        <User className="w-4 h-4 text-muted" />
                        {t('dashboard')}
                      </Link>
                      {session.user.role === 'EMPLOYER' && (
                        <Link
                          href="/post-job"
                          className="flex items-center gap-2.5 rounded-xl px-3 py-2.5 text-sm text-ink hover:bg-black/5 transition-colors"
                          onClick={() => setUserMenuOpen(false)}
                        >
                          <Briefcase className="w-4 h-4 text-muted" />
                          {t('postJob')}
                        </Link>
                      )}
                      {(session.user.role === 'ADMIN' || session.user.role === 'MODERATOR') && (
                        <Link
                          href="/admin"
                          className="flex items-center gap-2.5 rounded-xl px-3 py-2.5 text-sm text-ink hover:bg-black/5 transition-colors"
                          onClick={() => setUserMenuOpen(false)}
                        >
                          <ShieldCheck className="w-4 h-4 text-muted" />
                          {t('admin')}
                        </Link>
                      )}
                      <Link
                        href="/settings"
                        className="flex items-center gap-2.5 rounded-xl px-3 py-2.5 text-sm text-ink hover:bg-black/5 transition-colors"
                        onClick={() => setUserMenuOpen(false)}
                      >
                        <Settings className="w-4 h-4 text-muted" />
                        {t('settings')}
                      </Link>
                      <hr className="my-1 border-black/5" />
                      <button
                        onClick={() => { signOut({ callbackUrl: `/${locale}` }); setUserMenuOpen(false) }}
                        className="flex w-full items-center gap-2.5 rounded-xl px-3 py-2.5 text-sm text-red-500 hover:bg-red-50 transition-colors"
                      >
                        <LogOut className="w-4 h-4" />
                        {t('logout')}
                      </button>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            ) : (
              <div className="flex items-center gap-1">
                <Link href="/auth/login" className="rounded-full px-4 py-2 text-sm font-medium text-muted hover:text-ink hover:bg-black/5 transition-all duration-300">
                  {t('login')}
                </Link>
                <Link href="/auth/register" className="btn-primary text-xs px-4 py-2">
                  {t('register')}
                </Link>
              </div>
            )}
          </div>

          {/* Mobile menu button */}
          <button
            onClick={() => setMenuOpen(!menuOpen)}
            className="md:hidden rounded-full p-2 text-ink hover:bg-black/5 transition-all duration-300"
          >
            <AnimatePresence mode="wait">
              {menuOpen ? (
                <motion.span key="x" initial={{ rotate: -90 }} animate={{ rotate: 0 }} exit={{ rotate: 90 }}>
                  <X className="w-5 h-5" />
                </motion.span>
              ) : (
                <motion.span key="menu" initial={{ rotate: 90 }} animate={{ rotate: 0 }} exit={{ rotate: -90 }}>
                  <Menu className="w-5 h-5" />
                </motion.span>
              )}
            </AnimatePresence>
          </button>
        </motion.nav>
      </header>

      {/* Mobile menu overlay */}
      <AnimatePresence>
        {menuOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-30 md:hidden"
            style={{ backdropFilter: 'blur(24px)', WebkitBackdropFilter: 'blur(24px)', background: 'rgba(252,251,249,0.92)' }}
          >
            <div className="flex flex-col items-center justify-center h-full gap-3">
              {navLinks.map((link, i) => (
                <motion.div
                  key={link.href}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.07 + 0.1, duration: 0.4, ease: [0.32, 0.72, 0, 1] }}
                >
                  <Link
                    href={link.href}
                    className="text-3xl font-heading font-semibold text-ink hover:text-sky-blue transition-colors"
                    onClick={() => setMenuOpen(false)}
                  >
                    {link.label}
                  </Link>
                </motion.div>
              ))}
              {session ? (
                <>
                  <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.24 }}>
                    <Link
                      href={session.user.role === 'EMPLOYER' ? '/dashboard/employer' : '/dashboard/candidate'}
                      className="text-3xl font-heading font-semibold text-ink hover:text-sky-blue transition-colors"
                      onClick={() => setMenuOpen(false)}
                    >
                      {t('dashboard')}
                    </Link>
                  </motion.div>
                  <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.31 }}>
                    <Link
                      href="/settings"
                      className="text-xl font-medium text-muted hover:text-ink transition-colors"
                      onClick={() => setMenuOpen(false)}
                    >
                      {t('settings')}
                    </Link>
                  </motion.div>
                  <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.38 }}>
                    <button
                      onClick={() => { signOut({ callbackUrl: `/${locale}` }); setMenuOpen(false) }}
                      className="text-xl font-medium text-red-400 hover:text-red-500 transition-colors"
                    >
                      {t('logout')}
                    </button>
                  </motion.div>
                </>
              ) : (
                <>
                  <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.24 }}>
                    <Link href="/auth/login" className="text-3xl font-heading font-semibold text-ink hover:text-sky-blue transition-colors" onClick={() => setMenuOpen(false)}>
                      {t('login')}
                    </Link>
                  </motion.div>
                  <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.31 }}>
                    <Link href="/auth/register" className="btn-gradient text-base px-8 py-3" onClick={() => setMenuOpen(false)}>
                      {t('register')}
                    </Link>
                  </motion.div>
                </>
              )}
              <motion.button
                initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.4 }}
                onClick={switchLocale}
                className="mt-6 flex items-center gap-2 text-sm text-muted hover:text-ink transition-colors"
              >
                <Globe className="w-4 h-4" />
                {locale === 'ru' ? 'Тоҷикӣ' : 'Русский'}
              </motion.button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}
