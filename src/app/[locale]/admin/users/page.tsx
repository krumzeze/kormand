import { redirect } from 'next/navigation'
import { getTranslations } from 'next-intl/server'
import { auth } from '@/lib/auth'
import { isAdmin } from '@/lib/authz'
import { prisma } from '@/lib/prisma'
import AdminUsersTable from '@/components/admin/AdminUsersTable'

export default async function AdminUsersPage({ params }: { params: { locale: string } }) {
  const session = await auth()
  if (!session || !isAdmin(session.user.role)) redirect(`/${params.locale}/admin`)

  const t = await getTranslations('admin')
  const users = await prisma.user.findMany({
    orderBy: { createdAt: 'asc' },
    select: { id: true, name: true, email: true, role: true, isRoot: true },
  })

  return (
    <div>
      <h1 className="font-heading font-bold text-ink text-2xl mb-6">{t('nav.users')}</h1>
      <AdminUsersTable
        users={users}
        actor={{ id: session.user.id, role: session.user.role, isRoot: session.user.isRoot }}
      />
    </div>
  )
}
