import { NextResponse } from 'next/server'
import { randomBytes } from 'crypto'
import { prisma } from '@/lib/prisma'
import { auth } from '@/lib/auth'
import { buildStartLink } from '@/lib/telegram'

const TOKEN_TTL_MS = 10 * 60 * 1000

export async function POST() {
  const session = await auth()
  if (!session) return NextResponse.json({ error: 'UNAUTHORIZED' }, { status: 401 })

  const token = randomBytes(24).toString('hex')
  const expiresAt = new Date(Date.now() + TOKEN_TTL_MS)

  // Один активный токен на пользователя — старые сразу гасим.
  await prisma.$transaction([
    prisma.telegramLinkToken.deleteMany({ where: { userId: session.user.id } }),
    prisma.telegramLinkToken.create({ data: { token, userId: session.user.id, expiresAt } }),
  ])

  return NextResponse.json({ url: buildStartLink(token), expiresAt })
}
