import { z } from 'zod'
import { JobType, ExperienceLevel, Currency, Role, ReportTarget } from '@prisma/client'

export const registerSchema = z.object({
  name: z.string().min(2, 'Укажите имя'),
  email: z.string().email('Некорректный email'),
  password: z.string().min(8, 'Минимум 8 символов'),
  role: z.enum([Role.CANDIDATE, Role.EMPLOYER]),
  phone: z.string().optional(),
})

export const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
})

export const jobSchema = z.object({
  title: z.string().min(3, 'Укажите должность'),
  description: z.string().min(50, 'Описание слишком короткое (минимум 50 символов)'),
  city: z.string().min(1, 'Выберите город'),
  type: z.nativeEnum(JobType),
  level: z.nativeEnum(ExperienceLevel),
  salaryMin: z.coerce.number().positive().optional(),
  salaryMax: z.coerce.number().positive().optional(),
  currency: z.nativeEnum(Currency).default('TJS'),
  skills: z.string().optional(),
  category: z.string().min(1, 'Выберите категорию'),
})

export const applicationSchema = z.object({
  jobId: z.string().cuid(),
  coverNote: z.string().max(1000).optional(),
})

export const candidateProfileSchema = z.object({
  headline: z.string().max(100).optional(),
  about: z.string().max(2000).optional(),
  city: z.string().optional(),
  skills: z.string().optional(), // comma-separated
  experienceLevel: z.nativeEnum(ExperienceLevel).optional(),
})

export const companyProfileSchema = z.object({
  name: z.string().min(2, 'Укажите название компании'),
  description: z.string().max(2000).optional(),
  website: z.string().url('Некорректный URL').optional().or(z.literal('')),
  cities: z.array(z.string().min(1)).max(20).optional(),
  industry: z.string().optional(),
  logoUrl: z.string().optional().or(z.literal('')),
})

export const accountSchema = z.object({
  name: z.string().min(2, 'Укажите имя'),
  phone: z.string().max(30).optional().or(z.literal('')),
  avatarUrl: z.string().optional().or(z.literal('')),
})

export const moderateJobSchema = z.object({
  isBlocked: z.boolean(),
  blockReason: z.string().max(500).optional(),
})

export const moderateCompanySchema = z.object({
  isBlocked: z.boolean().optional(),
  blockReason: z.string().max(500).optional(),
  isVerified: z.boolean().optional(),
})

export const reportSchema = z.object({
  target: z.nativeEnum(ReportTarget),
  jobId: z.string().cuid().optional(),
  companyId: z.string().cuid().optional(),
  reason: z.string().min(3, 'Укажите причину').max(200),
  details: z.string().max(1000).optional(),
}).refine(
  d => (d.target === 'JOB' && !!d.jobId) || (d.target === 'COMPANY' && !!d.companyId),
  { message: 'Не указан объект жалобы' },
)

export const reportUpdateSchema = z.object({
  status: z.enum(['RESOLVED', 'DISMISSED']),
})

export const roleUpdateSchema = z.object({
  role: z.nativeEnum(Role),
  isRoot: z.boolean().optional().default(false),
})

export const passwordChangeSchema = z.object({
  currentPassword: z.string().min(1, 'Введите текущий пароль'),
  newPassword: z.string().min(8, 'Минимум 8 символов'),
})

export type RegisterInput = z.infer<typeof registerSchema>
export type JobInput = z.infer<typeof jobSchema>
export type ApplicationInput = z.infer<typeof applicationSchema>
