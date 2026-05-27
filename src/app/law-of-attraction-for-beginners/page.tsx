import Link from 'next/link'

import { JsonLd } from '@/components/json-ld'
import { OpenLuckGuruChatButton } from '@/components/open-luck-guru-chat-button'
import {
  GOOD_LUCK_RITUALS_GUIDE_PATH,
  LAW_OF_ATTRACTION_GUIDE_PATH,
  MANIFEST_LUCK_GUIDE_PATH,
  POSITIVE_AFFIRMATIONS_GUIDE_PATH,
  SITE_NAME,
  SOCIAL_IMAGE_PATH,
  absoluteUrl,
  createPageMetadata,
} from '@/lib/seo'

const pageTitle = 'Law of Attraction for Beginners - Simple Practical Guide'
const pageDescription =
  'Understand the law of attraction in practical terms: thoughts, emotional state, and aligned action. A beginner guide for US readers who want grounded daily habits.'

const faq = [
  {
    question: 'What is the law of attraction in simple words?',
    answer:
      'It is the idea that your focus and emotional patterns influence your actions and results. In practice, it means choosing thoughts and behaviors that match your goals.',
  },
  {
    question: 'Is law of attraction only about positive thinking?',
    answer:
      'No. Positive thinking helps, but action is essential. The best results come from optimism paired with decisions, discipline, and consistent effort.',
  },
  {
    question: 'How can beginners start today?',
    answer:
      'Start with one clear goal, one daily affirmation, one short visualization, and one concrete action every day for 30 days.',
  },
  {
    question: 'Can this help with stress and confidence?',
    answer:
      'Many people report better focus and confidence when they follow a structured mindset routine. It can reduce mental noise and improve decision quality.',
  },
] as const

const pageUrl = absoluteUrl(LAW_OF_ATTRACTION_GUIDE_PATH)
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
    headline: 'Law of Attraction for Beginners: How to Use It in Real Life',
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
      'law of attraction for beginners',
      'law of attraction techniques',
      'how law of attraction works',
      'manifestation beginner guide',
      'attract luck and abundance',
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
  path: LAW_OF_ATTRACTION_GUIDE_PATH,
  keywords: [
    'law of attraction for beginners',
    'how to use law of attraction',
    'law of attraction techniques for daily life',
    'beginner manifestation routine',
    'attract success and luck mindset',
  ],
})

export default function LawOfAttractionGuidePage() {
  return (
    <>
      <JsonLd data={seoGuideJsonLd} />

      <article className="space-y-10">
        <header className="cosmic-panel rounded-[2rem] p-8 sm:p-10">
          <p className="text-xs font-bold uppercase tracking-[0.2em] text-cyan-100/75">
            Beginner Guide
          </p>
          <h1 className="mt-4 max-w-4xl text-4xl leading-tight text-slate-50 sm:text-5xl">
            Law of Attraction for Beginners
          </h1>
          <p className="mt-4 max-w-3xl text-lg text-slate-100/84">
            The law of attraction is often explained in mystical language, but beginners get better
            results when they use a practical model: focus your thoughts, regulate your emotional
            state, and take aligned action repeatedly.
          </p>
        </header>

        <section className="grid gap-6 md:grid-cols-3">
          <article className="cosmic-card rounded-3xl p-6">
            <h2 className="text-2xl text-slate-50">Focus</h2>
            <p className="mt-3 text-slate-100/84">
              Your attention decides what your brain notices. Clear focus helps you spot options
              and openings.
            </p>
          </article>
          <article className="cosmic-card rounded-3xl p-6">
            <h2 className="text-2xl text-slate-50">Emotion</h2>
            <p className="mt-3 text-slate-100/84">
              Your emotional baseline affects confidence, communication, and persistence under
              pressure.
            </p>
          </article>
          <article className="cosmic-card rounded-3xl p-6">
            <h2 className="text-2xl text-slate-50">Action</h2>
            <p className="mt-3 text-slate-100/84">
              Action converts intention into outcomes. Without action, attraction has no channel.
            </p>
          </article>
        </section>

        <section className="cosmic-card rounded-3xl p-7 sm:p-8">
          <h2 className="text-3xl text-slate-50">30-day law of attraction starter plan</h2>
          <ol className="mt-4 list-decimal space-y-2 pl-5 text-slate-100/88">
            <li>Pick one measurable goal.</li>
            <li>Write a one-sentence identity statement in present tense.</li>
            <li>Visualize success for 2 minutes each morning.</li>
            <li>Take one uncomfortable but meaningful action daily.</li>
            <li>Log proof every night: progress, signals, and lessons.</li>
          </ol>
        </section>

        <section className="grid gap-6 md:grid-cols-2">
          <article className="cosmic-card rounded-3xl p-6">
            <h2 className="text-3xl text-slate-50">What beginners should avoid</h2>
            <ul className="mt-4 list-disc space-y-2 pl-5 text-slate-100/86">
              <li>Thinking “high vibes” means ignoring real problems.</li>
              <li>Using too many techniques at once.</li>
              <li>Confusing comfort with alignment.</li>
              <li>Expecting instant outcomes without consistency.</li>
            </ul>
          </article>

          <article className="cosmic-card rounded-3xl p-6">
            <h2 className="text-3xl text-slate-50">Build your full beginner stack</h2>
            <p className="mt-3 text-slate-100/84">
              Add{' '}
              <Link className="cosmic-link" href={POSITIVE_AFFIRMATIONS_GUIDE_PATH}>
                positive affirmations for success and luck
              </Link>{' '}
              and{' '}
              <Link className="cosmic-link" href={MANIFEST_LUCK_GUIDE_PATH}>
                how to manifest luck
              </Link>{' '}
              for mindset. Then layer in{' '}
              <Link className="cosmic-link" href={GOOD_LUCK_RITUALS_GUIDE_PATH}>
                good luck rituals
              </Link>{' '}
              for weekly structure.
            </p>
          </article>
        </section>

        <section id="faq" className="space-y-4">
          <h2 className="text-3xl text-slate-50 sm:text-4xl">FAQ: Law of Attraction for Beginners</h2>
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
            Why Trimry helps beginners stay in a lucky frequency
          </h2>
          <p className="mt-3 max-w-3xl text-slate-100/84">
            Beginners often lose momentum because routines feel vague. Trimry solves that with a
            weekly signal that keeps you positive, focused, and emotionally connected to your goals.
          </p>
          <p className="mt-3 max-w-3xl text-slate-100/84">
            That rhythm helps you feel in the vibe of fortune: calm, intentional, and ready to move
            when the right moment appears.
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
