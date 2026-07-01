/**
 * Экспериментальный синхронизатор вакансий с somon.tj.
 *
 * Тестовая фича: импортные вакансии живут отдельно (source='somon'), в основную
 * выдачу не попадают (фильтр source:null), показываются на /external-jobs со
 * ссылкой на оригинал. Запуск раз в день (см. docker-compose, сервис sync-somon).
 *
 * Все поля берём прямо из карточек листинга (заголовок, описание, город,
 * категория, цена) — детальные страницы не запрашиваем, поэтому полный обход
 * ~130 страниц стоит ~130 запросов, а не тысячи.
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
const MAX_PAGES = 200           // предохранитель; реально обход прервётся раньше
const MIN_EXPECTED = 100        // меньше — считаем сбор битым, ничего не гасим
const PAGE_DELAY_MS = 1200      // вежливая пауза между страницами
const UA = 'Mozilla/5.0 (compatible; kormand-import/0.1; +https://kormand.tj)'

const sleep = (ms: number) => new Promise(r => setTimeout(r, ms))

interface AdRecord {
  sourceId: string
  sourceUrl: string
  title: string
  city: string
  category: string
  description: string
  salaryMin: number | null
  salaryMax: number | null
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

function firstMatch(slice: string, re: RegExp): string | null {
  const m = slice.match(re)
  return m ? m[1] : null
}

function parseCardSalary(slice: string): { min: number | null; max: number | null } {
  const raw = firstMatch(slice, /announcement-block__price[^>]*>([\s\S]*?)<\/div>/i)
  if (!raw) return { min: null, max: null }
  const text = stripTags(raw)
  if (/договорн/i.test(text)) return { min: null, max: null }
  const nums = (text.match(/\d[\d\s]*\d|\d/g) || []).map(n => parseInt(n.replace(/\s/g, ''), 10))
  if (nums.length === 0) return { min: null, max: null }
  if (nums.length === 1) return { min: nums[0], max: nums[0] }
  return { min: nums[0], max: nums[1] }
}

// Разбираем страницу листинга на карточки: якорь-заголовок и всё, что до
// следующего такого якоря. Классы announcement-block__* стабильны для VIP и
// обычных объявлений.
function parseCards(html: string): AdRecord[] {
  const anchorRe = /<a[^>]*class="announcement-block__title[^"]*"[^>]*href="(\/adv\/(\d+)_[^"]*)"[^>]*>([\s\S]*?)<\/a>/g
  const anchors: { id: string; url: string; title: string; at: number; end: number }[] = []
  let m: RegExpExecArray | null
  while ((m = anchorRe.exec(html))) {
    anchors.push({
      url: new URL(m[1], BASE).toString(),
      id: m[2],
      title: stripTags(m[3]),
      at: m.index,
      end: anchorRe.lastIndex,
    })
  }

  const out: AdRecord[] = []
  const seen = new Set<string>()
  for (let i = 0; i < anchors.length; i++) {
    const a = anchors[i]
    if (seen.has(a.id) || !a.title) continue
    seen.add(a.id)
    const slice = html.slice(a.end, anchors[i + 1]?.at ?? a.end + 2000)

    const descRaw = firstMatch(slice, /announcement-block__description[^>]*>([\s\S]*?)<\/div>/i)
    const description = stripPhones(descRaw ? stripTags(descRaw) : '')

    // Блок даты: "<Компания>, Сегодня 22:02, <Город>" — город после последней запятой.
    const dateRaw = firstMatch(slice, /announcement-block__date[^>]*>([\s\S]*?)<\/div>/i)
    const dateParts = dateRaw ? stripTags(dateRaw).split(',').map(s => s.trim()).filter(Boolean) : []
    const city = dateParts.length ? dateParts[dateParts.length - 1] : 'Не указан'

    // Хлебные крошки: "Вакансии » <категория>" — берём последний <span>.
    const crumbsRaw = firstMatch(slice, /announcement-block__breadcrumbs[^>]*>([\s\S]*?)<\/div>/i)
    const crumbSpans = crumbsRaw ? [...crumbsRaw.matchAll(/<span[^>]*>([^<]+)<\/span>/g)].map(x => x[1].trim()) : []
    const category = crumbSpans.length ? crumbSpans[crumbSpans.length - 1] : 'Прочее'

    const { min, max } = parseCardSalary(slice)

    out.push({
      sourceId: a.id,
      sourceUrl: a.url,
      title: a.title.slice(0, 200),
      city: city || 'Не указан',
      category: category || 'Прочее',
      description,
      salaryMin: min,
      salaryMax: max,
    })
  }
  return out
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

async function collectAll(): Promise<AdRecord[]> {
  const all = new Map<string, AdRecord>()
  for (let page = 1; page <= MAX_PAGES; page++) {
    const url = page === 1 ? BASE : `${BASE}?page=${page}`
    const html = await fetchHtml(url)
    if (!html) break
    const cards = parseCards(html)
    if (cards.length === 0) break            // пустая страница — конец списка
    let added = 0
    for (const c of cards) if (!all.has(c.sourceId)) { all.set(c.sourceId, c); added++ }
    if (page % 10 === 0 || page === 1) console.log(`  стр.${page}: +${added} (всего ${all.size})`)
    if (added === 0) break                    // страница-дубликат — конец пагинации
    await sleep(PAGE_DELAY_MS)
  }
  return [...all.values()]
}

async function main() {
  console.log('🔄 Синхронизация вакансий с somon.tj…')
  const companyId = await ensureStubCompany()

  const ads = await collectAll()
  console.log(`Собрано ${ads.length} объявлений.`)

  // Guard: подозрительно мало — источник, вероятно, недоступен/забанил. Не трогаем каталог.
  if (ads.length < MIN_EXPECTED) {
    console.error(`⛔ Собрано меньше ${MIN_EXPECTED} — считаю сбор битым, ничего не меняю.`)
    process.exit(1)
  }

  const seenIds = new Set(ads.map(a => a.sourceId))

  const existing = await prisma.job.findMany({ where: { source: SOURCE }, select: { sourceId: true } })
  const existingIds = new Set(existing.map(j => j.sourceId))

  let created = 0
  let updated = 0
  for (const ad of ads) {
    const data = {
      title: ad.title,
      description: ad.description || ad.title,
      city: ad.city,
      category: ad.category,
      salaryMin: ad.salaryMin,
      salaryMax: ad.salaryMax,
    }
    await prisma.job.upsert({
      where: { source_sourceId: { source: SOURCE, sourceId: ad.sourceId } },
      update: { ...data, isActive: true, missCount: 0, lastSeenAt: new Date() },
      create: {
        ...data,
        companyId,
        type: JobType.FULL_TIME,
        level: ExperienceLevel.JUNIOR,
        currency: Currency.TJS,
        skills: [],
        source: SOURCE,
        sourceId: ad.sourceId,
        sourceUrl: ad.sourceUrl,
        lastSeenAt: new Date(),
        missCount: 0,
      },
    })
    if (existingIds.has(ad.sourceId)) updated++
    else created++
  }

  // Пропавшие: source=somon, которых не было в этом проходе.
  const gone = await prisma.job.findMany({
    where: { source: SOURCE, sourceId: { notIn: [...seenIds] } },
    select: { id: true, missCount: true },
  })

  let deactivated = 0
  let deleted = 0
  for (const job of gone) {
    const next = job.missCount + 1
    if (next >= MISS_LIMIT) {
      await prisma.job.delete({ where: { id: job.id } })
      deleted++
    } else {
      await prisma.job.update({ where: { id: job.id }, data: { isActive: false, missCount: next } })
      deactivated++
    }
  }

  console.log('✅ Готово.')
  console.log(`  создано:   ${created}`)
  console.log(`  обновлено: ${updated}`)
  console.log(`  погашено:  ${deactivated}`)
  console.log(`  удалено:   ${deleted}`)
}

main()
  .catch(e => { console.error(e); process.exit(1) })
  .finally(async () => { await prisma.$disconnect() })
