import { PrismaClient, Role } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

// Идемпотентно: создаёт служебные аккаунты, если их ещё нет, и ничего не
// удаляет и не перезаписывает. Безопасно гонять на каждом деплое.
const password = process.env.BOOTSTRAP_PASSWORD || 'test1234'

const accounts = [
  { email: 'owner@test.tj', name: 'Owner', role: Role.ADMIN, isRoot: true },
  { email: 'admin@test.tj', name: 'Admin', role: Role.ADMIN, isRoot: false },
  { email: 'moderator@test.tj', name: 'Moderator', role: Role.MODERATOR, isRoot: false },
]

async function main() {
  const passwordHash = bcrypt.hashSync(password, 10)
  for (const a of accounts) {
    await prisma.user.upsert({
      where: { email: a.email },
      update: {},
      create: { email: a.email, name: a.name, role: a.role, isRoot: a.isRoot, passwordHash },
    })
    console.log(`✓ ${a.email}`)
  }
}

main()
  .catch((e) => { console.error(e); process.exit(1) })
  .finally(async () => { await prisma.$disconnect() })
