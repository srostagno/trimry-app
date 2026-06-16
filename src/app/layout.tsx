import type { ReactNode } from 'react'
import { cookies, headers } from 'next/headers'

import './globals.css'
import { GoogleAnalytics } from '@/components/google-analytics'
import { JsonLd } from '@/components/json-ld'
import { LanguageProvider } from '@/components/language-provider'
import { SiteShell } from '@/components/site-shell'
import { getAuthenticatedViewer } from '@/lib/auth-viewer'
import {
  DEFAULT_LANGUAGE,
  languageFromAcceptLanguage,
  languageFromCountryCode,
  languageFromLocale,
  type LanguageCode,
} from '@/lib/i18n'
import { rootMetadata, sitewideJsonLd } from '@/lib/seo'

export const metadata = rootMetadata

type InitialLanguageSource = 'viewer' | 'stored' | 'detected' | 'default'

const COUNTRY_HEADER_NAMES = [
  'cf-ipcountry',
  'x-vercel-ip-country',
  'cloudfront-viewer-country',
  'x-country-code',
  'x-geo-country',
  'x-appengine-country',
  'fly-client-ip-country',
]

function readDetectedCountryCode(headerStore: Headers) {
  for (const headerName of COUNTRY_HEADER_NAMES) {
    const value = headerStore.get(headerName)
    const countryCode = value?.split(',')[0]?.trim()

    if (countryCode) {
      return countryCode
    }
  }

  return null
}

export default async function RootLayout({ children }: { children: ReactNode }) {
  const cookieStore = await cookies()
  const headerStore = await headers()
  const viewer = await getAuthenticatedViewer()
  const cookieLanguage = cookieStore.get('trimry-language')?.value
  const viewerLanguage = viewer?.locale
  const detectedLanguage =
    languageFromCountryCode(readDetectedCountryCode(headerStore)) ??
    languageFromAcceptLanguage(headerStore.get('accept-language'))
  let initialLanguage: LanguageCode = DEFAULT_LANGUAGE
  let initialLanguageSource: InitialLanguageSource = 'default'

  const languageFromSettings = languageFromLocale(viewerLanguage)
  const languageFromCookie = languageFromLocale(cookieLanguage)

  if (languageFromSettings) {
    initialLanguage = languageFromSettings
    initialLanguageSource = 'viewer'
  } else if (languageFromCookie) {
    initialLanguage = languageFromCookie
    initialLanguageSource = 'stored'
  } else if (detectedLanguage) {
    initialLanguage = detectedLanguage
    initialLanguageSource = 'detected'
  }

  return (
    <html lang={initialLanguage} className="h-full antialiased">
      <body className="min-h-full font-sans">
        <LanguageProvider
          initialLanguage={initialLanguage}
          initialLanguageSource={initialLanguageSource}
        >
          <GoogleAnalytics />
          <JsonLd data={sitewideJsonLd} />
          <SiteShell viewer={viewer}>{children}</SiteShell>
        </LanguageProvider>
      </body>
    </html>
  )
}
