import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { saveImage, saveDocument, isAllowedDocument, MAX_UPLOAD_BYTES } from '@/lib/upload'

export async function POST(req: NextRequest) {
  const session = await auth()
  if (!session) return NextResponse.json({ error: 'UNAUTHORIZED' }, { status: 401 })

  const form = await req.formData()
  const file = form.get('file')
  const kind = form.get('kind')

  if (!(file instanceof File)) {
    return NextResponse.json({ error: 'NO_FILE' }, { status: 400 })
  }
  if (file.size > MAX_UPLOAD_BYTES) {
    return NextResponse.json({ error: 'TOO_LARGE' }, { status: 400 })
  }

  const isDocument = kind === 'document'
  if (isDocument ? !isAllowedDocument(file.type) : !file.type.startsWith('image/')) {
    return NextResponse.json({ error: 'INVALID_TYPE' }, { status: 400 })
  }

  try {
    const url = isDocument ? await saveDocument(file) : await saveImage(file)
    return NextResponse.json({ url })
  } catch {
    return NextResponse.json({ error: 'UPLOAD_FAILED' }, { status: 500 })
  }
}
