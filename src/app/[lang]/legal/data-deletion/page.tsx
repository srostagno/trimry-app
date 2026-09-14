import type { Metadata } from 'next'
import { notFound } from 'next/navigation'

import { JsonLd } from '@/components/json-ld'
import { DataDeletionPageClient } from '@/components/legal/data-deletion-page-client'
import { getMessages, isLanguageCode } from '@/lib/i18n'
import { createLegalPageJsonLd, createPageMetadata } from '@/lib/seo'

type Params = { params: { lang: string } }

const description = 'How to delete your Trimry account and data, and what records may be retained for legal reasons.'

export function generateMetadata({ params }: Params): Metadata {
  if (!isLanguageCode(params.lang)) {
    return {}
  }

  return createPageMetadata({
    title: getMessages(params.lang).legal.dataDeletion,
    description,
    path: `/${params.lang}/legal/data-deletion`,
    localizedPath: '/legal/data-deletion',
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
          title: getMessages(params.lang).legal.dataDeletion,
          description,
          path: `/${params.lang}/legal/data-deletion`,
        })}
      />
      <DataDeletionPageClient />
    </>
  )
}
