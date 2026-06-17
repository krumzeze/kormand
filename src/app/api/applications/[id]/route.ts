import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { auth } from '@/lib/auth'
import { z } from 'zod'
import { ApplicationStatus } from '@prisma/client'

const statusSchema = z.object({
  status: z.nativeEnum(ApplicationStatus),
})

export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  const session = await auth()
  if (!session || session.user.role !== 'EMPLOYER') {
    return NextResponse.json({ error: 'FORBIDDEN' }, { status: 403 })
  }

  const body = await req.json()
  const parsed = statusSchema.safeParse(body)
  if (!parsed.success) return NextResponse.json({ error: 'INVALID_STATUS' }, { status: 400 })

  const app = await prisma.application.findUnique({
    where: { id: params.id },
    include: { job: { include: { company: true } } },
  })
  if (!app) return NextResponse.json({ error: 'NOT_FOUND' }, { status: 404 })
  if (app.job.company.ownerId !== session.user.id) {
    return NextResponse.json({ error: 'FORBIDDEN' }, { status: 403 })
  }

  const updated = await prisma.application.update({
    where: { id: params.id },
    data: { status: parsed.data.status },
    include: { user: { select: { name: true, email: true } } },
  })

  return NextResponse.json(updated)
}
