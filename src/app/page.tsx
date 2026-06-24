import { JsonLd } from '@/components/json-ld'
import { HomePageClient } from '@/components/home-page-client'
import { createPageMetadata, homePageJsonLd } from '@/lib/seo'

export const metadata = createPageMetadata({
  title: 'Your Luck Guide',
  description:
    'Trimry unlocks a personalized luck calendar shaped by your symbols, timing patterns, and manifestation wish.',
  keywords: [
    'lucky days',
    'luck timing',
    'daily luck ritual',
    'daily luck projection',
    'personal luck calendar',
    'fortune timing guidance',
  ],
  path: '/',
})

export default function HomePage() {
  return (
    <>
      <JsonLd data={homePageJsonLd} />
      <HomePageClient />
    </>
  )
}
