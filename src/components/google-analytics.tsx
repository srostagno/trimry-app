'use client'

import Script from 'next/script'
import { usePathname, useSearchParams } from 'next/navigation'
import { useEffect } from 'react'

import { GA_MEASUREMENT_ID, trackPageView } from '@/lib/analytics'

const analyticsConfig = JSON.stringify({
  send_page_view: false,
  debug_mode: process.env.NODE_ENV !== 'production',
})

export function GoogleAnalytics() {
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const queryString = searchParams.toString()

  useEffect(() => {
    const pagePath = queryString ? `${pathname}?${queryString}` : pathname
    trackPageView(pagePath)
  }, [pathname, queryString])

  if (!GA_MEASUREMENT_ID) {
    return null
  }

  return (
    <>
      <Script
        src={`https://www.googletagmanager.com/gtag/js?id=${GA_MEASUREMENT_ID}`}
        strategy="afterInteractive"
      />
      <Script id="google-analytics" strategy="afterInteractive">
        {`
          window.dataLayer = window.dataLayer || [];
          function gtag(){dataLayer.push(arguments);}
          window.gtag = gtag;
          gtag('js', new Date());
          gtag('config', '${GA_MEASUREMENT_ID}', ${analyticsConfig});
        `}
      </Script>
    </>
  )
}
