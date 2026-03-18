import { redirect } from 'next/navigation'

import { createNoIndexMetadata } from '@/lib/seo'

export const metadata = createNoIndexMetadata(
  'Legacy User Redirect',
  'Legacy redirect route excluded from search indexing.',
)

export default function LegacyUserRedirect() {
  redirect('/')
}
