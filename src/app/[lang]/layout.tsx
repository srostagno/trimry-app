import type { ReactNode } from 'react'
import { notFound } from 'next/navigation'

import { isLanguageCode } from '@/lib/i18n'

export default function LanguageLayout({
  children,
  params,
}: {
  children: ReactNode
  params: { lang: string }
}) {
  if (!isLanguageCode(params.lang)) {
    notFound()
  }

  return children
}
