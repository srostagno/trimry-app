import type { Metadata } from 'next'
import { notFound } from 'next/navigation'

import { JsonLd } from '@/components/json-ld'
import { HomePageClient } from '@/components/home-page-client'
import { getMessages, isLanguageCode } from '@/lib/i18n'
import { createPageMetadata, homePageJsonLd } from '@/lib/seo'

type Params = { params: { lang: string } }

export function generateMetadata({ params }: Params): Metadata {
  if (!isLanguageCode(params.lang)) {
    return {}
  }

  const messages = getMessages(params.lang)

  return createPageMetadata({
    title: messages.seo.homeTitle,
    description: messages.seo.homeDescription,
    path: `/${params.lang}`,
    localizedPath: '/',
    locale: params.lang,
    keywords: [
      'sports agenda',
      'match notifications',
      'alertas de partidos',
      'agenda deportiva whatsapp',
      'a que hora juega',
    ],
  })
}

export default function LocalizedHomePage({ params }: Params) {
  if (!isLanguageCode(params.lang)) {
    notFound()
  }

  return (
    <>
      <JsonLd data={homePageJsonLd} />
      <HomePageClient />
    </>
  )
}
