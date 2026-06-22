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

  // Телефоном заведует подтверждение через Telegram; здесь его трогаем только
  // если поле реально пришло — тогда ручная смена сбрасывает подтверждение
  // (см. ADR 0008).
  let phoneData = {}
  if (phone !== undefined) {
    const newPhone = phone || null
    const current = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { phone: true },
    })
    phoneData = {
      phone: newPhone,
      ...(newPhone !== current?.phone ? { phoneVerifiedAt: null } : {}),
    }
  }

  const user = await prisma.user.update({
    where: { id: session.user.id },
    data: {
      name,
      avatarUrl: avatarUrl || null,
      ...phoneData,
    },
    select: { id: true, name: true, phone: true, avatarUrl: true },
  })

  return NextResponse.json(user)
}
