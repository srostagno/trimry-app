import { redirect } from 'next/navigation'

import { createNoIndexMetadata } from '@/lib/seo'

export const metadata = createNoIndexMetadata({
  title: 'FAQ Redirect',
  description: 'Legacy FAQ redirect route excluded from search indexing.',
  path: '/faq',
})

export default function FaqRedirect() {
  redirect('/#faq')
}
