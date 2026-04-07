import { JsonLd } from '@/components/json-ld'
import { HomePageClient } from '@/components/home-page-client'
import { createPageMetadata, homePageJsonLd } from '@/lib/seo'

export const metadata = createPageMetadata({
  description:
    'Good and bad days to cut your hair, nails, and more in one weekly Trimry forecast. Get Monday timing guidance for haircuts, shaving, nail trimming, and ritual release.',
  keywords: [
    'good and bad days to cut your hair nails and more',
    'good and bad days to cut hair',
    'good and bad days to cut nails',
    'best day to cut hair and nails',
    'weekly ritual forecast',
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
