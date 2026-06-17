import { getRequestConfig } from 'next-intl/server'
import { cookies } from 'next/headers'

export const locales = ['ru', 'tj'] as const
export type Locale = (typeof locales)[number]
export const defaultLocale: Locale = 'ru'

export default getRequestConfig(async ({ locale }) => {
  return {
    messages: (await import(`../../messages/${locale}.json`)).default,
  }
})
