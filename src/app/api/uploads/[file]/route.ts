import { NextRequest, NextResponse } from 'next/server'
import { readFile } from 'fs/promises'
import path from 'path'

export const dynamic = 'force-dynamic'

const UPLOAD_DIR = path.join(process.cwd(), 'public', 'uploads')

const TYPES: Record<string, string> = {
  webp: 'image/webp',
  png: 'image/png',
  jpg: 'image/jpeg',
  jpeg: 'image/jpeg',
}

export async function GET(_req: NextRequest, { params }: { params: { file: string } }) {
  const name = path.basename(params.file)
  const ext = name.split('.').pop()?.toLowerCase() ?? ''
  // Только безопасное имя файла без обхода каталога и известное расширение.
  if (name !== params.file || !/^[\w-]+\.(webp|png|jpe?g)$/i.test(name) || !TYPES[ext]) {
    return new NextResponse('Not found', { status: 404 })
  }

  try {
    const data = await readFile(path.join(UPLOAD_DIR, name))
    return new NextResponse(new Uint8Array(data), {
      headers: {
        'Content-Type': TYPES[ext],
        'Cache-Control': 'public, max-age=31536000, immutable',
      },
    })
  } catch {
    return new NextResponse('Not found', { status: 404 })
  }
}
