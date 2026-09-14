import type { Metadata } from 'next'
import { notFound } from 'next/navigation'

import { TodayPage, todayPageMetadata } from '@/components/seo/today-page'
import { intentFromSlug } from '@/lib/seo-copy'
import { FEED_REVALIDATE_SECONDS, resolveSeoContext } from '@/lib/seo-data'

export const revalidate = FEED_REVALIDATE_SECONDS

type Params = { params: { lang: string; country: string; intent: string } }

// Only the "today" intent lives at this depth (/es/cl/partidos-hoy, /pt/br/jogos-de-hoje).
async function resolve(params: Params['params']) {
  const { country } = await resolveSeoContext(params.country)
  if (!country || country.language !== params.lang) return null
  if (intentFromSlug(country.language, params.intent) !== 'today') return null
  return country
}

export async function generateMetadata({ params }: Params): Promise<Metadata> {
  const country = await resolve(params)
  if (!country) return {}
  return todayPageMetadata(country.code)
}

export default async function Page({ params }: Params) {
  const country = await resolve(params)
  if (!country) notFound()
  return <TodayPage countryCode={country.code} />
}
