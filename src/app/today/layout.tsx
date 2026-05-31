import type { ReactNode } from 'react'

import { createNoIndexMetadata } from '@/lib/seo'

export const metadata = createNoIndexMetadata({
  title: 'Today',
  description: 'Public luck reveal page for Trimry acquisition traffic.',
  path: '/today',
})

export default function TodayLayout({ children }: { children: ReactNode }) {
  return children
}
