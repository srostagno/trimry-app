'use client'

import { usePathname, useSearchParams } from 'next/navigation'
import { useEffect } from 'react'

import { captureAttribution } from '@/lib/attribution'

// Mounted once in the root layout: records where each visitor came from on
// their first page view, before any client-side navigation loses the referrer.
export function AttributionTracker() {
  const pathname = usePathname()
  const searchParams = useSearchParams()

  useEffect(() => {
    captureAttribution()
  }, [pathname, searchParams])

  return null
}
