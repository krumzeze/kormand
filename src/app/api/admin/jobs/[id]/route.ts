import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { requireApiRole } from '@/lib/authz'
import { moderateJobSchema } from '@/lib/validations'

export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  const guard = await requireApiRole(['ADMIN', 'MODERATOR'])
  if (!guard.ok) return guard.response

  const body = await req.json()
  const parsed = moderateJobSchema.safeParse(body)
  if (!parsed.success) return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 })

  const { isBlocked, blockReason } = parsed.data
  const job = await prisma.job.update({
    where: { id: params.id },
    data: { isBlocked, blockReason: isBlocked ? blockReason ?? null : null },
  })

  return NextResponse.json(job)
}
