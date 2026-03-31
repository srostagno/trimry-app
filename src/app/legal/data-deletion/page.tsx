import { DataDeletionPageClient } from '@/components/legal/data-deletion-page-client'
import { JsonLd } from '@/components/json-ld'
import { createLegalPageJsonLd, createPageMetadata } from '@/lib/seo'

const description =
  'Learn how to request data deletion for your Trimry account and what records may be retained for legal or security reasons.'

export const metadata = createPageMetadata({
  title: 'Data Deletion Instructions',
  description,
  path: '/legal/data-deletion',
  keywords: [
    'trimry data deletion',
    'delete account data',
    'meta data deletion instructions',
  ],
})

export default function DataDeletionPage() {
  return (
    <>
      <JsonLd
        data={createLegalPageJsonLd({
          title: 'Data Deletion Instructions',
          description,
          path: '/legal/data-deletion',
        })}
      />
      <DataDeletionPageClient />
    </>
  )
}
