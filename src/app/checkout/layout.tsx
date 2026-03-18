import type { ReactNode } from 'react'

import { createNoIndexMetadata } from '@/lib/seo'

export const metadata = createNoIndexMetadata(
  'Checkout',
  'Checkout and billing transition pages are excluded from search indexing.',
)

export default function CheckoutLayout({ children }: { children: ReactNode }) {
  return children
}
