import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { requireApiRole } from '@/lib/authz'
import { reportUpdateSchema } from '@/lib/validations'

export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  const guard = await requireApiRole(['ADMIN', 'MODERATOR'])
  if (!guard.ok) return guard.response

  const body = await req.json()
  const parsed = reportUpdateSchema.safeParse(body)
  if (!parsed.success) return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 })

  const report = await prisma.report.update({
    where: { id: params.id },
    data: {
      status: parsed.data.status,
      handledById: guard.user.id,
      resolvedAt: new Date(),
    },
  })

  return NextResponse.json(report)
}
