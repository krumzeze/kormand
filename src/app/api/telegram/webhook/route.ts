import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import {
  isValidWebhookSecret,
  sendMessage,
  requestContactKeyboard,
  removeKeyboard,
  type TelegramUpdate,
} from '@/lib/telegram'

const ok = () => NextResponse.json({ ok: true })

export async function POST(req: NextRequest) {
  if (!isValidWebhookSecret(req.headers.get('x-telegram-bot-api-secret-token'))) {
    return NextResponse.json({ error: 'FORBIDDEN' }, { status: 403 })
  }

  const update = (await req.json()) as TelegramUpdate
  const msg = update.message
  if (!msg?.from) return ok()

  const chatId = msg.chat.id
  const from = msg.from

  // Привязка: /start <token> из deep-link.
  const startToken = msg.text?.startsWith('/start') ? msg.text.split(/\s+/)[1] : undefined
  if (startToken) {
    const link = await prisma.telegramLinkToken.findUnique({ where: { token: startToken } })
    if (!link || link.expiresAt < new Date()) {
      if (link) await prisma.telegramLinkToken.delete({ where: { token: startToken } })
      await sendMessage(chatId, 'Ссылка подтверждения недействительна или истекла. Откройте настройки и попробуйте снова.')
      return ok()
    }

    // Этот Telegram-аккаунт мог быть привязан к другому профилю — владение
    // доказывается заново, прежнюю привязку гасим (telegramId @unique).
    await prisma.$transaction([
      prisma.user.updateMany({
        where: { telegramId: String(from.id), NOT: { id: link.userId } },
        data: { telegramId: null, telegramUsername: null, telegramChatId: null, telegramVerifiedAt: null },
      }),
      prisma.user.update({
        where: { id: link.userId },
        data: {
          telegramId: String(from.id),
          telegramUsername: from.username ?? null,
          telegramChatId: String(chatId),
          telegramVerifiedAt: new Date(),
        },
      }),
      prisma.telegramLinkToken.delete({ where: { token: startToken } }),
    ])

    await sendMessage(
      chatId,
      'Telegram подтверждён ✅\n\nЧтобы также подтвердить номер телефона, нажмите кнопку ниже.',
      { reply_markup: requestContactKeyboard('Поделиться номером') },
    )
    return ok()
  }

  // Подтверждение телефона: принимаем только собственный контакт.
  if (msg.contact) {
    if (msg.contact.user_id !== from.id) {
      await sendMessage(chatId, 'Нужен ваш собственный номер. Нажмите кнопку «Поделиться номером».')
      return ok()
    }

    const user = await prisma.user.findUnique({ where: { telegramId: String(from.id) } })
    if (!user) {
      await sendMessage(chatId, 'Сначала подтвердите Telegram из настроек профиля.', { reply_markup: removeKeyboard() })
      return ok()
    }

    const phone = msg.contact.phone_number
    // Уникальность подтверждённого телефона держим на уровне приложения:
    // прежнего подтверждённого владельца этого номера сбрасываем.
    await prisma.$transaction([
      prisma.user.updateMany({
        where: { phone, phoneVerifiedAt: { not: null }, NOT: { id: user.id } },
        data: { phoneVerifiedAt: null },
      }),
      prisma.user.update({
        where: { id: user.id },
        data: { phone, phoneVerifiedAt: new Date() },
      }),
    ])

    await sendMessage(chatId, 'Номер телефона подтверждён ✅', { reply_markup: removeKeyboard() })
    return ok()
  }

  return ok()
}
