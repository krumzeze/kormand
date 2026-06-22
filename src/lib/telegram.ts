const API_BASE = 'https://api.telegram.org'

function botToken(): string {
  const token = process.env.TELEGRAM_BOT_TOKEN
  if (!token) throw new Error('TELEGRAM_BOT_TOKEN is not set')
  return token
}

export function botUsername(): string {
  const name = process.env.TELEGRAM_BOT_USERNAME
  if (!name) throw new Error('TELEGRAM_BOT_USERNAME is not set')
  return name
}

// Telegram шлёт этот секрет в заголовке каждого апдейта — единственная
// защита webhook от поддельных запросов на публичный endpoint (ADR 0008).
export function isValidWebhookSecret(header: string | null): boolean {
  const secret = process.env.TELEGRAM_WEBHOOK_SECRET
  return !!secret && header === secret
}

export function buildStartLink(token: string): string {
  return `https://t.me/${botUsername()}?start=${token}`
}

type TelegramApiResult<T> = { ok: true; result: T } | { ok: false; description?: string }

async function callTelegram<T = unknown>(
  method: string,
  params: Record<string, unknown>,
): Promise<T> {
  const res = await fetch(`${API_BASE}/bot${botToken()}/${method}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(params),
  })
  const data = (await res.json()) as TelegramApiResult<T>
  if (!data.ok) throw new Error(`Telegram ${method} failed: ${data.description ?? res.status}`)
  return data.result
}

interface SendMessageExtra {
  reply_markup?: unknown
  parse_mode?: 'HTML' | 'MarkdownV2'
}

export function sendMessage(chatId: string | number, text: string, extra?: SendMessageExtra) {
  return callTelegram('sendMessage', { chat_id: chatId, text, ...extra })
}

// Reply-клавиатура с кнопкой «поделиться номером»: телефон приходит в
// update.message.contact только после явного тапа пользователя.
export function requestContactKeyboard(buttonText: string) {
  return {
    keyboard: [[{ text: buttonText, request_contact: true }]],
    resize_keyboard: true,
    one_time_keyboard: true,
  }
}

export function removeKeyboard() {
  return { remove_keyboard: true }
}

// Минимальный срез апдейта — только поля, которые мы реально читаем.
export interface TelegramUser {
  id: number
  username?: string
  first_name?: string
}

export interface TelegramContact {
  phone_number: string
  user_id?: number
}

export interface TelegramUpdate {
  message?: {
    chat: { id: number }
    from?: TelegramUser
    text?: string
    contact?: TelegramContact
  }
}
