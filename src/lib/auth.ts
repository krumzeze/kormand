import NextAuth from 'next-auth'
import Credentials from 'next-auth/providers/credentials'
import { prisma } from './prisma'
import bcrypt from 'bcryptjs'
import { z } from 'zod'
import type { Role } from '@prisma/client'

export const { handlers, auth, signIn, signOut } = NextAuth({
  providers: [
    Credentials({
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Password', type: 'password' },
      },
      async authorize(credentials) {
        const parsed = z.object({
          email: z.string().email(),
          password: z.string().min(8),
        }).safeParse(credentials)

        if (!parsed.success) return null

        const user = await prisma.user.findUnique({
          where: { email: parsed.data.email },
        })
        if (!user) return null

        const valid = await bcrypt.compare(parsed.data.password, user.passwordHash)
        if (!valid) return null

        return {
          id: user.id,
          email: user.email,
          name: user.name,
          role: user.role,
          isRoot: user.isRoot,
          image: user.avatarUrl,
        }
      },
    }),
  ],
  callbacks: {
    jwt({ token, user, trigger, session }) {
      if (user) {
        token.id = user.id
        token.role = (user as any).role as Role
        token.isRoot = (user as any).isRoot as boolean
        token.picture = (user as any).image ?? null
      }
      // Живое обновление имени/аватара после правки в настройках (useSession().update)
      if (trigger === 'update' && session) {
        if (typeof session.name === 'string') token.name = session.name
        if ('image' in session) token.picture = session.image ?? null
      }
      return token
    },
    session({ session, token }) {
      session.user.id = token.id as string
      session.user.role = token.role as Role
      session.user.isRoot = (token.isRoot as boolean) ?? false
      return session
    },
  },
  pages: {
    signIn: '/auth/login',
    error: '/auth/login',
  },
  session: { strategy: 'jwt' },
})
