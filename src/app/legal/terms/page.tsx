import { JsonLd } from '@/components/json-ld'
import { TermsPageClient } from '@/components/legal/terms-page-client'
import { createLegalPageJsonLd, createPageMetadata } from '@/lib/seo'

const description =
  'Read Trimry terms of service, including subscription billing, cancel-anytime policy, account responsibilities, and service limitations.'

export const metadata = createPageMetadata({
  title: 'Terms of Service',
  description,
  path: '/legal/terms',
  keywords: ['trimry terms', 'subscription terms', 'cancel anytime terms'],
})

export default function TermsPage() {
  return (
    <>
      <JsonLd
        data={createLegalPageJsonLd({
          title: 'Terms of Service',
          description,
          path: '/legal/terms',
        })}
      />
      <TermsPageClient />
    </>
  )
}
