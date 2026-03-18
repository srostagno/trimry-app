import { JsonLd } from '@/components/json-ld'
import { PrivacyPageClient } from '@/components/legal/privacy-page-client'
import { createLegalPageJsonLd, createPageMetadata } from '@/lib/seo'

const description =
  'Review the Trimry privacy policy covering account data, delivery preferences, storage, provider sharing, and user rights.'

export const metadata = createPageMetadata({
  title: 'Privacy Policy',
  description,
  path: '/legal/privacy',
  keywords: ['trimry privacy policy', 'data usage policy', 'subscription privacy'],
})

export default function PrivacyPage() {
  return (
    <>
      <JsonLd
        data={createLegalPageJsonLd({
          title: 'Privacy Policy',
          description,
          path: '/legal/privacy',
        })}
      />
      <PrivacyPageClient />
    </>
  )
}
