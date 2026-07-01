/**
 * Экспериментальный синхронизатор вакансий с somon.tj.
 *
 * Тестовая фича: импортные вакансии живут отдельно (source='somon'), в основную
 * выдачу не попадают (фильтр source:null), показываются на /external-jobs со
 * ссылкой на оригинал. Запуск раз в день (см. docker-compose, сервис sync-somon).
 *
 * Логика пропаж по счётчику непопаданий:
 *   - вакансия есть в источнике  → missCount=0, isActive=true, lastSeenAt=now
 *   - вакансии нет в источнике    → missCount++
 *       missCount === 1          → гасим (isActive=false), не удаляем (могла мигнуть)
 *       missCount >= MISS_LIMIT  → физически удаляем
 *   - guard: если сбор вернул подозрительно мало объявлений, проход прерывается
 *     ДО инкремента missCount, чтобы бан/сбой источника не выкосил каталог.
 */
import { PrismaClient, JobType, ExperienceLevel, Currency, Role } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

const SOURCE = 'somon'
const BASE = 'https://somon.tj/vakansii/'
const MISS_LIMIT = 3            // проходов подряд без вакансии до удаления
const MAX_PAGES = 20           // предохранитель от бесконечного обхода
const MIN_EXPECTED = 15        // меньше — считаем сбор битым, ничего не гасим
const PAGE_DELAY_MS = 1500     // вежливая пауза между запросами
const AD_DELAY_MS = 1200
const UA = 'Mozilla/5.0 (compatible; kormand-import/0.1; +https://kormand.tj)'

const sleep = (ms: number) => new Promise(r => setTimeout(r, ms))

interface AdStub {
  sourceId: string
  sourceUrl: string
  title: string
}

interface AdDetails {
  title: string
  city: string
  category: string
  description: string
  salaryMin: number | null
  salaryMax: number | null
  currency: Currency
}

async function fetchHtml(url: string): Promise<string | null> {
  try {
    const res = await fetch(url, { headers: { 'User-Agent': UA, 'Accept-Language': 'ru' } })
    if (!res.ok) {
      console.warn(`  ! ${res.status} на ${url}`)
      return null
    }
    return await res.text()
  } catch (e) {
    console.warn(`  ! ошибка запроса ${url}:`, (e as Error).message)
    return null
  }
}

function decodeEntities(s: string): string {
  return s
    .replace(/&amp;/g, '&').replace(/&lt;/g, '<').replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"').replace(/&#039;/g, "'").replace(/&nbsp;/g, ' ')
    .replace(/&laquo;/g, '«').replace(/&raquo;/g, '»')
}

function stripTags(html: string): string {
  return decodeEntities(html.replace(/<[^>]+>/g, ' ')).replace(/\s+/g, ' ').trim()
}

// Телефоны из текста не сохраняем — это персональные данные третьих лиц.
function stripPhones(text: string): string {
  return text
    .replace(/(?:\+?\d[\d\s().-]{6,}\d)/g, '[номер скрыт]')
    .replace(/\s+/g, ' ')
    .trim()
}

// Со страницы листинга берём только якорь: id, url, заголовок. Класс-обёртка
// у somon меняется, поэтому цепляемся за стабильный формат ссылки /adv/ID_slug/.
function parseListing(html: string): AdStub[] {
  const out: AdStub[] = []
  const seen = new Set<string>()
  const re = /<a[^>]+href="(\/adv\/(\d+)_[^"]*)"[^>]*>([\s\S]*?)<\/a>/g
  let m: RegExpExecArray | null
  while ((m = re.exec(html))) {
    const [, path, id, inner] = m
    if (seen.has(id)) continue
    const title = stripTags(inner)
    if (!title) continue
    seen.add(id)
    out.push({ sourceId: id, sourceUrl: new URL(path, BASE).toString(), title })
  }
  return out
}

// somon отдаёт цену микроразметкой schema.org. "Договорная" = content="0.00".
function parsePrice(html: string): { salaryMin: number | null; salaryMax: number | null; currency: Currency } {
  const cur = html.match(/itemprop="priceCurrency"\s+content="([^"]+)"/i)?.[1]
  const currency = cur === 'USD' ? Currency.USD : Currency.TJS
  const raw = html.match(/itemprop="price"\s+content="([^"]+)"/i)?.[1]
  const val = raw ? Math.round(parseFloat(raw)) : 0
  if (!val || Number.isNaN(val)) return { salaryMin: null, salaryMax: null, currency }
  return { salaryMin: val, salaryMax: val, currency }
}

function parseDetails(html: string, fallbackTitle: string): AdDetails {
  const h1 = html.match(/<h1[^>]*itemprop="name"[^>]*>([\s\S]*?)<\/h1>/i) || html.match(/<h1[^>]*>([\s\S]*?)<\/h1>/i)
  const title = h1 ? stripTags(h1[1]) : fallbackTitle

  const catM = html.match(/data-category="([^"]+)"/i)
  const category = catM ? decodeEntities(catM[1]).trim() : 'Прочее'

  // Город есть в <title>: "… №16612655 в г. Душанбе - <категория> - Somon.tj".
  const titleTag = html.match(/<title>([\s\S]*?)<\/title>/i)?.[1] || ''
  const cityM = titleTag.match(/в\s+г\.?\s*([А-ЯЁ][А-Яа-яёЁ-]+)/)
  const city = cityM ? cityM[1].trim() : 'Не указан'

  const body = html.match(/itemprop="description"[^>]*>([\s\S]*?)<\/div>/i)
  const description = stripPhones(body ? stripTags(body[1]) : '')

  const { salaryMin, salaryMax, currency } = parsePrice(html)
  return { title, city, category, description, salaryMin, salaryMax, currency }
}

async function ensureStubCompany(): Promise<string> {
  const owner = await prisma.user.upsert({
    where: { email: 'owner@test.tj' },
    update: {},
    create: {
      email: 'owner@test.tj',
      passwordHash: bcrypt.hashSync('test1234', 10),
      role: Role.ADMIN,
      isRoot: true,
      name: 'Owner',
    },
  })
  const company = await prisma.company.upsert({
    where: { ownerId: owner.id },
    update: {},
    create: {
      ownerId: owner.id,
      name: 'somon.tj',
      description: 'Импортированные вакансии с somon.tj. Источник указан в каждой вакансии.',
      website: 'https://somon.tj',
      cities: [],
      industry: 'Агрегатор',
    },
  })
  return company.id
}

async function collectStubs(): Promise<AdStub[]> {
  const all = new Map<string, AdStub>()
  for (let page = 1; page <= MAX_PAGES; page++) {
    const url = page === 1 ? BASE : `${BASE}?page=${page}`
    const html = await fetchHtml(url)
    if (!html) break
    const stubs = parseListing(html)
    if (stubs.length === 0) break            // дальше пусто — конец списка
    let added = 0
    for (const s of stubs) if (!all.has(s.sourceId)) { all.set(s.sourceId, s); added++ }
    console.log(`  стр.${page}: ${stubs.length} объявл., новых ${added}`)
    if (added === 0) break                    // страница-дубликат — конец пагинации
    await sleep(PAGE_DELAY_MS)
  }
  return [...all.values()]
}

async function main() {
  console.log('🔄 Синхронизация вакансий с somon.tj…')
  const companyId = await ensureStubCompany()

  const stubs = await collectStubs()
  console.log(`Собрано ${stubs.length} объявлений.`)

  // Guard: подозрительно мало — источник, вероятно, недоступен/забанил. Не трогаем каталог.
  if (stubs.length < MIN_EXPECTED) {
    console.error(`⛔ Собрано меньше ${MIN_EXPECTED} — считаю сбор битым, ничего не меняю.`)
    process.exit(1)
  }

  const seenIds = new Set(stubs.map(s => s.sourceId))

  // Какие из собранных ещё не в базе — только для них тянем детальную страницу.
  const existing = await prisma.job.findMany({
    where: { source: SOURCE },
    select: { sourceId: true },
  })
  const existingIds = new Set(existing.map(j => j.sourceId))

  let created = 0
  let refreshed = 0
  for (const stub of stubs) {
    if (existingIds.has(stub.sourceId)) {
      // Уже есть — просто отмечаем живой, деталь не перезапрашиваем.
      await prisma.job.update({
        where: { source_sourceId: { source: SOURCE, sourceId: stub.sourceId } },
        data: { isActive: true, missCount: 0, lastSeenAt: new Date() },
      })
      refreshed++
      continue
    }
    // Новое объявление — тянем деталь.
    const html = await fetchHtml(stub.sourceUrl)
    await sleep(AD_DELAY_MS)
    const d = html ? parseDetails(html, stub.title) : null
    await prisma.job.create({
      data: {
        companyId,
        title: (d?.title || stub.title).slice(0, 200),
        description: d?.description || stub.title,
        city: d?.city || 'Не указан',
        type: JobType.FULL_TIME,
        level: ExperienceLevel.JUNIOR,
        salaryMin: d?.salaryMin ?? null,
        salaryMax: d?.salaryMax ?? null,
        currency: d?.currency ?? Currency.TJS,
        skills: [],
        category: d?.category || 'Прочее',
        source: SOURCE,
        sourceId: stub.sourceId,
        sourceUrl: stub.sourceUrl,
        lastSeenAt: new Date(),
        missCount: 0,
      },
    })
    created++
  }

  // Пропавшие: source=somon, которых не было в этом проходе.
  const gone = await prisma.job.findMany({
    where: { source: SOURCE, sourceId: { notIn: [...seenIds] } },
    select: { id: true, sourceId: true, missCount: true },
  })

  let deactivated = 0
  let deleted = 0
  for (const job of gone) {
    const next = job.missCount + 1
    if (next >= MISS_LIMIT) {
      await prisma.job.delete({ where: { id: job.id } })
      deleted++
    } else {
      await prisma.job.update({
        where: { id: job.id },
        data: { isActive: false, missCount: next },
      })
      deactivated++
    }
  }

  console.log('✅ Готово.')
  console.log(`  создано:      ${created}`)
  console.log(`  подтверждено: ${refreshed}`)
  console.log(`  погашено:     ${deactivated}`)
  console.log(`  удалено:      ${deleted}`)
}

main()
  .catch(e => { console.error(e); process.exit(1) })
  .finally(async () => { await prisma.$disconnect() })
