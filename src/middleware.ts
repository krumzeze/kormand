import createMiddleware from 'next-intl/middleware'
import { locales, defaultLocale } from './i18n/request'
import { auth } from './lib/auth'
import { NextRequest, NextResponse } from 'next/server'

const intlMiddleware = createMiddleware({
  locales,
  defaultLocale,
  localePrefix: 'always',
})

const protectedPaths = ['/dashboard', '/post-job']

export default async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl

  // Strip locale prefix for path checks
  const pathWithoutLocale = pathname.replace(/^\/(ru|tj)/, '') || '/'

  const isProtected = protectedPaths.some(p => pathWithoutLocale.startsWith(p))

  if (isProtected) {
    const session = await auth()
    if (!session) {
      const locale = pathname.split('/')[1] || defaultLocale
      return NextResponse.redirect(new URL(`/${locale}/auth/login`, req.url))
    }
  }

  return intlMiddleware(req)
}

export const config = {
  matcher: ['/((?!api|_next|_vercel|.*\\..*).*)'],
}
