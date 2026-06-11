import { JsonLd } from '@/components/json-ld'
import { HomePageClient } from '@/components/home-page-client'
import { createPageMetadata, homePageJsonLd } from '@/lib/seo'

export const metadata = createPageMetadata({
  title: 'Your Luck Guide',
  description:
    'Trimry sends daily luck projections by email or WhatsApp and unlocks a monthly calendar of fortune signals for money, relationships, energy, and release rituals.',
  keywords: [
    'lucky days',
    'luck timing',
    'daily luck ritual',
    'daily luck projection',
    'luck guru',
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
