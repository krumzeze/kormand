import type { Role } from '@prisma/client'

export function isAdmin(role: Role | undefined): boolean {
  return role === 'ADMIN'
}

export function canModerate(role: Role | undefined): boolean {
  return role === 'ADMIN' || role === 'MODERATOR'
}

type Actor = { role: Role; isRoot: boolean }

// Владелец (isRoot) назначает любые роли; админ — только не-админские.
// Роль ADMIN и владельца через UI выдать/снять нельзя.
export function canManageRole(actor: Actor, targetRole: Role): boolean {
  if (actor.isRoot) return true
  if (actor.role === 'ADMIN') return targetRole !== 'ADMIN'
  return false
}
