import type { Metadata } from 'next'
import { notFound } from 'next/navigation'

import { JsonLd } from '@/components/json-ld'
import { TermsPageClient } from '@/components/legal/terms-page-client'
import { getMessages, isLanguageCode } from '@/lib/i18n'
import { createLegalPageJsonLd, createPageMetadata } from '@/lib/seo'

type Params = { params: { lang: string } }

const description = 'Trimry terms of service: subscription billing, cancel-anytime policy, account responsibilities and service limitations.'

export function generateMetadata({ params }: Params): Metadata {
  if (!isLanguageCode(params.lang)) {
    return {}
  }

  return createPageMetadata({
    title: getMessages(params.lang).legal.terms,
    description,
    path: `/${params.lang}/legal/terms`,
    localizedPath: '/legal/terms',
    locale: params.lang,
  })
}

export default function LegalPage({ params }: Params) {
  if (!isLanguageCode(params.lang)) {
    notFound()
  }

  return (
    <>
      <JsonLd
        data={createLegalPageJsonLd({
          title: getMessages(params.lang).legal.terms,
          description,
          path: `/${params.lang}/legal/terms`,
        })}
      />
      <TermsPageClient />
    </>
  )
}
