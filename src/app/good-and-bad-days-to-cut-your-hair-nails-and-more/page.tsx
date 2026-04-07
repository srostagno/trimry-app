import Link from 'next/link'

import { JsonLd } from '@/components/json-ld'
import {
  GOOD_BAD_GUIDE_PATH,
  SITE_NAME,
  absoluteUrl,
  createPageMetadata,
} from '@/lib/seo'

const pageTitle = 'Good and Bad Days to Cut Your Hair, Nails and More'
const pageDescription =
  'Learn how to read good, bad, and rare days to cut your hair, trim nails, shave, and plan release rituals. Get weekly Monday timing guidance from Trimry.'

const faq = [
  {
    question: 'How does Trimry decide good and bad days?',
    answer:
      'Trimry uses a weekly rhythm inspired by Tibetan calendar timing traditions, then maps each day as Good, Bad, or Rare for haircut, nails, shaving, and release routines.',
  },
  {
    question: 'Is this medical advice?',
    answer:
      'No. This is cultural timing guidance for personal rituals and routines, not a medical recommendation.',
  },
  {
    question: 'Can I use this for nail trimming too?',
    answer:
      'Yes. The weekly guidance covers haircuts, nail trimming, shaving, and symbolic release timing.',
  },
  {
    question: 'When do I receive the weekly update?',
    answer:
      'Every Monday at your selected local hour by email, WhatsApp, or both.',
  },
] as const

const pageUrl = absoluteUrl(GOOD_BAD_GUIDE_PATH)

const seoGuideJsonLd = [
  {
    '@context': 'https://schema.org',
    '@type': 'WebPage',
    '@id': `${pageUrl}#webpage`,
    name: `${pageTitle} | ${SITE_NAME}`,
    url: pageUrl,
    description: pageDescription,
    inLanguage: 'en',
    isPartOf: {
      '@id': absoluteUrl('/#website'),
    },
    breadcrumb: {
      '@id': `${pageUrl}#breadcrumb`,
    },
  },
  {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    '@id': `${pageUrl}#breadcrumb`,
    itemListElement: [
      {
        '@type': 'ListItem',
        position: 1,
        name: 'Home',
        item: absoluteUrl('/'),
      },
      {
        '@type': 'ListItem',
        position: 2,
        name: pageTitle,
        item: pageUrl,
      },
    ],
  },
  {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    '@id': `${pageUrl}#faq`,
    mainEntity: faq.map((item) => ({
      '@type': 'Question',
      name: item.question,
      acceptedAnswer: {
        '@type': 'Answer',
        text: item.answer,
      },
    })),
  },
]

export const metadata = createPageMetadata({
  title: pageTitle,
  description: pageDescription,
  path: GOOD_BAD_GUIDE_PATH,
  keywords: [
    'good and bad days to cut your hair nails and more',
    'good and bad days to cut your hair',
    'best day to cut hair',
    'best day to trim nails',
    'bad day to cut hair',
    'hair and nails lucky days',
  ],
})

export default function GoodBadDaysGuidePage() {
  return (
    <>
      <JsonLd data={seoGuideJsonLd} />

      <article className="space-y-10">
        <header className="cosmic-panel rounded-[2rem] p-8 sm:p-10">
          <p className="text-xs font-bold uppercase tracking-[0.2em] text-cyan-100/75">
            English SEO Guide
          </p>
          <h1 className="mt-4 max-w-4xl text-4xl leading-tight text-slate-50 sm:text-5xl">
            Good and Bad Days to Cut Your Hair, Nails and More
          </h1>
          <p className="mt-4 max-w-3xl text-lg text-slate-100/84">
            If you are searching for good and bad days to cut your hair, nails and more, this
            page explains how Trimry reads weekly timing signals and turns them into practical
            actions you can follow every Monday.
          </p>
        </header>

        <section className="grid gap-6 md:grid-cols-3">
          <article className="cosmic-card rounded-3xl p-6">
            <h2 className="text-2xl text-slate-50">Good days</h2>
            <p className="mt-3 text-slate-100/84">
              Best for fresh starts, grooming resets, visible upgrades, and momentum-building
              decisions.
            </p>
          </article>
          <article className="cosmic-card rounded-3xl p-6">
            <h2 className="text-2xl text-slate-50">Bad days</h2>
            <p className="mt-3 text-slate-100/84">
              Better for maintenance and caution. Avoid impulsive style changes and high-risk
              decisions.
            </p>
          </article>
          <article className="cosmic-card rounded-3xl p-6">
            <h2 className="text-2xl text-slate-50">Rare days</h2>
            <p className="mt-3 text-slate-100/84">
              Unusual timing windows where coincidences and emotional swings tend to be stronger.
            </p>
          </article>
        </section>

        <section className="cosmic-card rounded-3xl p-7 sm:p-8">
          <h2 className="text-3xl text-slate-50">How to use this each week</h2>
          <ol className="mt-4 list-decimal space-y-2 pl-5 text-slate-100/88">
            <li>Check your Monday Trimry forecast.</li>
            <li>Mark good days for haircuts, nail trimming, or shaving.</li>
            <li>Use bad days for low-stakes routines and recovery.</li>
            <li>Use rare days for reflection and symbolic release rituals.</li>
          </ol>
          <p className="mt-5 text-sm text-slate-100/78">
            Trimry is a cultural timing service. It is not medical, legal, or financial advice.
          </p>
        </section>

        <section id="faq" className="space-y-4">
          <h2 className="text-3xl text-slate-50 sm:text-4xl">FAQ: Haircut and Nail Timing</h2>
          <div className="grid gap-4 md:grid-cols-2">
            {faq.map((item) => (
              <article key={item.question} className="cosmic-card rounded-2xl p-5">
                <h3 className="text-lg text-slate-50">{item.question}</h3>
                <p className="mt-2 text-slate-100/82">{item.answer}</p>
              </article>
            ))}
          </div>
        </section>

        <section className="luck-glow cosmic-cta rounded-[2rem] border border-cyan-200/26 p-8 text-center sm:p-10">
          <h2 className="text-3xl text-slate-50 sm:text-4xl">
            Get your weekly good and bad day forecast
          </h2>
          <p className="mx-auto mt-3 max-w-2xl text-slate-100/84">
            Create your account and receive one Monday update with Good, Bad, and Rare timing for
            hair, nails, shaving, and release rituals.
          </p>
          <div className="mt-7 flex flex-wrap items-center justify-center gap-3">
            <Link
              href="/account/register"
              className="cosmic-button-primary rounded-full px-7 py-3 text-sm font-black uppercase tracking-[0.15em]"
            >
              Create account
            </Link>
            <Link
              href="/"
              className="cosmic-button-secondary rounded-full px-7 py-3 text-sm font-black uppercase tracking-[0.15em] text-cyan-50 transition hover:bg-cyan-300/14"
            >
              Back to home
            </Link>
          </div>
        </section>
      </article>
    </>
  )
}
