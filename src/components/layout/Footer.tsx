'use client'

import { useTranslations } from 'next-intl'
import { Link } from '@/i18n/navigation'
import { MapPin, Mail, Phone } from 'lucide-react'

export default function Footer() {
  const t = useTranslations('footer')
  const year = new Date().getFullYear()

  return (
    <footer className="border-t border-black/5 bg-white/50 mt-auto">
      <div className="max-w-[1600px] mx-auto px-4 md:px-8 py-16">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-10">
          {/* Brand */}
          <div className="col-span-2 md:col-span-1">
            <Link href="/" className="flex items-center gap-2 mb-4 group w-fit">
              <div
                className="w-9 h-9 rounded-xl flex items-center justify-center text-white font-bold font-heading text-base"
                style={{ background: 'linear-gradient(135deg, #7FB3FF 0%, #4FD1C5 100%)' }}
              >
                К
              </div>
              <span className="font-heading font-semibold text-ink text-lg">Kormand</span>
            </Link>
            <p className="text-sm text-muted leading-relaxed">{t('tagline')}</p>
            <div className="flex flex-col gap-2 mt-6">
              <a href="mailto:hello@kormand.tj" className="flex items-center gap-2 text-xs text-muted hover:text-sky-blue transition-colors">
                <Mail className="w-3.5 h-3.5" />
                hello@kormand.tj
              </a>
              <a href="tel:+992000000000" className="flex items-center gap-2 text-xs text-muted hover:text-sky-blue transition-colors">
                <Phone className="w-3.5 h-3.5" />
                +992 000 000 000
              </a>
              <span className="flex items-center gap-2 text-xs text-muted">
                <MapPin className="w-3.5 h-3.5" />
                Душанбе, Таджикистан
              </span>
            </div>
          </div>

          {/* Candidates */}
          <div>
            <h4 className="text-sm font-semibold text-ink mb-4">{t('forCandidates')}</h4>
            <ul className="flex flex-col gap-3">
              <li><Link href="/jobs" className="text-sm text-muted hover:text-ink transition-colors">{t('findJobs')}</Link></li>
              <li><Link href="/auth/register" className="text-sm text-muted hover:text-ink transition-colors">{t('createProfile')}</Link></li>
            </ul>
          </div>

          {/* Employers */}
          <div>
            <h4 className="text-sm font-semibold text-ink mb-4">{t('forEmployers')}</h4>
            <ul className="flex flex-col gap-3">
              <li><Link href="/post-job" className="text-sm text-muted hover:text-ink transition-colors">{t('postJob')}</Link></li>
              <li><Link href="/auth/register" className="text-sm text-muted hover:text-ink transition-colors">{t('ourPrices')}</Link></li>
            </ul>
          </div>

          {/* Legal */}
          <div>
            <h4 className="text-sm font-semibold text-ink mb-4">{t('legal')}</h4>
            <ul className="flex flex-col gap-3">
              <li><Link href="/privacy" className="text-sm text-muted hover:text-ink transition-colors">{t('privacy')}</Link></li>
              <li><Link href="/terms" className="text-sm text-muted hover:text-ink transition-colors">{t('terms')}</Link></li>
            </ul>
          </div>
        </div>

        <div className="mt-12 pt-6 border-t border-black/5 flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="text-xs text-muted">
            © {year} Kormand. {t('rights')}.
          </p>
          <div className="flex items-center gap-1">
            <div className="w-1.5 h-1.5 rounded-full animate-pulse" style={{ background: 'linear-gradient(135deg, #7FB3FF 0%, #4FD1C5 100%)' }} />
            <span className="text-xs text-muted">Душанбе, Таджикистан</span>
          </div>
        </div>
      </div>
    </footer>
  )
}
