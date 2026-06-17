# Kormand

Сайт поиска работы для Таджикистана. Соискатель ищет вакансии и откликается, работодатель публикует их и ведёт отклики. Всё на Next.js: фронт, API и работа с базой в одном проекте. Интерфейс на русском и таджикском, зарплаты в сомони.

Это MVP. Чатов и уведомлений внутри сайта нет - задача свести стороны, дальше они списываются по контактам. AI-функции вроде умного поиска отложены на потом.

## Запуск локально

Нужны Node 20+ и Docker. Базу удобнее поднять контейнером, а сам сайт гонять в dev-режиме.

```bash
# зависимости
npm install

# Postgres в контейнере
docker compose up -d postgres

# переменные окружения
cp .env.example .env
```

В `.env` впишите `AUTH_SECRET`. Сгенерировать:

```bash
openssl rand -base64 32
# или через node, если openssl нет
node -e "console.log(require('crypto').randomBytes(32).toString('base64'))"
```

Дальше миграция, тестовые данные и запуск:

```bash
npx prisma migrate dev
npm run db:seed
npm run dev
```

Сайт откроется на http://localhost:3000 (с редиректом на `/ru`).

Про порт базы: в `docker-compose.yml` Postgres проброшен на хост как `5500:5432`. На Windows порт 5432 часто занят зарезервированным диапазоном Hyper-V, и контейнер с ним не стартует. Поэтому в `.env` для локальной разработки:

```
DATABASE_URL="postgresql://kormand:kormand_pass@localhost:5500/kormand_db"
```

Внутри Docker-сети приложение ходит к базе по `postgres:5432`, так что на сервере порт хоста роли не играет.

### Всё в контейнерах

Если не хочется ставить Node, можно поднять сразу базу и приложение:

```bash
cp .env.example .env   # впишите AUTH_SECRET
docker compose up -d --build
docker compose exec app npx prisma migrate deploy
docker compose exec app npm run db:seed
```

## Переменные окружения

| Переменная | Зачем | Пример |
|---|---|---|
| `DATABASE_URL` | подключение к PostgreSQL | `postgresql://kormand:kormand_pass@localhost:5500/kormand_db` |
| `AUTH_SECRET` | подпись JWT, 32+ символа | вывод `openssl rand -base64 32` |
| `AUTH_URL` | базовый URL | `http://localhost:3000` |
| `NEXT_PUBLIC_APP_URL` | публичный URL | `http://localhost:3000` |

`.env` в репозиторий не коммитим (он в `.gitignore`), в репо лежит только `.env.example`.

## Тестовые аккаунты

Появляются после `npm run db:seed`. Это для разработки, в проде пароли смените.

| Email | Пароль | Роль |
|---|---|---|
| `admin@kormand.tj` | `admin123` | админ |
| `employer@techasia.tj` | `employer123` | работодатель |
| `candidate@mail.tj` | `candidate123` | соискатель |

## Деплой

### Vercel

Быстрый путь. Поставьте `vercel`, выполните `vercel --prod`, пропишите переменные окружения в дашборде и подключите внешнюю PostgreSQL (Supabase, Neon, Railway).

### Свой сервер с Docker

```bash
git clone https://github.com/krumzeze/kormand.git
cd kormand
cp .env.example .env   # AUTH_SECRET и боевой DATABASE_URL
docker compose up -d --build
docker compose exec app npx prisma migrate deploy
```

Сверху обычно вешают Nginx как reverse proxy на порт 3000. Миграции после клона обязательны, иначе база пустая и приложение падает на первом же запросе.
