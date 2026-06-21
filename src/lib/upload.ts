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
  // Отдаём через роут, а не как статику: в standalone-сборке Next не
  // раздаёт файлы, дописанные в /public после билда (см. api/uploads/[file]).
  return `/api/uploads/${name}`
}

// Резюме храним как есть (PDF не прогоняем через sharp). Расширение берём
// из MIME, имя — случайный uuid, чтобы не доверять имени от клиента.
const DOC_EXT: Record<string, string> = {
  'application/pdf': 'pdf',
  'image/jpeg': 'jpg',
  'image/png': 'png',
  'image/webp': 'webp',
}

export function isAllowedDocument(type: string): boolean {
  return type in DOC_EXT
}

export async function saveDocument(file: File): Promise<string> {
  const ext = DOC_EXT[file.type]
  if (!ext) throw new Error('INVALID_TYPE')

  const buffer = Buffer.from(await file.arrayBuffer())
  await mkdir(UPLOAD_DIR, { recursive: true })
  const name = `${randomUUID()}.${ext}`
  await writeFile(path.join(UPLOAD_DIR, name), buffer)
  return `/api/uploads/${name}`
}
