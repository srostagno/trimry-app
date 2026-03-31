import type { ReactNode } from 'react'

import { createNoIndexMetadata } from '@/lib/seo'

export const metadata = createNoIndexMetadata({
  title: 'Activate Subscription',
  description: 'Activation and billing handoff pages are excluded from search indexing.',
  path: '/activate',
})

export default function ActivateLayout({ children }: { children: ReactNode }) {
  return children
}
