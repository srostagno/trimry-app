import type { ReactNode } from 'react'

import { createNoIndexMetadata } from '@/lib/seo'

export const metadata = createNoIndexMetadata({
  title: 'Account',
  description: 'Account access, onboarding, and delivery setup pages are not indexed by search engines.',
  path: '/account',
})

export default function AccountLayout({ children }: { children: ReactNode }) {
  return children
}
