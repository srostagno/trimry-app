import type { Metadata } from 'next'
import { notFound } from 'next/navigation'

import { JsonLd } from '@/components/json-ld'
import { DisclaimerPageClient } from '@/components/legal/disclaimer-page-client'
import { getMessages, isLanguageCode } from '@/lib/i18n'
import { createLegalPageJsonLd, createPageMetadata } from '@/lib/seo'

type Params = { params: { lang: string } }

const description = 'Trimry data and accuracy notice: where schedules come from, why fixtures can change, and why Trimry never provides betting advice.'

export function generateMetadata({ params }: Params): Metadata {
  if (!isLanguageCode(params.lang)) {
    return {}
  }

  return createPageMetadata({
    title: getMessages(params.lang).legal.disclaimer,
    description,
    path: `/${params.lang}/legal/disclaimer`,
    localizedPath: '/legal/disclaimer',
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
          title: getMessages(params.lang).legal.disclaimer,
          description,
          path: `/${params.lang}/legal/disclaimer`,
        })}
      />
      <DisclaimerPageClient />
    </>
  )
}
