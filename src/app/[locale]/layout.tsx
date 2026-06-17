import type { Metadata } from 'next'
import { Manrope, Inter } from 'next/font/google'
import { NextIntlClientProvider } from 'next-intl'
import { notFound } from 'next/navigation'
import { SessionProvider } from 'next-auth/react'
import { locales } from '@/i18n/request'
import { auth } from '@/lib/auth'
import Header from '@/components/layout/Header'
import Footer from '@/components/layout/Footer'
import { Toaster } from '@/components/ui/Toaster'
import '../globals.css'

const heading = Manrope({
  subsets: ['latin', 'cyrillic'],
  variable: '--font-heading',
  display: 'swap',
})

const inter = Inter({
  subsets: ['latin', 'cyrillic'],
  variable: '--font-inter',
  display: 'swap',
})

export const metadata: Metadata = {
  title: 'Kormand — Работа в Таджикистане',
  description: 'Найдите работу или лучших сотрудников на платформе №1 в Таджикистане',
  openGraph: {
    title: 'Kormand',
    description: 'Job marketplace для Таджикистана',
    locale: 'ru_RU',
    type: 'website',
  },
}

export default async function LocaleLayout({
  children,
  params: { locale },
}: {
  children: React.ReactNode
  params: { locale: string }
}) {
  if (!locales.includes(locale as (typeof locales)[number])) notFound()
  const messages = (await import(`../../../messages/${locale}.json`)).default
  const session = await auth()

  return (
    <html lang={locale} className={`${heading.variable} ${inter.variable}`}>
      <body className="bg-bg font-body antialiased">
        <SessionProvider session={session}>
          <NextIntlClientProvider
            locale={locale}
            messages={messages}
            now={new Date()}
            timeZone="Asia/Dushanbe"
          >
            <div className="flex min-h-[100dvh] flex-col">
              <Header />
              <main className="flex-1">{children}</main>
              <Footer />
            </div>
            <Toaster />
          </NextIntlClientProvider>
        </SessionProvider>
      </body>
    </html>
  )
}
