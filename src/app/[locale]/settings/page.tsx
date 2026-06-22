import { redirect } from 'next/navigation'
import { getTranslations } from 'next-intl/server'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import SettingsClient from '@/components/settings/SettingsClient'

export default async function SettingsPage({ params }: { params: { locale: string } }) {
  const session = await auth()
  if (!session) redirect(`/${params.locale}/auth/login`)

  const t = await getTranslations('settings')

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: {
      id: true, name: true, phone: true, avatarUrl: true,
      telegramUsername: true, telegramVerifiedAt: true, phoneVerifiedAt: true,
    },
  })

  const isEmployer = session.user.role === 'EMPLOYER'
  const company = isEmployer
    ? await prisma.company.findUnique({ where: { ownerId: session.user.id } })
    : null

  return (
    <div className="pt-28 pb-24 max-w-4xl mx-auto px-4 md:px-8">
      <h1 className="font-heading font-bold text-ink text-2xl mb-8">{t('title')}</h1>
      <SettingsClient user={user} company={company} isEmployer={isEmployer} />
    </div>
  )
}
