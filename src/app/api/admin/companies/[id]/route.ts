import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { requireApiRole } from '@/lib/authz'
import { moderateCompanySchema } from '@/lib/validations'

export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  const guard = await requireApiRole(['ADMIN', 'MODERATOR'])
  if (!guard.ok) return guard.response

  const body = await req.json()
  const parsed = moderateCompanySchema.safeParse(body)
  if (!parsed.success) return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 })

  const { isBlocked, blockReason, isVerified } = parsed.data
  const data: any = {}
  if (isBlocked !== undefined) {
    data.isBlocked = isBlocked
    data.blockReason = isBlocked ? blockReason ?? null : null
  }
  if (isVerified !== undefined) {
    data.isVerified = isVerified
    data.verifiedAt = isVerified ? new Date() : null
  }

  const company = await prisma.company.update({ where: { id: params.id }, data })
  return NextResponse.json(company)
}
