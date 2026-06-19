'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useTranslations } from 'next-intl'
import type { Role } from '@prisma/client'
import Badge from '@/components/ui/Badge'
import { canManageRole } from '@/lib/roles'
import { toast } from '@/components/ui/Toaster'

interface User {
  id: string
  name: string
  email: string
  role: Role
  isRoot: boolean
}

interface Actor {
  id: string
  role: Role
  isRoot: boolean
}

type RoleOption = Role | 'OWNER'

export default function AdminUsersTable({ users, actor }: { users: User[]; actor: Actor }) {
  const t = useTranslations('admin')
  const router = useRouter()
  const [busy, setBusy] = useState<string | null>(null)

  const changeRole = async (id: string, value: RoleOption) => {
    const body = value === 'OWNER'
      ? { role: 'ADMIN', isRoot: true }
      : { role: value, isRoot: false }
    setBusy(id)
    try {
      const res = await fetch(`/api/admin/users/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      })
      if (res.ok) {
        toast(t('users.roleChanged'), 'success')
        router.refresh()
      } else {
        toast(t('actionError'), 'error')
      }
    } finally {
      setBusy(null)
    }
  }

  const ownerOptions: RoleOption[] = ['CANDIDATE', 'EMPLOYER', 'MODERATOR', 'ADMIN', 'OWNER']
  const adminOptions = (['CANDIDATE', 'EMPLOYER', 'MODERATOR'] as Role[])
    .filter(r => canManageRole({ role: actor.role, isRoot: actor.isRoot }, r))

  return (
    <div className="flex flex-col gap-2">
      {users.map(u => {
        const isSelf = u.id === actor.id
        // Владелец правит всех (кроме себя); админ — только не-владельцев с управляемой ролью.
        const editable = !isSelf && (actor.isRoot
          ? true
          : !u.isRoot && canManageRole({ role: actor.role, isRoot: actor.isRoot }, u.role))
        const current: RoleOption = u.isRoot ? 'OWNER' : u.role
        const options: RoleOption[] = actor.isRoot ? ownerOptions : adminOptions

        return (
          <div key={u.id} className="flex items-center gap-4 rounded-2xl bg-white ring-1 ring-black/5 px-4 py-3">
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-2">
                <p className="font-medium text-ink text-sm truncate">{u.name}</p>
                {u.isRoot && <Badge variant="sky">{t('owner')}</Badge>}
              </div>
              <p className="text-xs text-muted truncate">{u.email}</p>
            </div>
            {editable ? (
              <select
                value={current}
                disabled={busy === u.id}
                onChange={e => changeRole(u.id, e.target.value as RoleOption)}
                className="rounded-xl border border-black/10 bg-white px-3 py-2 text-sm text-ink outline-none focus:border-sky-blue/50"
              >
                {options.map(r => (
                  <option key={r} value={r}>{t(`users.roles.${r}`)}</option>
                ))}
              </select>
            ) : (
              <Badge variant="muted">{t(`users.roles.${current}`)}</Badge>
            )}
          </div>
        )
      })}
    </div>
  )
}
