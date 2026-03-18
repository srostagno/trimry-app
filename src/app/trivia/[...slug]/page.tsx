import { redirect } from 'next/navigation'

import { createNoIndexMetadata } from '@/lib/seo'

export const metadata = createNoIndexMetadata(
  'Legacy Trivia Redirect',
  'Legacy redirect route excluded from search indexing.',
)

export default function LegacyTriviaRedirect() {
  redirect('/')
}
