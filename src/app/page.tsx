import { JsonLd } from '@/components/json-ld'
import { HomePageClient } from '@/components/home-page-client'
import { createPageMetadata, homePageJsonLd } from '@/lib/seo'

export const metadata = createPageMetadata({
  description:
    'Trimry helps you catch lucky haircut days and weekly release timing with one ritual forecast every Monday by email, WhatsApp, or both.',
  keywords: [
    'lucky haircut day app',
    'weekly ritual forecast',
    'fortune guidance subscription',
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
