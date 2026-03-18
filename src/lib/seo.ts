import type { Metadata } from 'next'

import { COMPANY, SUBSCRIPTION_PLAN } from '@/lib/company'
import { DEFAULT_LANGUAGE, getMessages } from '@/lib/i18n'

const DEFAULT_PRODUCTION_SITE_URL = COMPANY.websiteUrl

function normalizeUrl(value: string) {
  return value.replace(/\/+$/, '')
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
export const SITE_NAME = COMPANY.brandName
export const SITE_TITLE =
  'Trimry | Lucky timing for haircuts, weekly fortune, and ritual release guidance'
export const SITE_DESCRIPTION =
  'Trimry delivers one weekly ritual forecast every Monday by email, WhatsApp, or both, with favorable, challenging, and rare day signals for haircuts, shaving, nail cutting, and symbolic release timing.'
export const SITE_KEYWORDS = [
  'lucky haircut days',
  'haircut timing',
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

const englishMessages = getMessages(DEFAULT_LANGUAGE)

function buildTitle(title?: string) {
  return title ? `${title} | ${SITE_NAME}` : SITE_TITLE
}

export function absoluteUrl(path = '/') {
  return new URL(path, METADATA_BASE).toString()
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
  const canonical = absoluteUrl(path)

  return {
    title,
    description,
    keywords: [...SITE_KEYWORDS, ...keywords],
    alternates: noIndex ? undefined : { canonical },
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
          alt: 'Trimry weekly ritual timing and fortune guidance',
        },
      ],
    },
    twitter: {
      card: 'summary_large_image',
      title: buildTitle(title),
      description,
      images: [absoluteUrl(TWITTER_IMAGE_PATH)],
    },
    robots: noIndex
      ? {
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
      : {
          index: true,
          follow: true,
          googleBot: {
            index: true,
            follow: true,
            'max-snippet': -1,
            'max-image-preview': 'large',
            'max-video-preview': -1,
          },
        },
  }
}

export function createNoIndexMetadata(title: string, description = SITE_DESCRIPTION): Metadata {
  return createPageMetadata({
    title,
    description,
    noIndex: true,
  })
}

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
  alternates: {
    canonical: absoluteUrl('/'),
  },
  openGraph: {
    type: 'website',
    locale: SITE_LOCALE,
    url: absoluteUrl('/'),
    siteName: SITE_NAME,
    title: SITE_TITLE,
    description: SITE_DESCRIPTION,
    images: [
      {
        url: absoluteUrl(SOCIAL_IMAGE_PATH),
        width: 1200,
        height: 630,
        alt: 'Trimry weekly ritual timing and fortune guidance',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: SITE_TITLE,
    description: SITE_DESCRIPTION,
    images: [absoluteUrl(TWITTER_IMAGE_PATH)],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-snippet': -1,
      'max-image-preview': 'large',
      'max-video-preview': -1,
    },
  },
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
    serviceType: 'Weekly ritual timing and fortune guidance subscription',
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
