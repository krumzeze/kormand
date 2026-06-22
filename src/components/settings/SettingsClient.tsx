'use client'

import { useState } from 'react'
import { useTranslations } from 'next-intl'
import { User, Shield, Building2 } from 'lucide-react'
import { cn } from '@/lib/utils'
import AccountForm from '@/components/settings/AccountForm'
import CompanyProfileForm from '@/components/settings/CompanyProfileForm'
import CandidateProfileForm from '@/components/settings/CandidateProfileForm'
import PasswordForm from '@/components/settings/PasswordForm'
import TelegramVerify from '@/components/settings/TelegramVerify'

interface SettingsClientProps {
  user: any
  company: any
  profile: any
  isEmployer: boolean
  isCandidate: boolean
}

type Tab = 'profile' | 'security'

function Card({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="p-1.5 rounded-3xl bg-black/[0.03] ring-1 ring-black/5">
      <div className="rounded-[calc(1.5rem-0.375rem)] bg-white shadow-[inset_0_1px_1px_rgba(255,255,255,0.9)] p-6 md:p-8">
        <h2 className="font-heading font-semibold text-ink text-lg mb-5">{title}</h2>
        {children}
      </div>
    </div>
  )
}

export default function SettingsClient({ user, company, profile, isEmployer, isCandidate }: SettingsClientProps) {
  const t = useTranslations('settings')
  const [tab, setTab] = useState<Tab>('profile')

  const menu: { key: Tab; label: string; icon: typeof User }[] = [
    { key: 'profile', label: t('tabs.profile'), icon: User },
    { key: 'security', label: t('tabs.security'), icon: Shield },
  ]

  return (
    <div className="grid md:grid-cols-[220px_1fr] gap-6 md:gap-10 items-start">
      {/* Menu */}
      <nav className="flex md:flex-col gap-1 p-1.5 rounded-2xl bg-black/[0.04] md:sticky md:top-28">
        {menu.map(item => {
          const Icon = item.icon
          return (
            <button key={item.key} onClick={() => setTab(item.key)}
              className={cn('flex items-center gap-2.5 rounded-xl px-4 py-2.5 text-sm font-medium transition-all duration-300 flex-1 md:flex-none',
                tab === item.key ? 'bg-white shadow-card text-ink' : 'text-muted hover:text-ink')}>
              <Icon className="w-4 h-4" />
              {item.label}
            </button>
          )
        })}
      </nav>

      {/* Content */}
      <div className="flex flex-col gap-6">
        {tab === 'profile' && (
          <>
            {isEmployer && (
              <Card title={t('company.title')}>
                <CompanyProfileForm company={company} />
              </Card>
            )}
            {isCandidate && (
              <Card title={t('candidate.title')}>
                <CandidateProfileForm profile={profile} />
              </Card>
            )}
            <Card title={t('account.title')}>
              <AccountForm user={user} />
            </Card>
            <Card title={t('telegram.title')}>
              <TelegramVerify user={user} />
            </Card>
          </>
        )}
        {tab === 'security' && (
          <Card title={t('passwordTitle')}>
            <PasswordForm />
          </Card>
        )}
      </div>
    </div>
  )
}
