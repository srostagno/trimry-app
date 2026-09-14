import type { Metadata } from 'next'
import { notFound } from 'next/navigation'

import { JsonLd } from '@/components/json-ld'
import { SportLandingClient } from '@/components/sport-landing-client'
import { isLanguageCode } from '@/lib/i18n'
import { createPageMetadata } from '@/lib/seo'
import { isLandingSegment, landingCopy, landingPath, landingSportFromSlug } from '@/lib/sport-landing'

type Params = { params: { lang: string; sport: string } }

// /es/alertas/futbol, /pt/alertas/futebol (English lives under /en/alerts).
function resolve(params: Params['params']) {
  if (!isLanguageCode(params.lang) || !isLandingSegment(params.lang, 'alertas')) return null
  const sport = landingSportFromSlug(params.lang, params.sport)
  return sport ? { language: params.lang, sport } : null
}

export function generateMetadata({ params }: Params): Metadata {
  const resolved = resolve(params)
  if (!resolved) return {}
  const copy = landingCopy(resolved.language, resolved.sport)
  return createPageMetadata({
    title: copy.metaTitle,
    description: copy.metaDescription,
    path: landingPath(resolved.language, resolved.sport),
    locale: resolved.language,
    keywords: copy.keywords,
  })
}

export default function SportLandingPage({ params }: Params) {
  const resolved = resolve(params)
  if (!resolved) notFound()
  const copy = landingCopy(resolved.language, resolved.sport)

  return (
    <>
      <SportLandingClient language={resolved.language} sport={resolved.sport} />
      <JsonLd
        data={{
          '@context': 'https://schema.org',
          '@type': 'FAQPage',
          mainEntity: copy.faq.map((item) => ({
            '@type': 'Question',
            name: item.question,
            acceptedAnswer: { '@type': 'Answer', text: item.answer },
          })),
        }}
      />
    </>
  )
}
