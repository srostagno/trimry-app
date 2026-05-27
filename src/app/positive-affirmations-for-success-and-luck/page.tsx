import Link from 'next/link'

import { JsonLd } from '@/components/json-ld'
import { OpenLuckGuruChatButton } from '@/components/open-luck-guru-chat-button'
import {
  LAW_OF_ATTRACTION_GUIDE_PATH,
  MANIFEST_LUCK_GUIDE_PATH,
  POSITIVE_AFFIRMATIONS_GUIDE_PATH,
  SITE_NAME,
  SOCIAL_IMAGE_PATH,
  absoluteUrl,
  createPageMetadata,
} from '@/lib/seo'

const pageTitle = 'Positive Affirmations for Success and Luck'
const pageDescription =
  'Use positive affirmations for success and luck with practical scripts for mornings, work, money, and confidence. Written for US readers who want daily momentum.'

const faq = [
  {
    question: 'Do positive affirmations actually work?',
    answer:
      'Affirmations can support performance by changing self-talk, emotional state, and focus. They work best when combined with specific actions.',
  },
  {
    question: 'How many affirmations should I use daily?',
    answer:
      'Three to five strong affirmations are usually enough. Repetition with meaning is better than long lists with no focus.',
  },
  {
    question: 'When is the best time to say affirmations?',
    answer:
      'Morning is ideal for setting tone, and evening is useful for reinforcing identity and confidence before sleep.',
  },
  {
    question: 'Should affirmations be in present tense?',
    answer:
      'Yes. Present-tense language helps your mind treat the statement as an active identity rather than a distant wish.',
  },
] as const

const pageUrl = absoluteUrl(POSITIVE_AFFIRMATIONS_GUIDE_PATH)
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
    headline: 'Positive Affirmations for Success and Luck You Can Use Daily',
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
      'positive affirmations',
      'affirmations for success',
      'affirmations for luck',
      'morning affirmations',
      'affirmations for abundance',
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
  path: POSITIVE_AFFIRMATIONS_GUIDE_PATH,
  keywords: [
    'positive affirmations for success and luck',
    'daily positive affirmations',
    'morning affirmations for confidence',
    'affirmations for money and abundance',
    'best affirmations for luck',
  ],
})

const affirmationGroups = [
  {
    title: 'Career and success affirmations',
    items: [
      'I attract opportunities that match my skills and ambition.',
      'I make clear decisions and follow through with confidence.',
      'My effort creates momentum, and momentum creates results.',
    ],
  },
  {
    title: 'Money and abundance affirmations',
    items: [
      'I am open to smart, ethical ways to increase my income.',
      'I manage money with clarity, discipline, and gratitude.',
      'I notice and act on opportunities that improve my financial life.',
    ],
  },
  {
    title: 'Confidence and luck affirmations',
    items: [
      'I carry positive energy and attract supportive people.',
      'I trust myself to take action even when outcomes are uncertain.',
      'I move through today with calm focus and lucky timing.',
    ],
  },
] as const

export default function PositiveAffirmationsGuidePage() {
  return (
    <>
      <JsonLd data={seoGuideJsonLd} />

      <article className="space-y-10">
        <header className="cosmic-panel rounded-[2rem] p-8 sm:p-10">
          <p className="text-xs font-bold uppercase tracking-[0.2em] text-cyan-100/75">
            Daily Mindset Script
          </p>
          <h1 className="mt-4 max-w-4xl text-4xl leading-tight text-slate-50 sm:text-5xl">
            Positive Affirmations for Success and Luck
          </h1>
          <p className="mt-4 max-w-3xl text-lg text-slate-100/84">
            Positive affirmations are short statements that train your attention and emotional
            state. Used daily, they can help you feel more resilient, optimistic, and ready to
            recognize good opportunities.
          </p>
        </header>

        <section className="cosmic-card rounded-3xl p-7 sm:p-8">
          <h2 className="text-3xl text-slate-50">How to use affirmations effectively</h2>
          <ol className="mt-4 list-decimal space-y-2 pl-5 text-slate-100/88">
            <li>Pick one focus area for this week.</li>
            <li>Repeat three affirmations in the morning and at night.</li>
            <li>Speak slowly and with emotional intent.</li>
            <li>Attach each affirmation to one real-world action.</li>
            <li>Track progress so your brain can see evidence.</li>
          </ol>
        </section>

        <section className="space-y-6">
          {affirmationGroups.map((group) => (
            <article key={group.title} className="cosmic-card rounded-3xl p-6">
              <h2 className="text-2xl text-slate-50">{group.title}</h2>
              <ul className="mt-4 list-disc space-y-2 pl-5 text-slate-100/86">
                {group.items.map((item) => (
                  <li key={item}>{item}</li>
                ))}
              </ul>
            </article>
          ))}
        </section>

        <section className="grid gap-6 md:grid-cols-2">
          <article className="cosmic-card rounded-3xl p-6">
            <h2 className="text-3xl text-slate-50">Sample 3-minute morning ritual</h2>
            <p className="mt-3 text-slate-100/84">
              Read your affirmations out loud, then ask: “What is one brave action I can take
              today?” Do that action before noon. This keeps affirmations grounded in behavior.
            </p>
          </article>

          <article className="cosmic-card rounded-3xl p-6">
            <h2 className="text-3xl text-slate-50">Build your full luck system</h2>
            <p className="mt-3 text-slate-100/84">
              Combine this with{' '}
              <Link className="cosmic-link" href={MANIFEST_LUCK_GUIDE_PATH}>
                how to manifest luck
              </Link>{' '}
              and{' '}
              <Link className="cosmic-link" href={LAW_OF_ATTRACTION_GUIDE_PATH}>
                law of attraction for beginners
              </Link>{' '}
              to turn mindset into a complete weekly practice.
            </p>
          </article>
        </section>

        <section id="faq" className="space-y-4">
          <h2 className="text-3xl text-slate-50 sm:text-4xl">FAQ: Positive Affirmations</h2>
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
            Why Trimry subscription amplifies your positive luck vibe
          </h2>
          <p className="mt-3 max-w-3xl text-slate-100/84">
            Subscribing to Trimry gives your positivity a structure. Instead of relying on random
            motivation, you follow a weekly rhythm that keeps your mindset bright, intentional, and
            aligned with fortune-focused actions.
          </p>
          <p className="mt-3 max-w-3xl text-slate-100/84">
            The result is a stronger sense of direction and the feeling that you are in sync with
            opportunity, not chasing it.
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
