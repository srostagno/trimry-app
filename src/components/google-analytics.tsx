'use client'

import Link from 'next/link'
import Script from 'next/script'
import { usePathname, useSearchParams } from 'next/navigation'
import { useEffect, useRef, useState } from 'react'

import {
  readAnalyticsConsentFromDocument,
  setAnalyticsConsentInDocument,
  type AnalyticsConsentState,
} from '@/lib/analytics-consent'
import {
  GA_MEASUREMENT_ID,
  META_PIXEL_ID,
  trackMetaPageView,
  trackPageView,
} from '@/lib/analytics'
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
  const hasTrackedMetaInitialPageView = useRef(false)
  const shouldLoadGoogleAnalytics = Boolean(GA_MEASUREMENT_ID)
  const shouldLoadMetaPixel = Boolean(META_PIXEL_ID)

  useEffect(() => {
    setConsent(readAnalyticsConsentFromDocument())
  }, [])

  useEffect(() => {
    if (!shouldLoadGoogleAnalytics) {
      return
    }

    const pagePath = queryString ? `${pathname}?${queryString}` : pathname
    trackPageView(pagePath)
  }, [pathname, queryString, shouldLoadGoogleAnalytics])

  useEffect(() => {
    if (!shouldLoadMetaPixel) {
      return
    }

    if (hasTrackedMetaInitialPageView.current) {
      trackMetaPageView()
      return
    }

    hasTrackedMetaInitialPageView.current = true
  }, [pathname, queryString, shouldLoadMetaPixel])

  const metaPixelScripts = shouldLoadMetaPixel ? (
    <>
      <Script id="meta-pixel" strategy="afterInteractive">
        {`
          !function(f,b,e,v,n,t,s)
          {if(f.fbq)return;n=f.fbq=function(){n.callMethod?
          n.callMethod.apply(n,arguments):n.queue.push(arguments)};
          if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';
          n.queue=[];t=b.createElement(e);t.async=!0;
          t.src=v;s=b.getElementsByTagName(e)[0];
          s.parentNode.insertBefore(t,s)}(window, document,'script',
          'https://connect.facebook.net/en_US/fbevents.js');
          fbq('init', '${META_PIXEL_ID}');
          fbq('track', 'PageView');
        `}
      </Script>
      <noscript
        dangerouslySetInnerHTML={{
          __html: `<img height="1" width="1" style="display:none" src="https://www.facebook.com/tr?id=${META_PIXEL_ID}&ev=PageView&noscript=1" />`,
        }}
      />
    </>
  ) : null

  const consentBanner =
    consent === 'unknown' ? (
      <div className="fixed inset-x-3 bottom-3 z-[100] sm:inset-x-6">
        <div className="tr-shell mx-auto max-w-3xl p-4 sm:p-5">
          <p className="text-sm font-extrabold text-trimry-ink">{messages.cookieConsent.title}</p>
          <p className="mt-1.5 text-sm text-trimry-slate">{messages.cookieConsent.description}</p>
          <div className="mt-4 flex flex-wrap items-center gap-2">
            <button
              type="button"
              className="tr-btn-primary tr-btn-sm"
              onClick={() => {
                setAnalyticsConsentInDocument('granted')
                setConsent('granted')
              }}
            >
              {messages.cookieConsent.accept}
            </button>
            <button
              type="button"
              className="tr-btn-secondary tr-btn-sm"
              onClick={() => {
                setAnalyticsConsentInDocument('denied')
                setConsent('denied')
              }}
            >
              {messages.cookieConsent.decline}
            </button>
            <Link href="/legal/privacy" className="tr-link text-xs">
              {messages.cookieConsent.learnMore}
            </Link>
          </div>
        </div>
      </div>
    ) : null

  if (!shouldLoadGoogleAnalytics && !shouldLoadMetaPixel) {
    return consentBanner
  }

  return (
    <>
      {consentBanner}
      {shouldLoadGoogleAnalytics ? (
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
      ) : null}
      {metaPixelScripts}
    </>
  )
}
