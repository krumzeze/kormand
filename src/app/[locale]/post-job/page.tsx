import { auth } from '@/lib/auth'
import { redirect } from 'next/navigation'
import { prisma } from '@/lib/prisma'
import PostJobClient from '@/components/dashboard/PostJobClient'

export default async function PostJobPage({ params }: { params: { locale: string } }) {
  const session = await auth()
  if (!session || session.user.role !== 'EMPLOYER') {
    redirect(`/${params.locale}/auth/login`)
  }

  // Ensure company exists
  const company = await prisma.company.findUnique({ where: { ownerId: session.user.id } })

  return (
    <div className="pt-28 pb-24">
      <PostJobClient hasCompany={!!company} locale={params.locale} />
    </div>
  )
}
