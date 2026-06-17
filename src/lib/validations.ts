import { z } from 'zod'
import { JobType, ExperienceLevel, Currency, Role } from '@prisma/client'

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
  city: z.string().optional(),
  industry: z.string().optional(),
})

export type RegisterInput = z.infer<typeof registerSchema>
export type JobInput = z.infer<typeof jobSchema>
export type ApplicationInput = z.infer<typeof applicationSchema>
