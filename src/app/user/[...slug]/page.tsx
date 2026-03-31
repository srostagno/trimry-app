import { redirect } from 'next/navigation'

import { createNoIndexMetadata } from '@/lib/seo'

export const metadata = createNoIndexMetadata({
  title: 'Legacy User Redirect',
  description: 'Legacy redirect route excluded from search indexing.',
  path: '/user',
})

export default function LegacyUserRedirect() {
  redirect('/')
}
