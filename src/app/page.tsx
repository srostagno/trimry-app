import { JsonLd } from '@/components/json-ld'
import { HomePageClient } from '@/components/home-page-client'
import { createPageMetadata, homePageJsonLd } from '@/lib/seo'

export const metadata = createPageMetadata({
  title: 'Want To Be Luckier?',
  description:
    'Discover your lucky timing for money, haircuts, relationships, and energy. Ask the Luck Guru and unlock your daily ritual.',
  keywords: [
    'lucky days',
    'luck timing',
    'daily luck ritual',
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
