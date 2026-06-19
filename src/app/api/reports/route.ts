import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { auth } from '@/lib/auth'
import { reportSchema } from '@/lib/validations'

export async function POST(req: NextRequest) {
  const session = await auth()
  if (!session) return NextResponse.json({ error: 'UNAUTHORIZED' }, { status: 401 })

  const body = await req.json()
  const parsed = reportSchema.safeParse(body)
  if (!parsed.success) return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 })

  const { target, jobId, companyId, reason, details } = parsed.data
  const report = await prisma.report.create({
    data: {
      target,
      jobId: target === 'JOB' ? jobId : null,
      companyId: target === 'COMPANY' ? companyId : null,
      reporterId: session.user.id,
      reason,
      details,
    },
  })

  return NextResponse.json(report, { status: 201 })
}
