import Link from 'next/link'

import { JsonLd } from '@/components/json-ld'
import { OpenLuckGuruChatButton } from '@/components/open-luck-guru-chat-button'
import {
  LUCKY_NUMBERS_GUIDE_PATH,
  MANIFEST_LUCK_GUIDE_PATH,
  POSITIVE_AFFIRMATIONS_GUIDE_PATH,
  SITE_NAME,
  SOCIAL_IMAGE_PATH,
  absoluteUrl,
  createPageMetadata,
} from '@/lib/seo'

const pageTitle = 'Lucky Numbers by Birthday - Beginner Numerology Guide'
const pageDescription =
  'Find your lucky numbers by birthday with a simple numerology method. Learn how people in the US use lucky numbers as symbolic anchors for focus and positive intention.'

const faq = [
  {
    question: 'How do I calculate my lucky number by birthday?',
    answer:
      'Add all digits of your full birthdate until you reach a single digit, unless the result is 11, 22, or 33. Those are considered master numbers in numerology.',
  },
  {
    question: 'What if I get 11, 22, or 33?',
    answer:
      'Keep them as they are. In many numerology systems, these numbers carry amplified themes and are not reduced further.',
  },
  {
    question: 'Can lucky numbers predict exact outcomes?',
    answer:
      'Lucky numbers are symbolic tools, not guaranteed prediction systems. They are most useful for reflection, intention, and focus.',
  },
  {
    question: 'How can I use lucky numbers in daily life?',
    answer:
      'Use them as reminders in journaling, planning, and rituals. The value is in consistent positive meaning, not superstition alone.',
  },
] as const

const pageUrl = absoluteUrl(LUCKY_NUMBERS_GUIDE_PATH)
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
    headline: 'Lucky Numbers by Birthday: How to Calculate and Use Them',
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
      'lucky numbers by birthday',
      'lucky number calculator',
      'numerology lucky numbers',
      'lucky number by date of birth',
      'birthday numerology',
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
  path: LUCKY_NUMBERS_GUIDE_PATH,
  keywords: [
    'lucky numbers by birthday',
    'lucky number by date of birth',
    'numerology calculator lucky number',
    'birthday lucky number meaning',
    'how to find lucky number',
  ],
})

export default function LuckyNumbersGuidePage() {
  return (
    <>
      <JsonLd data={seoGuideJsonLd} />

      <article className="space-y-10">
        <header className="cosmic-panel rounded-[2rem] p-8 sm:p-10">
          <p className="text-xs font-bold uppercase tracking-[0.2em] text-cyan-100/75">
            Numerology Starter
          </p>
          <h1 className="mt-4 max-w-4xl text-4xl leading-tight text-slate-50 sm:text-5xl">
            Lucky Numbers by Birthday
          </h1>
          <p className="mt-4 max-w-3xl text-lg text-slate-100/84">
            Many people in the US use lucky numbers as symbolic anchors for intention and
            confidence. This page shows the beginner method to calculate your number from your birth
            date and use it in practical routines.
          </p>
        </header>

        <section className="cosmic-card rounded-3xl p-7 sm:p-8">
          <h2 className="text-3xl text-slate-50">How to calculate your lucky number</h2>
          <p className="mt-3 text-slate-100/84">
            Write your birthdate in numeric form and add each digit.
          </p>
          <ol className="mt-4 list-decimal space-y-2 pl-5 text-slate-100/88">
            <li>Example: July 28, 1994 = 07/28/1994.</li>
            <li>Add digits: 0+7+2+8+1+9+9+4 = 40.</li>
            <li>Reduce again: 4+0 = 4.</li>
            <li>Your core lucky number is 4.</li>
          </ol>
          <p className="mt-4 text-sm text-slate-100/74">
            Note: if your sum is 11, 22, or 33, keep it as a master number.
          </p>
        </section>

        <section className="grid gap-6 md:grid-cols-3">
          <article className="cosmic-card rounded-3xl p-6">
            <h2 className="text-2xl text-slate-50">1</h2>
            <p className="mt-3 text-slate-100/84">
              Leadership, initiative, courage, and bold new starts.
            </p>
          </article>
          <article className="cosmic-card rounded-3xl p-6">
            <h2 className="text-2xl text-slate-50">4</h2>
            <p className="mt-3 text-slate-100/84">
              Structure, discipline, consistency, and stable progress.
            </p>
          </article>
          <article className="cosmic-card rounded-3xl p-6">
            <h2 className="text-2xl text-slate-50">8</h2>
            <p className="mt-3 text-slate-100/84">
              Ambition, material growth, leadership, and execution.
            </p>
          </article>
        </section>

        <section className="grid gap-6 md:grid-cols-2">
          <article className="cosmic-card rounded-3xl p-6">
            <h2 className="text-3xl text-slate-50">How to apply lucky numbers</h2>
            <ul className="mt-4 list-disc space-y-2 pl-5 text-slate-100/86">
              <li>Use your number in journal prompts and reflection dates.</li>
              <li>Pair it with weekly goals and habit tracking.</li>
              <li>Use it as a cue for confidence before decisions.</li>
              <li>Anchor it to a positive affirmation you repeat daily.</li>
            </ul>
          </article>

          <article className="cosmic-card rounded-3xl p-6">
            <h2 className="text-3xl text-slate-50">Pair numerology with mindset work</h2>
            <p className="mt-3 text-slate-100/84">
              Lucky numbers work best when combined with strong mental habits. Use{' '}
              <Link className="cosmic-link" href={POSITIVE_AFFIRMATIONS_GUIDE_PATH}>
                positive affirmations
              </Link>{' '}
              and{' '}
              <Link className="cosmic-link" href={MANIFEST_LUCK_GUIDE_PATH}>
                manifest luck routines
              </Link>{' '}
              to turn symbolic meaning into daily momentum.
            </p>
          </article>
        </section>

        <section id="faq" className="space-y-4">
          <h2 className="text-3xl text-slate-50 sm:text-4xl">FAQ: Lucky Numbers by Birthday</h2>
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
            Why Trimry helps turn lucky symbols into real momentum
          </h2>
          <p className="mt-3 max-w-3xl text-slate-100/84">
            A symbol is powerful when it is repeated with intention. Trimry gives you a weekly
            rhythm that keeps you positive, grounded, and emotionally aligned with progress.
          </p>
          <p className="mt-3 max-w-3xl text-slate-100/84">
            That regular practice helps you feel in the vibration of fortune, so your decisions are
            calmer, clearer, and more consistent.
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
