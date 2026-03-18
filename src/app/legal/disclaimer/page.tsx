import { JsonLd } from '@/components/json-ld'
import { DisclaimerPageClient } from '@/components/legal/disclaimer-page-client'
import { createLegalPageJsonLd, createPageMetadata } from '@/lib/seo'

const description =
  'Read the Trimry ritual disclaimer about cultural interpretation, no guarantee of outcomes, and personal responsibility.'

export const metadata = createPageMetadata({
  title: 'Ritual Disclaimer',
  description,
  path: '/legal/disclaimer',
  keywords: ['trimry disclaimer', 'ritual disclaimer', 'fortune content disclaimer'],
})

export default function DisclaimerPage() {
  return (
    <>
      <JsonLd
        data={createLegalPageJsonLd({
          title: 'Ritual Disclaimer',
          description,
          path: '/legal/disclaimer',
        })}
      />
      <DisclaimerPageClient />
    </>
  )
}
