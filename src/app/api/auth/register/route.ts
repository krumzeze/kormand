import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { registerSchema } from '@/lib/validations'
import bcrypt from 'bcryptjs'

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const parsed = registerSchema.safeParse(body)

    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 })
    }

    const { name, email, password, role, phone } = parsed.data

    const existing = await prisma.user.findUnique({ where: { email } })
    if (existing) {
      return NextResponse.json({ error: 'EMAIL_TAKEN' }, { status: 409 })
    }

    const passwordHash = await bcrypt.hash(password, 12)

    const user = await prisma.user.create({
      data: {
        name,
        email,
        passwordHash,
        role,
        phone,
        ...(role === 'CANDIDATE' && {
          candidate: { create: {} },
        }),
      },
      select: { id: true, email: true, name: true, role: true },
    })

    return NextResponse.json(user, { status: 201 })
  } catch (e) {
    console.error(e)
    return NextResponse.json({ error: 'SERVER_ERROR' }, { status: 500 })
  }
}
