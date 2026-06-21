import { auth } from '@/lib/auth'
import { redirect, notFound } from 'next/navigation'
import { prisma } from '@/lib/prisma'
import { Link } from '@/i18n/navigation'
import { ArrowLeft, Mail, Phone, FileText, MapPin, Briefcase, Star } from 'lucide-react'
import ApplicantStatusSelect from '@/components/dashboard/ApplicantStatusSelect'
import { timeAgo } from '@/lib/utils'

const levelLabels: Record<string, string> = {
  INTERN: 'Стажёр', JUNIOR: 'Junior', MIDDLE: 'Middle', SENIOR: 'Senior', LEAD: 'Lead',
}

export default async function ApplicantPage({ params }: { params: { locale: string; id: string } }) {
  const session = await auth()
  if (!session || session.user.role !== 'EMPLOYER') {
    redirect(`/${params.locale}/auth/login`)
  }

  const app = await prisma.application.findUnique({
    where: { id: params.id },
    include: {
      job: { include: { company: { select: { ownerId: true, name: true } } } },
      user: {
        select: {
          name: true, email: true, phone: true, avatarUrl: true,
          candidate: true,
        },
      },
    },
  })

  if (!app || app.job.company.ownerId !== session.user.id) notFound()

  const profile = app.user.candidate
  const isImageResume = app.resumeUrl ? /\.(jpe?g|png|webp)$/i.test(app.resumeUrl) : false

  return (
    <div className="pt-28 pb-24">
      <div className="max-w-3xl mx-auto px-4 md:px-8">
        <Link href="/dashboard/employer" className="inline-flex items-center gap-2 text-sm text-muted hover:text-ink transition-colors mb-8">
          <ArrowLeft className="w-4 h-4" />
          К откликам
        </Link>

        {/* Header: candidate identity + status */}
        <div className="p-1.5 rounded-3xl bg-black/[0.03] ring-1 ring-black/5 mb-6">
          <div className="rounded-[calc(1.5rem-0.375rem)] bg-white shadow-[inset_0_1px_1px_rgba(255,255,255,0.9)] p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-5">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 rounded-full flex items-center justify-center text-lg font-bold bg-lavender-light text-lavender overflow-hidden flex-shrink-0">
                {app.user.avatarUrl
                  ? <img src={app.user.avatarUrl} alt="" className="w-full h-full object-cover" />
                  : app.user.name?.[0]?.toUpperCase()}
              </div>
              <div className="min-w-0">
                <h1 className="font-heading font-bold text-ink text-xl">{app.user.name}</h1>
                {profile?.headline && <p className="text-sm text-muted mt-0.5">{profile.headline}</p>}
                <p className="text-xs text-muted mt-1">Отклик на «{app.job.title}» · {timeAgo(app.createdAt)}</p>
              </div>
            </div>
            <ApplicantStatusSelect appId={app.id} status={app.status} />
          </div>
        </div>

        <div className="grid sm:grid-cols-2 gap-6">
          {/* Contacts + meta */}
          <div className="p-1.5 rounded-3xl bg-black/[0.03] ring-1 ring-black/5">
            <div className="rounded-[calc(1.5rem-0.375rem)] bg-white p-6 h-full">
              <h2 className="font-heading font-semibold text-ink mb-4">Контакты</h2>
              <div className="flex flex-col gap-3 text-sm">
                <a href={`mailto:${app.user.email}`} className="flex items-center gap-2.5 text-sky-blue hover:underline">
                  <Mail className="w-4 h-4 flex-shrink-0" /> {app.user.email}
                </a>
                {app.user.phone && (
                  <a href={`tel:${app.user.phone}`} className="flex items-center gap-2.5 text-ink hover:text-sky-blue transition-colors">
                    <Phone className="w-4 h-4 flex-shrink-0" /> {app.user.phone}
                  </a>
                )}
                {profile?.city && (
                  <p className="flex items-center gap-2.5 text-muted">
                    <MapPin className="w-4 h-4 flex-shrink-0" /> {profile.city}
                  </p>
                )}
                {profile?.experienceLevel && (
                  <p className="flex items-center gap-2.5 text-muted">
                    <Briefcase className="w-4 h-4 flex-shrink-0" /> {levelLabels[profile.experienceLevel] ?? profile.experienceLevel}
                  </p>
                )}
                {typeof app.matchScore === 'number' && (
                  <p className="flex items-center gap-2.5 text-muted">
                    <Star className="w-4 h-4 flex-shrink-0 text-coral" /> Совпадение {app.matchScore}%
                  </p>
                )}
              </div>
            </div>
          </div>

          {/* Resume */}
          <div className="p-1.5 rounded-3xl bg-black/[0.03] ring-1 ring-black/5">
            <div className="rounded-[calc(1.5rem-0.375rem)] bg-white p-6 h-full">
              <h2 className="font-heading font-semibold text-ink mb-4">Резюме</h2>
              {app.resumeUrl ? (
                isImageResume ? (
                  <a href={app.resumeUrl} target="_blank" rel="noopener noreferrer" className="block">
                    <img src={app.resumeUrl} alt="Резюме" className="rounded-2xl border border-black/5 max-h-64 w-auto" />
                  </a>
                ) : (
                  <a href={app.resumeUrl} target="_blank" rel="noopener noreferrer"
                    className="inline-flex items-center gap-2.5 rounded-2xl border border-black/10 px-4 py-3 text-sm text-ink hover:border-sky-blue/40 hover:text-sky-blue transition-all">
                    <FileText className="w-4 h-4" /> Открыть PDF
                  </a>
                )
              ) : (
                <p className="text-sm text-muted">Кандидат не приложил резюме</p>
              )}
            </div>
          </div>
        </div>

        {/* Cover note */}
        <div className="p-1.5 rounded-3xl bg-black/[0.03] ring-1 ring-black/5 mt-6">
          <div className="rounded-[calc(1.5rem-0.375rem)] bg-white p-6">
            <h2 className="font-heading font-semibold text-ink mb-4">Сопроводительное письмо</h2>
            {app.coverNote
              ? <p className="text-sm text-muted leading-relaxed whitespace-pre-line">{app.coverNote}</p>
              : <p className="text-sm text-muted">Без сопроводительного текста</p>}
          </div>
        </div>

        {/* About + skills */}
        {(profile?.about || (profile?.skills?.length ?? 0) > 0) && (
          <div className="p-1.5 rounded-3xl bg-black/[0.03] ring-1 ring-black/5 mt-6">
            <div className="rounded-[calc(1.5rem-0.375rem)] bg-white p-6">
              <h2 className="font-heading font-semibold text-ink mb-4">О кандидате</h2>
              {profile?.about && <p className="text-sm text-muted leading-relaxed whitespace-pre-line mb-4">{profile.about}</p>}
              {(profile?.skills?.length ?? 0) > 0 && (
                <div className="flex flex-wrap gap-2">
                  {profile!.skills.map(skill => (
                    <span key={skill} className="skill-tag">{skill}</span>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
