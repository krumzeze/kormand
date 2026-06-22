import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { auth } from '@/lib/auth'
import { z } from 'zod'
import { ApplicationStatus } from '@prisma/client'
import { sendMessage } from '@/lib/telegram'

const statusSchema = z.object({
  status: z.nativeEnum(ApplicationStatus),
})

const statusLabels: Record<string, Record<ApplicationStatus, string>> = {
  ru: { SENT: 'Отправлен', VIEWED: 'Просмотрен', INTERVIEW: 'Собеседование', REJECTED: 'Отказ', ACCEPTED: 'Принят' },
  tj: { SENT: 'Фиристода шуд', VIEWED: 'Дида шуд', INTERVIEW: 'Мусоҳиба', REJECTED: 'Рад шуд', ACCEPTED: 'Қабул шуд' },
}

export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  const session = await auth()
  if (!session || session.user.role !== 'EMPLOYER') {
    return NextResponse.json({ error: 'FORBIDDEN' }, { status: 403 })
  }

  const body = await req.json()
  const parsed = statusSchema.safeParse(body)
  if (!parsed.success) return NextResponse.json({ error: 'INVALID_STATUS' }, { status: 400 })

  const app = await prisma.application.findUnique({
    where: { id: params.id },
    include: { job: { include: { company: true } } },
  })
  if (!app) return NextResponse.json({ error: 'NOT_FOUND' }, { status: 404 })
  if (app.job.company.ownerId !== session.user.id) {
    return NextResponse.json({ error: 'FORBIDDEN' }, { status: 403 })
  }

  const updated = await prisma.application.update({
    where: { id: params.id },
    data: { status: parsed.data.status },
    include: { user: { select: { name: true, email: true, telegramChatId: true, locale: true } } },
  })

  // Уведомляем кандидата только при реальной смене статуса и если он
  // подтвердил Telegram. Сбой отправки не должен ронять обновление статуса.
  if (parsed.data.status !== app.status && updated.user.telegramChatId) {
    const loc = updated.user.locale === 'tj' ? 'tj' : 'ru'
    const label = statusLabels[loc][parsed.data.status]
    const text = loc === 'tj'
      ? `Ҳолати дархости шумо барои «${app.job.title}» иваз шуд: ${label}`
      : `Статус вашего отклика на «${app.job.title}» изменён: ${label}`
    try {
      await sendMessage(updated.user.telegramChatId, text)
    } catch (e) {
      console.error('telegram notify failed', e)
    }
  }

  return NextResponse.json(updated)
}
