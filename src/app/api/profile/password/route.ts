import { NextRequest, NextResponse } from 'next/server'
import bcrypt from 'bcryptjs'
import { prisma } from '@/lib/prisma'
import { auth } from '@/lib/auth'
import { passwordChangeSchema } from '@/lib/validations'

export async function PATCH(req: NextRequest) {
  const session = await auth()
  if (!session) return NextResponse.json({ error: 'UNAUTHORIZED' }, { status: 401 })

  const body = await req.json()
  const parsed = passwordChangeSchema.safeParse(body)
  if (!parsed.success) return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 })

  const user = await prisma.user.findUnique({ where: { id: session.user.id } })
  if (!user) return NextResponse.json({ error: 'NOT_FOUND' }, { status: 404 })

  const valid = await bcrypt.compare(parsed.data.currentPassword, user.passwordHash)
  if (!valid) return NextResponse.json({ error: 'WRONG_PASSWORD' }, { status: 400 })

  await prisma.user.update({
    where: { id: user.id },
    data: { passwordHash: bcrypt.hashSync(parsed.data.newPassword, 10) },
  })

  return NextResponse.json({ success: true })
}
