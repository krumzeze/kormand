import { NextResponse } from 'next/server'
import type { Role } from '@prisma/client'
import { auth } from './auth'

export { isAdmin, canModerate, canManageRole } from './roles'

type SessionUser = { id: string; role: Role; isRoot: boolean }

export async function requireApiRole(roles: Role[]): Promise<
  { ok: true; user: SessionUser } | { ok: false; response: NextResponse }
> {
  const session = await auth()
  if (!session) {
    return { ok: false, response: NextResponse.json({ error: 'UNAUTHORIZED' }, { status: 401 }) }
  }
  if (!roles.includes(session.user.role)) {
    return { ok: false, response: NextResponse.json({ error: 'FORBIDDEN' }, { status: 403 }) }
  }
  return { ok: true, user: session.user as SessionUser }
}
