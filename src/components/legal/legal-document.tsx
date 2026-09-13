'use client'

import { useLanguage } from '@/components/language-provider'
import type { MessageSection } from '@/lib/i18n'

type LegalDocumentKey = 'terms' | 'privacy' | 'disclaimer' | 'dataDeletion'

const SECTION_KEYS: Record<
  LegalDocumentKey,
  keyof Pick<
    MessageSection['legal'],
    'termsSections' | 'privacySections' | 'disclaimerSections' | 'dataDeletionSections'
  >
> = {
  terms: 'termsSections',
  privacy: 'privacySections',
  disclaimer: 'disclaimerSections',
  dataDeletion: 'dataDeletionSections',
}

export function LegalDocument({ document }: { document: LegalDocumentKey }) {
  const { messages } = useLanguage()
  const sections = messages.legal[SECTION_KEYS[document]]

  return (
    <section className="tr-shell mx-auto max-w-3xl p-8 sm:p-10">
      <p className="tr-eyebrow">Trimry</p>
      <h1 className="mt-3 text-3xl sm:text-4xl">{messages.legal[document]}</h1>
      <p className="tr-meta mt-3">{messages.legal.englishNotice}</p>

      <div className="mt-8 space-y-7 text-trimry-slate">
        {sections.map((section) => (
          <section key={section.title}>
            <h2 className="text-xl text-trimry-ink">{section.title}</h2>
            <p className="mt-2 leading-7">{section.body}</p>
          </section>
        ))}
      </div>
    </section>
  )
}
