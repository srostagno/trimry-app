import type { ReactNode } from 'react'

import { createNoIndexMetadata } from '@/lib/seo'

export const metadata = createNoIndexMetadata(
  'Account',
  'Account access, onboarding, and delivery setup pages are not indexed by search engines.',
)

export default function AccountLayout({ children }: { children: ReactNode }) {
  return children
}
