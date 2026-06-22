import type { Metadata } from 'next'
import { privacy } from '@/content/legal'
import type { Locale } from '@/i18n/request'
import LegalDocument from '@/components/legal/LegalDocument'

export function generateMetadata({ params: { locale } }: { params: { locale: Locale } }): Metadata {
  return { title: `${privacy[locale].title} — Kormand` }
}

export default function PrivacyPage({ params: { locale } }: { params: { locale: Locale } }) {
  return <LegalDocument doc={privacy[locale]} />
}
