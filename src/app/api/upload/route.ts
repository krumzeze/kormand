import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { saveImage, MAX_UPLOAD_BYTES } from '@/lib/upload'

export async function POST(req: NextRequest) {
  const session = await auth()
  if (!session) return NextResponse.json({ error: 'UNAUTHORIZED' }, { status: 401 })

  const form = await req.formData()
  const file = form.get('file')

  if (!(file instanceof File)) {
    return NextResponse.json({ error: 'NO_FILE' }, { status: 400 })
  }
  if (!file.type.startsWith('image/')) {
    return NextResponse.json({ error: 'INVALID_TYPE' }, { status: 400 })
  }
  if (file.size > MAX_UPLOAD_BYTES) {
    return NextResponse.json({ error: 'TOO_LARGE' }, { status: 400 })
  }

  try {
    const url = await saveImage(file)
    return NextResponse.json({ url })
  } catch {
    return NextResponse.json({ error: 'UPLOAD_FAILED' }, { status: 500 })
  }
}
