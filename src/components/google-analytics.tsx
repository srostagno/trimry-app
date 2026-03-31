'use client'

import Link from 'next/link'
import Script from 'next/script'
import { usePathname, useSearchParams } from 'next/navigation'
import { useEffect, useState } from 'react'

import {
  readAnalyticsConsentFromDocument,
  setAnalyticsConsentInDocument,
  type AnalyticsConsentState,
} from '@/lib/analytics-consent'
import { GA_MEASUREMENT_ID, trackPageView } from '@/lib/analytics'
import { useLanguage } from '@/components/language-provider'

const analyticsConfig = JSON.stringify({
  send_page_view: false,
  debug_mode: process.env.NODE_ENV !== 'production',
})

export function GoogleAnalytics() {
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const queryString = searchParams.toString()
  const { messages } = useLanguage()
  const [consent, setConsent] = useState<AnalyticsConsentState>('unknown')

  useEffect(() => {
    setConsent(readAnalyticsConsentFromDocument())
  }, [])

  useEffect(() => {
    if (consent !== 'granted') {
      return
    }

    const pagePath = queryString ? `${pathname}?${queryString}` : pathname
    trackPageView(pagePath)
  }, [consent, pathname, queryString])

  if (consent === 'unknown') {
    return (
      <div className="fixed inset-x-3 bottom-3 z-[100] sm:inset-x-6">
        <div className="cosmic-shell mx-auto max-w-4xl rounded-2xl p-4 sm:p-5">
          <p className="text-sm font-bold text-slate-50">{messages.cookieConsent.title}</p>
          <p className="mt-2 text-sm text-slate-100/84">{messages.cookieConsent.description}</p>
          <div className="mt-4 flex flex-wrap items-center gap-2">
            <button
              type="button"
              className="cosmic-button-primary rounded-full px-4 py-2 text-xs font-black uppercase tracking-[0.14em]"
              onClick={() => {
                setAnalyticsConsentInDocument('granted')
                setConsent('granted')
              }}
            >
              {messages.cookieConsent.accept}
            </button>
            <button
              type="button"
              className="cosmic-outline-button rounded-full px-4 py-2 text-xs font-black uppercase tracking-[0.14em]"
              onClick={() => {
                setAnalyticsConsentInDocument('denied')
                setConsent('denied')
              }}
            >
              {messages.cookieConsent.decline}
            </button>
            <Link href="/legal/privacy" className="cosmic-link text-xs">
              {messages.cookieConsent.learnMore}
            </Link>
          </div>
        </div>
      </div>
    )
  }

  if (!GA_MEASUREMENT_ID || consent !== 'granted') {
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
