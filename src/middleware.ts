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
  const locale = pathname.split('/')[1] || defaultLocale

  const isProtected = protectedPaths.some(p => pathWithoutLocale.startsWith(p))
  const isAdminArea = pathWithoutLocale.startsWith('/admin')

  if (isProtected || isAdminArea) {
    const session = await auth()
    if (!session) {
      return NextResponse.redirect(new URL(`/${locale}/auth/login`, req.url))
    }
    if (isAdminArea && session.user.role !== 'ADMIN' && session.user.role !== 'MODERATOR') {
      return NextResponse.redirect(new URL(`/${locale}`, req.url))
    }
  }

  return intlMiddleware(req)
}

export const config = {
  matcher: ['/((?!api|_next|_vercel|.*\\..*).*)'],
}
