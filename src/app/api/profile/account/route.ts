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
  const newPhone = phone || null

  // Ручная смена номера сбрасывает подтверждение — иначе непроверенный
  // номер остался бы с phoneVerifiedAt (см. ADR 0008).
  const current = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { phone: true },
  })

  const user = await prisma.user.update({
    where: { id: session.user.id },
    data: {
      name,
      phone: newPhone,
      avatarUrl: avatarUrl || null,
      ...(newPhone !== current?.phone ? { phoneVerifiedAt: null } : {}),
    },
    select: { id: true, name: true, phone: true, avatarUrl: true },
  })

  return NextResponse.json(user)
}
