import { JsonLd } from '@/components/json-ld'
import { DisclaimerPageClient } from '@/components/legal/disclaimer-page-client'
import { createLegalPageJsonLd, createPageMetadata } from '@/lib/seo'

const description =
  'Read the Trimry data and accuracy notice: where sports schedules come from, why fixtures can change, and why Trimry never provides betting advice.'

export const metadata = createPageMetadata({
  title: 'Data & Accuracy Notice',
  description,
  path: '/legal/disclaimer',
  keywords: ['trimry disclaimer', 'sports schedule accuracy', 'fixture changes notice'],
})

export default function DisclaimerPage() {
  return (
    <>
      <JsonLd
        data={createLegalPageJsonLd({
          title: 'Data & Accuracy Notice',
          description,
          path: '/legal/disclaimer',
        })}
      />
      <DisclaimerPageClient />
    </>
  )
}
