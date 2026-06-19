import { redirect } from 'next/navigation'
import { getTranslations } from 'next-intl/server'
import { auth } from '@/lib/auth'
import PasswordForm from '@/components/settings/PasswordForm'

export default async function SettingsPage({ params }: { params: { locale: string } }) {
  const session = await auth()
  if (!session) redirect(`/${params.locale}/auth/login`)

  const t = await getTranslations('settings')

  return (
    <div className="pt-28 pb-24 max-w-2xl mx-auto px-4 md:px-8">
      <h1 className="font-heading font-bold text-ink text-2xl mb-6">{t('title')}</h1>
      <div className="p-1.5 rounded-3xl bg-black/[0.03] ring-1 ring-black/5">
        <div className="rounded-[calc(1.5rem-0.375rem)] bg-white shadow-[inset_0_1px_1px_rgba(255,255,255,0.9)] p-6 md:p-8">
          <h2 className="font-heading font-semibold text-ink text-lg mb-5">{t('passwordTitle')}</h2>
          <PasswordForm />
        </div>
      </div>
    </div>
  )
}
