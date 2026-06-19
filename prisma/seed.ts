import { PrismaClient, Role, JobType, ExperienceLevel, Currency, ApplicationStatus } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

const CITIES = ['Душанбе', 'Худжанд', 'Бохтар', 'Куляб', 'Истаравшан', 'Турсунзаде']
const CATEGORIES = ['IT', 'Маркетинг', 'Продажи', 'Строительство', 'Образование', 'Медицина', 'Финансы', 'Логистика', 'Госсектор', 'HoReCa']

async function main() {
  console.log('🌱 Seeding database...')

  // Clear existing data
  await prisma.report.deleteMany()
  await prisma.application.deleteMany()
  await prisma.job.deleteMany()
  await prisma.company.deleteMany()
  await prisma.candidateProfile.deleteMany()
  await prisma.user.deleteMany()

  const hash = (pwd: string) => bcrypt.hashSync(pwd, 10)

  // ── Users ──────────────────────────────────────────────────────────
  const owner = await prisma.user.create({
    data: {
      email: 'owner@test.tj',
      passwordHash: hash('test1234'),
      role: Role.ADMIN,
      isRoot: true,
      name: 'Owner',
      phone: '+992900000001',
    },
  })

  const admin = await prisma.user.create({
    data: {
      email: 'admin@test.tj',
      passwordHash: hash('test1234'),
      role: Role.ADMIN,
      name: 'Admin',
      phone: '+992900000000',
    },
  })

  const moderator = await prisma.user.create({
    data: {
      email: 'moderator@test.tj',
      passwordHash: hash('test1234'),
      role: Role.MODERATOR,
      name: 'Moderator',
      phone: '+992900000002',
    },
  })

  const employer1 = await prisma.user.create({
    data: {
      email: 'employer@techasia.tj',
      passwordHash: hash('employer123'),
      role: Role.EMPLOYER,
      name: 'Алишер Рахимов',
      phone: '+992900111222',
    },
  })

  const employer2 = await prisma.user.create({
    data: {
      email: 'hr@talentplus.tj',
      passwordHash: hash('employer123'),
      role: Role.EMPLOYER,
      name: 'Зарина Назарова',
      phone: '+992900333444',
    },
  })

  const employer3 = await prisma.user.create({
    data: {
      email: 'jobs@dushanbesoft.tj',
      passwordHash: hash('employer123'),
      role: Role.EMPLOYER,
      name: 'Рустам Каримов',
      phone: '+992900555666',
    },
  })

  const candidate1 = await prisma.user.create({
    data: {
      email: 'candidate@mail.tj',
      passwordHash: hash('candidate123'),
      role: Role.CANDIDATE,
      name: 'Бахром Юсупов',
      phone: '+992900777888',
    },
  })

  const candidate2 = await prisma.user.create({
    data: {
      email: 'dev@mail.ru',
      passwordHash: hash('candidate123'),
      role: Role.CANDIDATE,
      name: 'Нилуфар Саидова',
      phone: '+992900999000',
    },
  })

  // ── Candidate Profiles ──────────────────────────────────────────────
  await prisma.candidateProfile.create({
    data: {
      userId: candidate1.id,
      headline: 'Frontend-разработчик',
      about: 'Опытный разработчик на React и TypeScript, 3 года в коммерческих проектах.',
      city: 'Душанбе',
      skills: ['React', 'TypeScript', 'Next.js', 'Tailwind CSS', 'Node.js'],
      experienceLevel: ExperienceLevel.MIDDLE,
    },
  })

  await prisma.candidateProfile.create({
    data: {
      userId: candidate2.id,
      headline: 'UI/UX Дизайнер',
      about: 'Создаю интерфейсы с фокусом на пользовательский опыт. Знаю Figma и прототипирование.',
      city: 'Худжанд',
      skills: ['Figma', 'UI/UX', 'Prototyping', 'Photoshop', 'CSS'],
      experienceLevel: ExperienceLevel.JUNIOR,
    },
  })

  // ── Companies ──────────────────────────────────────────────────────
  const companies = await Promise.all([
    prisma.company.create({
      data: {
        ownerId: employer1.id,
        name: 'TechAsia',
        description: 'Ведущая IT-компания Таджикистана. Разрабатываем мобильные и веб-приложения для рынков СНГ.',
        website: 'https://techasia.tj',
        city: 'Душанбе',
        industry: 'IT',
        ratingAvg: 4.7,
      },
    }),
    prisma.company.create({
      data: {
        ownerId: employer2.id,
        name: 'TalentPlus',
        description: 'HR-агентство нового поколения. Помогаем компаниям находить лучших специалистов.',
        website: 'https://talentplus.tj',
        city: 'Душанбе',
        industry: 'HR & Рекрутинг',
        ratingAvg: 4.5,
      },
    }),
    prisma.company.create({
      data: {
        ownerId: employer3.id,
        name: 'DushanbeSoft',
        description: 'Аутсорсинговая компания. Реализуем проекты для клиентов из Европы и Ближнего Востока.',
        website: 'https://dushanbesoft.tj',
        city: 'Душанбе',
        industry: 'IT',
        ratingAvg: 4.3,
      },
    }),
  ])

  // ── Jobs ──────────────────────────────────────────────────────────
  const jobData = [
    // TechAsia jobs
    {
      companyId: companies[0].id,
      title: 'Senior React Developer',
      description: `Ищем опытного React-разработчика для работы над флагманским продуктом компании.\n\n**Обязанности:**\n- Разработка новых фич и поддержка существующего кода\n- Code review и менторинг junior-разработчиков\n- Участие в архитектурных решениях\n\n**Требования:**\n- 4+ года опыта с React\n- Глубокое знание TypeScript\n- Опыт с Next.js, Redux/Zustand\n- Понимание принципов производительности`,
      city: 'Душанбе',
      type: JobType.FULL_TIME,
      level: ExperienceLevel.SENIOR,
      salaryMin: 33000,
      salaryMax: 55000,
      currency: Currency.TJS,
      skills: ['React', 'TypeScript', 'Next.js', 'Redux', 'GraphQL'],
      category: 'IT',
      isFeatured: true,
      views: 245,
    },
    {
      companyId: companies[0].id,
      title: 'Backend Node.js разработчик',
      description: `Разрабатываем масштабируемое API для fintech-продукта.\n\n**Обязанности:**\n- Проектирование и разработка REST/GraphQL API\n- Работа с PostgreSQL и Redis\n- Оптимизация запросов и производительности\n\n**Требования:**\n- 3+ года Node.js\n- Опыт с Express/Fastify\n- PostgreSQL, Redis\n- Docker и основы DevOps`,
      city: 'Душанбе',
      type: JobType.FULL_TIME,
      level: ExperienceLevel.MIDDLE,
      salaryMin: 22000,
      salaryMax: 38000,
      currency: Currency.TJS,
      skills: ['Node.js', 'TypeScript', 'PostgreSQL', 'Redis', 'Docker'],
      category: 'IT',
      isFeatured: true,
      views: 183,
    },
    {
      companyId: companies[0].id,
      title: 'Junior Frontend Developer (React)',
      description: `Отличная возможность для начинающего разработчика. Менторинг от senior-специалистов.\n\n**Обязанности:**\n- Верстка UI-компонентов по дизайн-макетам\n- Написание unit-тестов\n- Участие в code review\n\n**Требования:**\n- Знание React и JavaScript\n- HTML/CSS, Tailwind CSS\n- Желание учиться и развиваться`,
      city: 'Душанбе',
      type: JobType.FULL_TIME,
      level: ExperienceLevel.JUNIOR,
      salaryMin: 8000,
      salaryMax: 13000,
      currency: Currency.TJS,
      skills: ['React', 'JavaScript', 'HTML', 'CSS', 'Tailwind CSS'],
      category: 'IT',
      views: 312,
    },
    {
      companyId: companies[0].id,
      title: 'DevOps Engineer',
      description: `Ищем DevOps-инженера для выстраивания CI/CD и инфраструктуры.\n\n**Обязанности:**\n- Настройка и поддержка Kubernetes-кластера\n- CI/CD пайплайны (GitHub Actions, GitLab CI)\n- Мониторинг (Prometheus, Grafana)\n- Управление облачной инфраструктурой\n\n**Требования:**\n- 2+ года DevOps/SRE\n- Kubernetes, Docker\n- Terraform или Ansible\n- Linux, Bash`,
      city: 'Душанбе',
      type: JobType.FULL_TIME,
      level: ExperienceLevel.MIDDLE,
      salaryMin: 27000,
      salaryMax: 44000,
      currency: Currency.TJS,
      skills: ['Kubernetes', 'Docker', 'CI/CD', 'Terraform', 'Linux'],
      category: 'IT',
      isFeatured: true,
      views: 198,
    },
    // DushanbeSoft jobs
    {
      companyId: companies[2].id,
      title: 'Full-Stack разработчик (удалённо)',
      description: `Работа на международных проектах из Таджикистана. Клиенты из ЕС и ОАЭ.\n\n**Обязанности:**\n- Разработка веб-приложений на React + Node.js\n- Коммуникация с зарубежными клиентами на английском\n- Agile/Scrum процессы\n\n**Требования:**\n- 2+ года full-stack разработки\n- Уровень английского B2+\n- React, Node.js, PostgreSQL\n- Самоорганизованность при удалённой работе`,
      city: 'Душанбе',
      type: JobType.REMOTE,
      level: ExperienceLevel.MIDDLE,
      salaryMin: 20000,
      salaryMax: 33000,
      currency: Currency.TJS,
      skills: ['React', 'Node.js', 'PostgreSQL', 'TypeScript', 'English'],
      category: 'IT',
      isFeatured: true,
      views: 421,
    },
    {
      companyId: companies[2].id,
      title: 'Python разработчик (ML/AI)',
      description: `Разработка ML-pipeline для автоматизации бизнес-процессов клиентов.\n\n**Обязанности:**\n- Разработка и обучение ML-моделей\n- Интеграция с REST API\n- Работа с большими датасетами\n\n**Требования:**\n- 2+ года Python\n- sklearn, PyTorch или TensorFlow\n- FastAPI или Flask\n- Знание SQL`,
      city: 'Худжанд',
      type: JobType.FULL_TIME,
      level: ExperienceLevel.MIDDLE,
      salaryMin: 22000,
      salaryMax: 38000,
      currency: Currency.TJS,
      skills: ['Python', 'Machine Learning', 'PyTorch', 'FastAPI', 'PostgreSQL'],
      category: 'IT',
      views: 156,
    },
    // TalentPlus jobs
    {
      companyId: companies[1].id,
      title: 'HR-менеджер по рекрутингу',
      description: `Ищем активного рекрутера для работы с IT и финансовыми компаниями Таджикистана.\n\n**Обязанности:**\n- Поиск и подбор кандидатов через HeadHunter, LinkedIn, Telegram\n- Проведение первичных интервью\n- Ведение базы кандидатов\n- Работа с ATS-системами\n\n**Требования:**\n- 1+ год в рекрутинге (IT-рекрутинг — плюс)\n- Коммуникабельность и стрессоустойчивость\n- Опыт работы с LinkedIn Recruiter`,
      city: 'Душанбе',
      type: JobType.FULL_TIME,
      level: ExperienceLevel.JUNIOR,
      salaryMin: 2500,
      salaryMax: 4500,
      currency: Currency.TJS,
      skills: ['Рекрутинг', 'LinkedIn', 'HR', 'Interviewing', 'ATS'],
      category: 'Маркетинг',
      views: 87,
    },
    {
      companyId: companies[1].id,
      title: 'SMM-специалист',
      description: `Продвижение бренда TalentPlus в социальных сетях.\n\n**Обязанности:**\n- Ведение Instagram, Telegram, Facebook\n- Создание контента (посты, stories, Reels)\n- Анализ статистики и рост аудитории\n- Таргетированная реклама\n\n**Требования:**\n- 1+ год ведения SMM\n- Знание Canva или Photoshop\n- Понимание алгоритмов соцсетей\n- Копирайтинг`,
      city: 'Душанбе',
      type: JobType.FULL_TIME,
      level: ExperienceLevel.JUNIOR,
      salaryMin: 1500,
      salaryMax: 3000,
      currency: Currency.TJS,
      skills: ['SMM', 'Instagram', 'Telegram', 'Canva', 'Таргет'],
      category: 'Маркетинг',
      views: 143,
    },
    // Extra jobs in other categories
    {
      companyId: companies[0].id,
      title: 'Стажёр-разработчик (Frontend)',
      description: `Оплачиваемая стажировка для студентов IT-специальностей.\n\n**Обязанности:**\n- Помощь в разработке UI-компонентов\n- Написание документации\n- Учебные задачи с наставником\n\n**Требования:**\n- Знание HTML, CSS, базового JavaScript\n- Студент 3-5 курса профильного вуза\n- Готовность работать 4 часа в день`,
      city: 'Душанбе',
      type: JobType.INTERNSHIP,
      level: ExperienceLevel.INTERN,
      salaryMin: 500,
      salaryMax: 800,
      currency: Currency.TJS,
      skills: ['HTML', 'CSS', 'JavaScript', 'Git'],
      category: 'IT',
      views: 534,
    },
    {
      companyId: companies[2].id,
      title: 'QA Engineer (Manual + Automation)',
      description: `Обеспечение качества продукта в международных проектах.\n\n**Обязанности:**\n- Разработка тест-кейсов и тест-планов\n- Ручное и автоматизированное тестирование\n- Баг-репорты и работа с JIRA\n- Selenium/Playwright автоматизация\n\n**Требования:**\n- 1+ год опыта QA\n- Знание основ тест-дизайна\n- JavaScript или Python для автоматизации\n- Опыт с Postman/API testing`,
      city: 'Душанбе',
      type: JobType.FULL_TIME,
      level: ExperienceLevel.JUNIOR,
      salaryMin: 10000,
      salaryMax: 17000,
      currency: Currency.TJS,
      skills: ['QA', 'Selenium', 'JavaScript', 'Postman', 'JIRA'],
      category: 'IT',
      views: 221,
    },
    {
      companyId: companies[1].id,
      title: 'Финансовый аналитик',
      description: `Анализ финансовых показателей и подготовка отчётности.\n\n**Обязанности:**\n- Финансовый анализ и моделирование\n- Подготовка управленческой отчётности\n- Работа с 1С и Excel\n- Взаимодействие с бухгалтерией\n\n**Требования:**\n- Высшее экономическое образование\n- 2+ года опыта финаналитика\n- Продвинутый Excel (сводные, макросы)\n- Знание МСФО — плюс`,
      city: 'Душанбе',
      type: JobType.FULL_TIME,
      level: ExperienceLevel.MIDDLE,
      salaryMin: 3000,
      salaryMax: 6000,
      currency: Currency.TJS,
      skills: ['Excel', 'Финансовый анализ', '1С', 'МСФО', 'Power BI'],
      category: 'Финансы',
      views: 112,
    },
    {
      companyId: companies[0].id,
      title: 'Контент-менеджер / Копирайтер',
      description: `Создание текстового контента для IT-продуктов компании.\n\n**Обязанности:**\n- UX-копирайтинг (интерфейсные тексты, onboarding)\n- Написание статей для блога компании\n- Работа с локализацией (ru/tj)\n\n**Требования:**\n- Грамотный русский язык\n- Опыт написания технических текстов\n- Знание таджикского — большой плюс`,
      city: 'Душанбе',
      type: JobType.PART_TIME,
      level: ExperienceLevel.JUNIOR,
      salaryMin: 800,
      salaryMax: 1500,
      currency: Currency.TJS,
      skills: ['Копирайтинг', 'UX Writing', 'SEO', 'Таджикский язык'],
      category: 'Маркетинг',
      views: 78,
    },
  ]

  const jobs = await Promise.all(jobData.map(j => prisma.job.create({ data: j })))

  // ── Applications ──────────────────────────────────────────────────
  await prisma.application.create({
    data: {
      jobId: jobs[0].id, // Senior React at TechAsia
      userId: candidate1.id,
      status: ApplicationStatus.VIEWED,
      coverNote: 'Привет! Я frontend-разработчик с 3 годами опыта на React. Буду рад поговорить подробнее.',
      matchScore: 80,
    },
  })

  await prisma.application.create({
    data: {
      jobId: jobs[2].id, // Junior Frontend
      userId: candidate1.id,
      status: ApplicationStatus.INTERVIEW,
      coverNote: 'Интересная позиция, хочу попробовать свои силы.',
      matchScore: 60,
    },
  })

  await prisma.application.create({
    data: {
      jobId: jobs[4].id, // Full-Stack remote
      userId: candidate2.id,
      status: ApplicationStatus.SENT,
      coverNote: 'Опыт в дизайне + базовое знание HTML/CSS. Хочу расти в full-stack направлении.',
      matchScore: 20,
    },
  })

  // ── Reports ─────────────────────────────────────────────────────────
  await prisma.report.create({
    data: {
      target: 'JOB',
      jobId: jobs[8].id, // Стажёр-разработчик
      reporterId: candidate2.id,
      reason: 'Подозрение на мошенничество',
      details: 'Зарплата для стажёра выглядит подозрительно, требуют предоплату.',
    },
  })

  await prisma.report.create({
    data: {
      target: 'COMPANY',
      companyId: companies[1].id, // TalentPlus
      reporterId: candidate1.id,
      reason: 'Недостоверная информация',
      details: 'Сайт компании не открывается.',
    },
  })

  console.log('✅ Seed complete!')
  console.log('')
  console.log('Test accounts:')
  console.log('  owner@test.tj / test1234 (OWNER, isRoot)')
  console.log('  admin@test.tj / test1234 (ADMIN)')
  console.log('  moderator@test.tj / test1234 (MODERATOR)')
  console.log('  employer@techasia.tj / employer123 (EMPLOYER)')
  console.log('  hr@talentplus.tj / employer123 (EMPLOYER)')
  console.log('  jobs@dushanbesoft.tj / employer123 (EMPLOYER)')
  console.log('  candidate@mail.tj / candidate123 (CANDIDATE)')
  console.log('  dev@mail.ru / candidate123 (CANDIDATE)')
}

main()
  .catch((e) => { console.error(e); process.exit(1) })
  .finally(async () => { await prisma.$disconnect() })
