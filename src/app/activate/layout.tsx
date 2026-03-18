import type { ReactNode } from 'react'

import { createNoIndexMetadata } from '@/lib/seo'

export const metadata = createNoIndexMetadata(
  'Activate Subscription',
  'Activation and billing handoff pages are excluded from search indexing.',
)

export default function ActivateLayout({ children }: { children: ReactNode }) {
  return children
}
