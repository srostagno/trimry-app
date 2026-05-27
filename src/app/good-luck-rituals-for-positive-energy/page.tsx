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

const pageTitle = 'Good Luck Rituals for Positive Energy'
const pageDescription =
  'Discover good luck rituals for positive energy that are simple, repeatable, and practical. Build a weekly routine to stay optimistic, grounded, and opportunity-ready.'

const faq = [
  {
    question: 'What is a good luck ritual?',
    answer:
      'A good luck ritual is a repeatable action that helps you enter a focused, positive state before decisions and goals. The power comes from consistency and intention.',
  },
  {
    question: 'How often should I do luck rituals?',
    answer:
      'Daily micro-rituals and one weekly reset ritual work well for most people. Short and consistent is better than intense and occasional.',
  },
  {
    question: 'Are rituals religious?',
    answer:
      'They can be, but they do not have to be. Many people use secular rituals for mindset, focus, gratitude, and confidence.',
  },
  {
    question: 'Can rituals improve productivity?',
    answer:
      'Yes. Rituals reduce decision fatigue, improve emotional regulation, and help you begin important tasks with intention.',
  },
] as const

const pageUrl = absoluteUrl(GOOD_LUCK_RITUALS_GUIDE_PATH)
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
    headline: 'Good Luck Rituals for Positive Energy and Better Momentum',
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
      'good luck rituals',
      'luck rituals for positive energy',
      'daily luck habits',
      'manifest good luck',
      'positive mindset rituals',
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
  path: GOOD_LUCK_RITUALS_GUIDE_PATH,
  keywords: [
    'good luck rituals for positive energy',
    'daily good luck rituals',
    'rituals for luck and success',
    'positive energy habits',
    'weekly luck routine',
  ],
})

export default function GoodLuckRitualsGuidePage() {
  return (
    <>
      <JsonLd data={seoGuideJsonLd} />

      <article className="space-y-10">
        <header className="cosmic-panel rounded-[2rem] p-8 sm:p-10">
          <p className="text-xs font-bold uppercase tracking-[0.2em] text-cyan-100/75">
            Positive Energy Routine
          </p>
          <h1 className="mt-4 max-w-4xl text-4xl leading-tight text-slate-50 sm:text-5xl">
            Good Luck Rituals for Positive Energy
          </h1>
          <p className="mt-4 max-w-3xl text-lg text-slate-100/84">
            Good luck rituals are not about waiting for magic. They are about entering a stronger
            mental state so you can make better decisions, take clearer action, and stay consistent
            when life gets noisy.
          </p>
        </header>

        <section className="grid gap-6 md:grid-cols-3">
          <article className="cosmic-card rounded-3xl p-6">
            <h2 className="text-2xl text-slate-50">Morning reset ritual</h2>
            <p className="mt-3 text-slate-100/84">
              One deep breath cycle, one intention sentence, and one priority task before checking
              social media.
            </p>
          </article>
          <article className="cosmic-card rounded-3xl p-6">
            <h2 className="text-2xl text-slate-50">Midday confidence ritual</h2>
            <p className="mt-3 text-slate-100/84">
              Repeat one affirmation, stretch for two minutes, and send the message or email you
              have been postponing.
            </p>
          </article>
          <article className="cosmic-card rounded-3xl p-6">
            <h2 className="text-2xl text-slate-50">Evening release ritual</h2>
            <p className="mt-3 text-slate-100/84">
              List wins, let go of one regret, and choose tomorrow’s first action to keep momentum
              alive.
            </p>
          </article>
        </section>

        <section className="cosmic-card rounded-3xl p-7 sm:p-8">
          <h2 className="text-3xl text-slate-50">7-day luck ritual framework</h2>
          <ol className="mt-4 list-decimal space-y-2 pl-5 text-slate-100/88">
            <li>Set one weekly intention on Monday.</li>
            <li>Track one behavior that supports that intention.</li>
            <li>Use daily affirmations to keep your emotional state stable.</li>
            <li>Review progress every evening in 3 bullet points.</li>
            <li>End the week with gratitude and one lesson learned.</li>
          </ol>
        </section>

        <section className="grid gap-6 md:grid-cols-2">
          <article className="cosmic-card rounded-3xl p-6">
            <h2 className="text-3xl text-slate-50">Why these rituals feel “lucky”</h2>
            <p className="mt-3 text-slate-100/84">
              Rituals help you notice opportunities faster, respond with less fear, and stay
              emotionally steady under pressure. Over time, that can look like better luck from the
              outside.
            </p>
          </article>

          <article className="cosmic-card rounded-3xl p-6">
            <h2 className="text-3xl text-slate-50">Related guides for a complete system</h2>
            <p className="mt-3 text-slate-100/84">
              Combine this page with{' '}
              <Link className="cosmic-link" href={MANIFEST_LUCK_GUIDE_PATH}>
                how to manifest luck
              </Link>
              ,{' '}
              <Link className="cosmic-link" href={POSITIVE_AFFIRMATIONS_GUIDE_PATH}>
                positive affirmations
              </Link>
              , and{' '}
              <Link className="cosmic-link" href={LAW_OF_ATTRACTION_GUIDE_PATH}>
                law of attraction for beginners
              </Link>{' '}
              to build a full weekly practice.
            </p>
          </article>
        </section>

        <section id="faq" className="space-y-4">
          <h2 className="text-3xl text-slate-50 sm:text-4xl">FAQ: Good Luck Rituals</h2>
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
            Why Trimry subscription helps you stay in the fortune vibe
          </h2>
          <p className="mt-3 max-w-3xl text-slate-100/84">
            Trimry gives your rituals a weekly anchor so positivity becomes a lifestyle, not a
            random mood. That rhythm helps you feel aligned, hopeful, and emotionally ready for new
            opportunities.
          </p>
          <p className="mt-3 max-w-3xl text-slate-100/84">
            When you stay in that state, your actions improve. Better actions tend to attract better
            outcomes, and that is how sustainable luck is built.
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
