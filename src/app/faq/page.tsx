import { redirect } from 'next/navigation'

import { createNoIndexMetadata } from '@/lib/seo'

export const metadata = createNoIndexMetadata(
  'FAQ Redirect',
  'Legacy FAQ redirect route excluded from search indexing.',
)

export default function FaqRedirect() {
  redirect('/#faq')
}
