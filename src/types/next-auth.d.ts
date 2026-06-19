import type { Role } from '@prisma/client'
import 'next-auth'

declare module 'next-auth' {
  interface User {
    role: Role
    isRoot?: boolean
  }
  interface Session {
    user: {
      id: string
      role: Role
      isRoot: boolean
      name?: string | null
      email?: string | null
      image?: string | null
    }
  }
}

declare module 'next-auth/jwt' {
  interface JWT {
    id: string
    role: Role
    isRoot: boolean
  }
}
