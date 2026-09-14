import type { Metadata } from 'next'
import { notFound } from 'next/navigation'

import { TeamPage, teamPageMetadata } from '@/components/seo/team-page'
import { FEED_REVALIDATE_SECONDS } from '@/lib/seo-data'

export const revalidate = FEED_REVALIDATE_SECONDS

type Params = { params: { lang: string; country: string; team: string } }

export async function generateMetadata({ params }: Params): Promise<Metadata> {
  if (params.lang !== 'es') {
    return {}
  }

  return teamPageMetadata(params.country, params.team, 'time')
}

export default function Page({ params }: Params) {
  if (params.lang !== 'es') {
    notFound()
  }

  return <TeamPage countryCode={params.country} teamSlug={params.team} intent="time" />
}
