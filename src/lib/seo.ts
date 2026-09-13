import type { Metadata } from 'next'

import { COMPANY, SUBSCRIPTION_PLAN } from '@/lib/company'
import { DEFAULT_LANGUAGE, getMessages } from '@/lib/i18n'

const DEFAULT_PRODUCTION_SITE_URL = COMPANY.websiteUrl

function normalizeUrl(value: string) {
  return value.replace(/\/+$/, '')
}

function resolveHostname(value: string) {
  try {
    return new URL(value).hostname.toLowerCase()
  } catch {
    return ''
  }
}

function normalizeHostname(hostname: string) {
  return hostname.replace(/^www\./, '')
}

function resolveSiteUrl() {
  const envUrl = process.env.NEXT_PUBLIC_SITE_URL

  if (envUrl) {
    try {
      return normalizeUrl(new URL(envUrl).toString())
    } catch {
      return DEFAULT_PRODUCTION_SITE_URL
    }
  }

  return process.env.NODE_ENV === 'development'
    ? 'http://localhost:3000'
    : DEFAULT_PRODUCTION_SITE_URL
}

export const SITE_URL = resolveSiteUrl()
export const IS_INDEXING_ALLOWED = resolveIndexingAllowed(SITE_URL)
export const SITE_NAME = COMPANY.brandName
export const SITE_SLOGAN = 'Never miss a game again'
export const SITE_TITLE = `${SITE_SLOGAN} | ${SITE_NAME}`
export const SITE_DESCRIPTION =
  'Trimry is your sports events radar: pick the sports, leagues and teams you follow and get a personal agenda of upcoming matches, races and fights by email and WhatsApp.'
export const SITE_KEYWORDS = [
  'sports events notifications',
  'match reminders',
  'fixtures alerts',
  'sports schedule email',
  'sports agenda whatsapp',
  'football fixtures alerts',
  'nba schedule notifications',
  'f1 race reminders',
  'ufc fight alerts',
  'personalized sports calendar',
  'never miss a game',
] as const
export const SITE_LOCALE = 'en_US'
export const METADATA_BASE = new URL(SITE_URL)
export const SOCIAL_IMAGE_PATH = '/opengraph-image'
export const TWITTER_IMAGE_PATH = '/twitter-image'

const englishMessages = getMessages(DEFAULT_LANGUAGE)
const rootCanonicalUrl = absoluteUrl('/')

function resolveIndexingAllowed(siteUrl: string) {
  const explicitIndexing = process.env.NEXT_PUBLIC_ALLOW_INDEXING

  if (explicitIndexing === 'true') {
    return true
  }

  if (explicitIndexing === 'false') {
    return false
  }

  const vercelEnv = process.env.VERCEL_ENV

  if (vercelEnv && vercelEnv !== 'production') {
    return false
  }

  const siteHostname = resolveHostname(siteUrl)
  const productionHostname = resolveHostname(DEFAULT_PRODUCTION_SITE_URL)

  return (
    siteHostname.length > 0 &&
    normalizeHostname(siteHostname) === normalizeHostname(productionHostname)
  )
}

function buildTitle(title?: string) {
  return title ? `${title} | ${SITE_NAME}` : SITE_TITLE
}

export function absoluteUrl(path = '/') {
  return new URL(path, METADATA_BASE).toString()
}

function robotsDirectives(noIndex: boolean): Metadata['robots'] {
  if (noIndex) {
    return {
      index: false,
      follow: false,
      nocache: true,
      googleBot: {
        index: false,
        follow: false,
        noimageindex: true,
        'max-snippet': 0,
        'max-video-preview': 0,
      },
    }
  }

  return {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-snippet': -1,
      'max-image-preview': 'large',
      'max-video-preview': -1,
    },
  }
}

type PageMetadataOptions = {
  title?: string
  description?: string
  path?: string
  keywords?: string[]
  noIndex?: boolean
}

export function createPageMetadata({
  title,
  description = SITE_DESCRIPTION,
  path = '/',
  keywords = [],
  noIndex = false,
}: PageMetadataOptions): Metadata {
  const shouldNoIndex = noIndex || !IS_INDEXING_ALLOWED
  const canonical = absoluteUrl(path)
  const resolvedTitle = buildTitle(title)

  return {
    title: {
      absolute: resolvedTitle,
    },
    description,
    keywords: [...SITE_KEYWORDS, ...keywords],
    alternates: shouldNoIndex ? undefined : { canonical },
    openGraph: {
      type: 'website',
      locale: SITE_LOCALE,
      url: canonical,
      siteName: SITE_NAME,
      title: resolvedTitle,
      description,
      images: [
        {
          url: absoluteUrl(SOCIAL_IMAGE_PATH),
          width: 1200,
          height: 630,
          alt: 'Trimry, your sports events radar',
        },
      ],
    },
    twitter: {
      card: 'summary_large_image',
      title: resolvedTitle,
      description,
      images: [absoluteUrl(TWITTER_IMAGE_PATH)],
    },
    robots: robotsDirectives(shouldNoIndex),
  }
}

type NoIndexMetadataOptions = {
  title: string
  description?: string
  path?: string
}

export function createNoIndexMetadata({
  title,
  description = SITE_DESCRIPTION,
  path = '/',
}: NoIndexMetadataOptions): Metadata {
  return createPageMetadata({
    title,
    description,
    path,
    noIndex: true,
  })
}

const rootShouldNoIndex = !IS_INDEXING_ALLOWED

export const rootMetadata: Metadata = {
  metadataBase: METADATA_BASE,
  title: {
    template: `%s | ${SITE_NAME}`,
    default: SITE_TITLE,
  },
  description: SITE_DESCRIPTION,
  applicationName: SITE_NAME,
  manifest: '/manifest.webmanifest',
  keywords: [...SITE_KEYWORDS],
  category: 'Sports',
  creator: COMPANY.legalName,
  publisher: COMPANY.legalName,
  authors: [{ name: COMPANY.legalName, url: SITE_URL }],
  referrer: 'origin-when-cross-origin',
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  alternates: rootShouldNoIndex ? undefined : { canonical: rootCanonicalUrl },
  openGraph: {
    type: 'website',
    locale: SITE_LOCALE,
    url: rootCanonicalUrl,
    siteName: SITE_NAME,
    title: SITE_TITLE,
    description: SITE_DESCRIPTION,
    images: [
      {
        url: absoluteUrl(SOCIAL_IMAGE_PATH),
        width: 1200,
        height: 630,
        alt: 'Trimry, your sports events radar',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: SITE_TITLE,
    description: SITE_DESCRIPTION,
    images: [absoluteUrl(TWITTER_IMAGE_PATH)],
  },
  robots: robotsDirectives(rootShouldNoIndex),
  verification: {
    other: {
      'facebook-domain-verification': 'c6u5evblmks2uyl105g7ph2e2yankn',
    },
  },
}

export const sitewideJsonLd = [
  {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    '@id': absoluteUrl('/#organization'),
    name: COMPANY.legalName,
    alternateName: SITE_NAME,
    slogan: SITE_SLOGAN,
    url: SITE_URL,
    logo: absoluteUrl('/brand/trimry-icon-512.png'),
    email: COMPANY.supportEmail,
    contactPoint: [
      {
        '@type': 'ContactPoint',
        contactType: 'customer support',
        email: COMPANY.supportEmail,
        availableLanguage: ['en', 'es', 'pt'],
      },
    ],
    address: {
      '@type': 'PostalAddress',
      streetAddress: '71 Lower Baggot Street',
      addressLocality: 'Dublin 2',
      postalCode: 'D02 P593',
      addressCountry: 'IE',
    },
  },
  {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    '@id': absoluteUrl('/#website'),
    name: SITE_NAME,
    url: SITE_URL,
    description: SITE_DESCRIPTION,
    inLanguage: ['en', 'es', 'pt'],
    publisher: {
      '@id': absoluteUrl('/#organization'),
    },
  },
]

export const homePageJsonLd = [
  {
    '@context': 'https://schema.org',
    '@type': 'WebPage',
    '@id': absoluteUrl('/#webpage'),
    name: buildTitle(),
    url: absoluteUrl('/'),
    description: SITE_DESCRIPTION,
    inLanguage: ['en', 'es', 'pt'],
    isPartOf: {
      '@id': absoluteUrl('/#website'),
    },
    about: {
      '@id': absoluteUrl('/#service'),
    },
  },
  {
    '@context': 'https://schema.org',
    '@type': 'Service',
    '@id': absoluteUrl('/#service'),
    name: SUBSCRIPTION_PLAN.name,
    description: SITE_DESCRIPTION,
    serviceType: 'Personalized sports events notifications by email and WhatsApp',
    areaServed: 'Worldwide',
    provider: {
      '@id': absoluteUrl('/#organization'),
    },
  },
  {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    '@id': absoluteUrl('/#faq'),
    mainEntity: englishMessages.faq.items.map((item) => ({
      '@type': 'Question',
      name: item.question,
      acceptedAnswer: {
        '@type': 'Answer',
        text: item.answer,
      },
    })),
  },
]

type LegalJsonLdOptions = {
  title: string
  description: string
  path: string
}

export function createLegalPageJsonLd({ title, description, path }: LegalJsonLdOptions) {
  const url = absoluteUrl(path)

  return [
    {
      '@context': 'https://schema.org',
      '@type': 'WebPage',
      '@id': `${url}#webpage`,
      name: title,
      url,
      description,
      inLanguage: 'en',
      isPartOf: {
        '@id': absoluteUrl('/#website'),
      },
      publisher: {
        '@id': absoluteUrl('/#organization'),
      },
    },
    {
      '@context': 'https://schema.org',
      '@type': 'BreadcrumbList',
      '@id': `${url}#breadcrumb`,
      itemListElement: [
        {
          '@type': 'ListItem',
          position: 1,
          name: SITE_NAME,
          item: absoluteUrl('/'),
        },
        {
          '@type': 'ListItem',
          position: 2,
          name: title,
          item: url,
        },
      ],
    },
  ]
}
