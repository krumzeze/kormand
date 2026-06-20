import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { auth } from '@/lib/auth'
import { accountSchema } from '@/lib/validations'

export async function PATCH(req: NextRequest) {
  const session = await auth()
  if (!session) return NextResponse.json({ error: 'UNAUTHORIZED' }, { status: 401 })

  const body = await req.json()
  const parsed = accountSchema.safeParse(body)
  if (!parsed.success) return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 })

  const { name, phone, avatarUrl } = parsed.data
  const user = await prisma.user.update({
    where: { id: session.user.id },
    data: {
      name,
      phone: phone || null,
      avatarUrl: avatarUrl || null,
    },
    select: { id: true, name: true, phone: true, avatarUrl: true },
  })

  return NextResponse.json(user)
}
