'use client'

import { Link, usePathname } from '@/i18n/navigation'
import { useTranslations } from 'next-intl'
import { LayoutDashboard, Briefcase, Building2, Flag, Users, ShieldCheck } from 'lucide-react'
import { cn } from '@/lib/utils'

interface Props {
  canManageUsers: boolean
  isRoot: boolean
}

export default function AdminNav({ canManageUsers, isRoot }: Props) {
  const t = useTranslations('admin')
  const pathname = usePathname()

  const links = [
    { href: '/admin', label: t('nav.dashboard'), icon: LayoutDashboard },
    { href: '/admin/jobs', label: t('nav.jobs'), icon: Briefcase },
    { href: '/admin/companies', label: t('nav.companies'), icon: Building2 },
    { href: '/admin/reports', label: t('nav.reports'), icon: Flag },
    ...(canManageUsers ? [{ href: '/admin/users', label: t('nav.users'), icon: Users }] : []),
  ]

  return (
    <aside className="lg:sticky lg:top-28 h-max">
      <div className="flex items-center gap-2 mb-5 px-2">
        <ShieldCheck className="w-5 h-5 text-sky-blue" />
        <span className="font-heading font-semibold text-ink">{t('title')}</span>
        {isRoot && (
          <span className="text-[10px] font-medium uppercase tracking-wide text-sky-blue bg-sky-light rounded-full px-2 py-0.5">
            {t('owner')}
          </span>
        )}
      </div>
      <nav className="flex lg:flex-col gap-1 overflow-x-auto">
        {links.map(({ href, label, icon: Icon }) => {
          const active = pathname === href
          return (
            <Link
              key={href}
              href={href}
              className={cn(
                'flex items-center gap-2.5 rounded-2xl px-3 py-2.5 text-sm font-medium transition-colors whitespace-nowrap',
                active ? 'bg-ink text-bg' : 'text-muted hover:text-ink hover:bg-black/5'
              )}
            >
              <Icon className="w-4 h-4" />
              {label}
            </Link>
          )
        })}
      </nav>
    </aside>
  )
}
