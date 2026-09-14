import type { Metadata } from 'next'
import { notFound } from 'next/navigation'

import { JsonLd } from '@/components/json-ld'
import { PrivacyPageClient } from '@/components/legal/privacy-page-client'
import { getMessages, isLanguageCode } from '@/lib/i18n'
import { createLegalPageJsonLd, createPageMetadata } from '@/lib/seo'

type Params = { params: { lang: string } }

const description = 'Trimry privacy policy: account data, delivery preferences, storage, third-party providers and your rights.'

export function generateMetadata({ params }: Params): Metadata {
  if (!isLanguageCode(params.lang)) {
    return {}
  }

  return createPageMetadata({
    title: getMessages(params.lang).legal.privacy,
    description,
    path: `/${params.lang}/legal/privacy`,
    localizedPath: '/legal/privacy',
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
          title: getMessages(params.lang).legal.privacy,
          description,
          path: `/${params.lang}/legal/privacy`,
        })}
      />
      <PrivacyPageClient />
    </>
  )
}
