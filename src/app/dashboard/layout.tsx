import type { ReactNode } from 'react'

import { createNoIndexMetadata } from '@/lib/seo'

export const metadata = createNoIndexMetadata(
  'Dashboard',
  'Customer dashboard pages are private and excluded from search indexing.',
)

export default function DashboardLayout({ children }: { children: ReactNode }) {
  return children
}
