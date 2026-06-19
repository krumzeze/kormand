import { ReactNode } from 'react'
import { redirect } from 'next/navigation'
import { auth } from '@/lib/auth'
import { canModerate, isAdmin } from '@/lib/authz'
import AdminNav from '@/components/admin/AdminNav'

export default async function AdminLayout({
  children,
  params,
}: {
  children: ReactNode
  params: { locale: string }
}) {
  const session = await auth()
  if (!session) redirect(`/${params.locale}/auth/login`)
  if (!canModerate(session.user.role)) redirect(`/${params.locale}`)

  return (
    <div className="pt-28 pb-24 max-w-[1600px] mx-auto px-4 md:px-8">
      <div className="grid lg:grid-cols-[220px_1fr] gap-8">
        <AdminNav canManageUsers={isAdmin(session.user.role)} isRoot={session.user.isRoot} />
        <div className="min-w-0">{children}</div>
      </div>
    </div>
  )
}
