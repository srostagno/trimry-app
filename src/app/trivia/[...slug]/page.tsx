import { redirect } from 'next/navigation'

import { createNoIndexMetadata } from '@/lib/seo'

export const metadata = createNoIndexMetadata({
  title: 'Legacy Trivia Redirect',
  description: 'Legacy redirect route excluded from search indexing.',
  path: '/trivia',
})

export default function LegacyTriviaRedirect() {
  redirect('/')
}
