import type { Metadata } from 'next'
import { terms } from '@/content/legal'
import type { Locale } from '@/i18n/request'
import LegalDocument from '@/components/legal/LegalDocument'

export function generateMetadata({ params: { locale } }: { params: { locale: Locale } }): Metadata {
  return { title: `${terms[locale].title} — Kormand` }
}

export default function TermsPage({ params: { locale } }: { params: { locale: Locale } }) {
  return <LegalDocument doc={terms[locale]} />
}
