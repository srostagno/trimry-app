import type { ReactNode } from 'react'
import { cookies } from 'next/headers'

import './globals.css'
import { GoogleAnalytics } from '@/components/google-analytics'
import { JsonLd } from '@/components/json-ld'
import { LanguageProvider } from '@/components/language-provider'
import { SiteShell } from '@/components/site-shell'
import { getAuthenticatedViewer } from '@/lib/auth-viewer'
import { DEFAULT_LANGUAGE, isLanguageCode, type LanguageCode } from '@/lib/i18n'
import { rootMetadata, sitewideJsonLd } from '@/lib/seo'

export const metadata = rootMetadata

export default async function RootLayout({ children }: { children: ReactNode }) {
  const cookieStore = await cookies()
  const viewer = await getAuthenticatedViewer()
  const cookieLanguage = cookieStore.get('trimry-language')?.value
  const viewerLanguage = viewer?.locale
  let initialLanguage: LanguageCode = DEFAULT_LANGUAGE

  if (cookieLanguage && isLanguageCode(cookieLanguage)) {
    initialLanguage = cookieLanguage
  } else if (viewerLanguage && isLanguageCode(viewerLanguage)) {
    initialLanguage = viewerLanguage
  }

  return (
    <html lang={initialLanguage} className="h-full antialiased">
      <body className="min-h-full font-sans">
        <LanguageProvider initialLanguage={initialLanguage}>
          <GoogleAnalytics />
          <JsonLd data={sitewideJsonLd} />
          <SiteShell viewer={viewer}>{children}</SiteShell>
        </LanguageProvider>
      </body>
    </html>
  )
}
