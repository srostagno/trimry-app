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
export const SITE_TITLE =
  'Good and Bad Days to Cut Your Hair, Nails and More | Trimry'
export const SITE_DESCRIPTION =
  'Discover good and bad days to cut your hair, trim nails, shave, and reset your week. Trimry sends one Monday forecast with good, bad, and rare timing signals by email, WhatsApp, or both.'
export const SITE_KEYWORDS = [
  'good and bad days to cut your hair',
  'good and bad days to cut your hair nails and more',
  'best day to cut hair and nails',
  'bad day to cut hair',
  'lucky haircut days',
  'lucky nail cutting days',
  'hair and nails timing calendar',
  'haircut timing',
  'nail cutting timing',
  'weekly fortune forecast',
  'ritual release guidance',
  'Tibetan calendar timing',
  'weekly luck forecast',
  'WhatsApp fortune messages',
  'email fortune forecast',
  'grooming timing guidance',
  'lucky days calendar',
] as const
export const SITE_LOCALE = 'en_US'
export const METADATA_BASE = new URL(SITE_URL)
export const SOCIAL_IMAGE_PATH = '/opengraph-image'
export const TWITTER_IMAGE_PATH = '/twitter-image'
export const GOOD_BAD_GUIDE_PATH = '/good-and-bad-days-to-cut-your-hair-nails-and-more'

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

  return {
    title,
    description,
    keywords: [...SITE_KEYWORDS, ...keywords],
    alternates: shouldNoIndex ? undefined : { canonical },
    openGraph: {
      type: 'website',
      locale: SITE_LOCALE,
      url: canonical,
      siteName: SITE_NAME,
      title: buildTitle(title),
      description,
      images: [
        {
          url: absoluteUrl(SOCIAL_IMAGE_PATH),
          width: 1200,
          height: 630,
          alt: 'Good and bad days to cut your hair, nails, and more with Trimry',
        },
      ],
    },
    twitter: {
      card: 'summary_large_image',
      title: buildTitle(title),
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
  category: 'Lifestyle',
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
        alt: 'Good and bad days to cut your hair, nails, and more with Trimry',
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
  icons: {
    icon: '/favicon.ico',
    shortcut: '/favicon.ico',
    apple: '/favicon.ico',
  },
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
    url: SITE_URL,
    logo: absoluteUrl('/logo.png'),
    email: COMPANY.supportEmail,
    contactPoint: [
      {
        '@type': 'ContactPoint',
        contactType: 'customer support',
        email: COMPANY.supportEmail,
        availableLanguage: ['en'],
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
    inLanguage: 'en',
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
    inLanguage: 'en',
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
    serviceType: 'Good and bad days to cut your hair, nails, and more',
    areaServed: 'Worldwide',
    provider: {
      '@id': absoluteUrl('/#organization'),
    },
    offers: {
      '@type': 'Offer',
      url: absoluteUrl('/#pricing'),
      price: SUBSCRIPTION_PLAN.monthlyPriceUsd.toFixed(2),
      priceCurrency: SUBSCRIPTION_PLAN.currency,
      availability: 'https://schema.org/InStock',
      category: 'Subscription',
    },
  },
  {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    '@id': absoluteUrl('/#faq'),
    mainEntity: [
      {
        '@type': 'Question',
        name: englishMessages.faq.q1,
        acceptedAnswer: {
          '@type': 'Answer',
          text: englishMessages.faq.a1,
        },
      },
      {
        '@type': 'Question',
        name: englishMessages.faq.q2,
        acceptedAnswer: {
          '@type': 'Answer',
          text: englishMessages.faq.a2,
        },
      },
      {
        '@type': 'Question',
        name: englishMessages.faq.q3,
        acceptedAnswer: {
          '@type': 'Answer',
          text: englishMessages.faq.a3,
        },
      },
      {
        '@type': 'Question',
        name: englishMessages.faq.q4,
        acceptedAnswer: {
          '@type': 'Answer',
          text: englishMessages.faq.a4,
        },
      },
    ],
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
