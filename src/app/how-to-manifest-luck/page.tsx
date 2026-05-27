import Link from 'next/link'

import { JsonLd } from '@/components/json-ld'
import { OpenLuckGuruChatButton } from '@/components/open-luck-guru-chat-button'
import {
  LAW_OF_ATTRACTION_GUIDE_PATH,
  LUCKY_NUMBERS_GUIDE_PATH,
  MANIFEST_LUCK_GUIDE_PATH,
  POSITIVE_AFFIRMATIONS_GUIDE_PATH,
  SITE_NAME,
  SOCIAL_IMAGE_PATH,
  absoluteUrl,
  createPageMetadata,
} from '@/lib/seo'

const pageTitle = 'How to Manifest Luck - Practical Daily Method'
const pageDescription =
  'Learn how to manifest luck with a practical daily method: intention, visualization, positive action, and consistency. Built for a US audience that wants real momentum.'

const faq = [
  {
    question: 'Can you really manifest luck?',
    answer:
      'Manifesting luck is best understood as a mindset and behavior practice. You train attention, take aligned actions, and stay open to opportunities you might otherwise miss.',
  },
  {
    question: 'How long does it take to feel results?',
    answer:
      'Most people feel a shift in clarity and confidence within one to two weeks when they practice daily. Bigger life outcomes depend on consistency and action.',
  },
  {
    question: 'What is the fastest way to start?',
    answer:
      'Start with a 5-minute routine: write one intention, visualize one desired outcome, and complete one small action that moves you closer to it.',
  },
  {
    question: 'Do I need to believe 100% for this to work?',
    answer:
      'No. You need enough belief to take action. Consistent positive habits can strengthen belief over time.',
  },
] as const

const pageUrl = absoluteUrl(MANIFEST_LUCK_GUIDE_PATH)
const pageImageUrl = absoluteUrl(SOCIAL_IMAGE_PATH)

const seoGuideJsonLd = [
  {
    '@context': 'https://schema.org',
    '@type': 'WebPage',
    '@id': `${pageUrl}#webpage`,
    name: `${pageTitle} | ${SITE_NAME}`,
    url: pageUrl,
    description: pageDescription,
    inLanguage: 'en-US',
    isPartOf: {
      '@id': absoluteUrl('/#website'),
    },
    primaryImageOfPage: pageImageUrl,
    mainEntity: {
      '@id': `${pageUrl}#article`,
    },
    breadcrumb: {
      '@id': `${pageUrl}#breadcrumb`,
    },
  },
  {
    '@context': 'https://schema.org',
    '@type': 'Article',
    '@id': `${pageUrl}#article`,
    headline: 'How to Manifest Luck: A Practical Daily Guide',
    description: pageDescription,
    image: pageImageUrl,
    inLanguage: 'en-US',
    mainEntityOfPage: {
      '@id': `${pageUrl}#webpage`,
    },
    author: {
      '@id': absoluteUrl('/#organization'),
    },
    publisher: {
      '@id': absoluteUrl('/#organization'),
    },
    keywords: [
      'how to manifest luck',
      'manifest luck',
      'manifestation techniques',
      'how to manifest good luck',
      'manifestation routine',
    ],
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
  path: MANIFEST_LUCK_GUIDE_PATH,
  keywords: [
    'how to manifest luck',
    'how to manifest good luck fast',
    'manifestation techniques for beginners',
    'daily manifestation routine',
    'how to attract luck and positivity',
  ],
})

export default function ManifestLuckGuidePage() {
  return (
    <>
      <JsonLd data={seoGuideJsonLd} />

      <article className="space-y-10">
        <header className="cosmic-panel rounded-[2rem] p-8 sm:p-10">
          <p className="text-xs font-bold uppercase tracking-[0.2em] text-cyan-100/75">
            US Manifestation Guide
          </p>
          <h1 className="mt-4 max-w-4xl text-4xl leading-tight text-slate-50 sm:text-5xl">
            How to Manifest Luck (Without Waiting for Random Chance)
          </h1>
          <p className="mt-4 max-w-3xl text-lg text-slate-100/84">
            If you are searching how to manifest luck, the core idea is simple: build a positive
            mental state, pair it with intentional action, and repeat it long enough to change your
            outcomes. This guide gives you a practical method you can use in real life.
          </p>
        </header>

        <section className="grid gap-6 md:grid-cols-3">
          <article className="cosmic-card rounded-3xl p-6">
            <h2 className="text-2xl text-slate-50">1) Set a clear intention</h2>
            <p className="mt-3 text-slate-100/84">
              Define one specific area where you want more luck: career, money, love, confidence,
              or a fresh start.
            </p>
          </article>
          <article className="cosmic-card rounded-3xl p-6">
            <h2 className="text-2xl text-slate-50">2) Visualize the outcome</h2>
            <p className="mt-3 text-slate-100/84">
              Spend two minutes imagining the result as if it is already becoming real. Feel the
              emotion, not only the image.
            </p>
          </article>
          <article className="cosmic-card rounded-3xl p-6">
            <h2 className="text-2xl text-slate-50">3) Take immediate action</h2>
            <p className="mt-3 text-slate-100/84">
              Do one concrete step today. Luck favors movement, not passive waiting.
            </p>
          </article>
        </section>

        <section className="cosmic-card rounded-3xl p-7 sm:p-8">
          <h2 className="text-3xl text-slate-50">Daily 5-minute manifest luck routine</h2>
          <ol className="mt-4 list-decimal space-y-2 pl-5 text-slate-100/88">
            <li>Write one intention in the present tense.</li>
            <li>Name three things that already make you feel grateful.</li>
            <li>Read one short positive affirmation out loud.</li>
            <li>Choose one action that can create opportunity today.</li>
            <li>Review wins before bed to reinforce positive momentum.</li>
          </ol>
        </section>

        <section className="grid gap-6 md:grid-cols-2">
          <article className="cosmic-card rounded-3xl p-6">
            <h2 className="text-3xl text-slate-50">Common mistakes</h2>
            <ul className="mt-4 list-disc space-y-2 pl-5 text-slate-100/86">
              <li>Changing goals every day.</li>
              <li>Focusing only on rituals and skipping action.</li>
              <li>Using negative self-talk after setbacks.</li>
              <li>Quitting before a pattern has time to build.</li>
            </ul>
          </article>

          <article className="cosmic-card rounded-3xl p-6">
            <h2 className="text-3xl text-slate-50">Related luck guides</h2>
            <div className="mt-4 space-y-3 text-slate-100/86">
              <p>
                Pair this page with{' '}
                <Link className="cosmic-link" href={POSITIVE_AFFIRMATIONS_GUIDE_PATH}>
                  positive affirmations for success and luck
                </Link>{' '}
                to build stronger daily language.
              </p>
              <p>
                Learn the full framework in{' '}
                <Link className="cosmic-link" href={LAW_OF_ATTRACTION_GUIDE_PATH}>
                  law of attraction for beginners
                </Link>
                .
              </p>
              <p>
                If you prefer symbolic systems, explore{' '}
                <Link className="cosmic-link" href={LUCKY_NUMBERS_GUIDE_PATH}>
                  lucky numbers by birthday
                </Link>
                .
              </p>
            </div>
          </article>
        </section>

        <section id="faq" className="space-y-4">
          <h2 className="text-3xl text-slate-50 sm:text-4xl">FAQ: How to Manifest Luck</h2>
          <div className="grid gap-4 md:grid-cols-2">
            {faq.map((item) => (
              <article key={item.question} className="cosmic-card rounded-2xl p-5">
                <h3 className="text-lg text-slate-50">{item.question}</h3>
                <p className="mt-2 text-slate-100/82">{item.answer}</p>
              </article>
            ))}
          </div>
        </section>

        <section className="luck-glow cosmic-cta rounded-[2rem] border border-cyan-200/26 p-8 sm:p-10">
          <h2 className="text-3xl text-slate-50 sm:text-4xl">
            Why subscribing to Trimry helps you invite more luck
          </h2>
          <p className="mt-3 max-w-3xl text-slate-100/84">
            Trimry keeps your luck practice consistent. Every week you receive a clear timing
            rhythm that helps you stay positive, act with intention, and keep your energy in a
            fortune-ready vibe instead of reacting to stress.
          </p>
          <p className="mt-3 max-w-3xl text-slate-100/84">
            Consistency builds confidence. Confidence drives better choices. Better choices often
            look like “luck” from the outside.
          </p>
          <div className="mt-7 flex flex-wrap items-center gap-3">
            <Link
              href="/account/register"
              className="cosmic-button-primary rounded-full px-7 py-3 text-sm font-black uppercase tracking-[0.15em]"
            >
              Create account and start your adventure
            </Link>
            <OpenLuckGuruChatButton
              label="Talk to Luck Guru"
              className="cosmic-button-secondary rounded-full px-7 py-3 text-sm font-black uppercase tracking-[0.15em] text-cyan-50 transition hover:bg-cyan-300/14"
            />
          </div>
        </section>
      </article>
    </>
  )
}
