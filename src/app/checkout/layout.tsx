import type { ReactNode } from 'react'

import { createNoIndexMetadata } from '@/lib/seo'

export const metadata = createNoIndexMetadata({
  title: 'Checkout',
  description: 'Checkout and billing transition pages are excluded from search indexing.',
  path: '/checkout',
})

export default function CheckoutLayout({ children }: { children: ReactNode }) {
  return children
}
