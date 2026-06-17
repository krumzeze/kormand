import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatSalary(min?: number | null, max?: number | null, currency = 'TJS') {
  if (!min && !max) return null
  const fmt = (n: number) =>
    currency === 'USD'
      ? `$${n.toLocaleString('ru-RU')}`
      : `${n.toLocaleString('ru-RU')} сом.`

  if (min && max) return `${fmt(min)} – ${fmt(max)}`
  if (min) return `от ${fmt(min)}`
  if (max) return `до ${fmt(max)}`
  return null
}

export function formatDate(date: Date | string, locale = 'ru') {
  const d = typeof date === 'string' ? new Date(date) : date
  return d.toLocaleDateString(locale === 'ru' ? 'ru-RU' : 'tg-TJ', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  })
}

export function timeAgo(date: Date | string, locale = 'ru') {
  const d = typeof date === 'string' ? new Date(date) : date
  const seconds = Math.floor((Date.now() - d.getTime()) / 1000)
  if (seconds < 60) return locale === 'ru' ? 'только что' : 'ҳозир'
  const minutes = Math.floor(seconds / 60)
  if (minutes < 60) return locale === 'ru' ? `${minutes} мин. назад` : `${minutes} дақиқа пеш`
  const hours = Math.floor(minutes / 60)
  if (hours < 24) return locale === 'ru' ? `${hours} ч. назад` : `${hours} соат пеш`
  const days = Math.floor(hours / 24)
  if (days < 7) return locale === 'ru' ? `${days} дн. назад` : `${days} рӯз пеш`
  return formatDate(d, locale)
}

export function calcMatchScore(jobSkills: string[], candidateSkills: string[]): number {
  if (!jobSkills.length) return 0
  const matches = jobSkills.filter(s =>
    candidateSkills.some(cs => cs.toLowerCase() === s.toLowerCase())
  )
  return Math.round((matches.length / jobSkills.length) * 100)
}

export const CATEGORIES = [
  'IT', 'Маркетинг', 'Продажи', 'Строительство',
  'Образование', 'Медицина', 'Финансы', 'Логистика',
  'Госсектор', 'HoReCa',
] as const

export const CITIES = [
  'Душанбе', 'Худжанд', 'Бохтар', 'Куляб', 'Истаравшан', 'Турсунзаде',
] as const
