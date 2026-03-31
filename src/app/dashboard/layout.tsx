import type { ReactNode } from 'react'

import { createNoIndexMetadata } from '@/lib/seo'

export const metadata = createNoIndexMetadata({
  title: 'Dashboard',
  description: 'Customer dashboard pages are private and excluded from search indexing.',
  path: '/dashboard',
})

export default function DashboardLayout({ children }: { children: ReactNode }) {
  return children
}
