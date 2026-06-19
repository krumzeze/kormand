import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { requireApiRole, canManageRole } from '@/lib/authz'
import { roleUpdateSchema } from '@/lib/validations'

export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  const guard = await requireApiRole(['ADMIN'])
  if (!guard.ok) return guard.response

  if (guard.user.id === params.id) {
    return NextResponse.json({ error: 'CANNOT_CHANGE_SELF' }, { status: 403 })
  }

  const body = await req.json()
  const parsed = roleUpdateSchema.safeParse(body)
  if (!parsed.success) return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 })

  const target = await prisma.user.findUnique({ where: { id: params.id } })
  if (!target) return NextResponse.json({ error: 'NOT_FOUND' }, { status: 404 })

  const actor = { role: guard.user.role, isRoot: guard.user.isRoot }
  const { isRoot: nextIsRoot } = parsed.data

  // Касаться владельца или выдавать роль владельца может только владелец.
  if ((target.isRoot || nextIsRoot) && !actor.isRoot) {
    return NextResponse.json({ error: 'FORBIDDEN' }, { status: 403 })
  }
  // Для не-владельца: и текущую, и новую роль актор должен иметь право назначать.
  if (!actor.isRoot && (!canManageRole(actor, target.role) || !canManageRole(actor, parsed.data.role))) {
    return NextResponse.json({ error: 'FORBIDDEN' }, { status: 403 })
  }

  // Владелец всегда админ.
  const role = nextIsRoot ? 'ADMIN' : parsed.data.role
  const updated = await prisma.user.update({
    where: { id: params.id },
    data: { role, isRoot: nextIsRoot },
    select: { id: true, email: true, name: true, role: true, isRoot: true, createdAt: true },
  })

  return NextResponse.json(updated)
}
