import { writeFile, mkdir } from 'fs/promises'
import path from 'path'
import { randomUUID } from 'crypto'
import sharp from 'sharp'

const UPLOAD_DIR = path.join(process.cwd(), 'public', 'uploads')

export const MAX_UPLOAD_BYTES = 5 * 1024 * 1024

// Логотипы и аватары храним локально в /public/uploads — позже можно
// переключить на S3/MinIO, не трогая вызовы (см. договорённости проекта).
export async function saveImage(file: File, size = 512): Promise<string> {
  const input = Buffer.from(await file.arrayBuffer())
  const output = await sharp(input)
    .rotate()
    .resize(size, size, { fit: 'cover' })
    .webp({ quality: 82 })
    .toBuffer()

  await mkdir(UPLOAD_DIR, { recursive: true })
  const name = `${randomUUID()}.webp`
  await writeFile(path.join(UPLOAD_DIR, name), output)
  return `/uploads/${name}`
}
