import Link from 'next/link'

import { JsonLd } from '@/components/json-ld'
import { BLOG_POSTS } from '@/lib/blog-posts'
import { BLOG_PATH, SITE_NAME, SOCIAL_IMAGE_PATH, absoluteUrl, createPageMetadata } from '@/lib/seo'

const pageTitle = 'Blog - Luck, Manifestation and Positive Energy Guides'
const pageDescription =
  'Read Trimry blog posts about luck, manifestation, positive affirmations, lucky numbers, and weekly rituals designed for practical daily momentum.'

const pageUrl = absoluteUrl(BLOG_PATH)
const pageImageUrl = absoluteUrl(SOCIAL_IMAGE_PATH)

const blogJsonLd = [
  {
    '@context': 'https://schema.org',
    '@type': 'CollectionPage',
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
      '@id': `${pageUrl}#itemlist`,
    },
    breadcrumb: {
      '@id': `${pageUrl}#breadcrumb`,
    },
  },
  {
    '@context': 'https://schema.org',
    '@type': 'ItemList',
    '@id': `${pageUrl}#itemlist`,
    name: 'Trimry Blog Posts',
    itemListElement: BLOG_POSTS.map((post, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      item: {
        '@type': 'BlogPosting',
        headline: post.title,
        description: post.excerpt,
        url: absoluteUrl(post.path),
        inLanguage: 'en-US',
      },
    })),
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
        name: 'Blog',
        item: pageUrl,
      },
    ],
  },
]

export const metadata = createPageMetadata({
  title: pageTitle,
  description: pageDescription,
  path: BLOG_PATH,
  keywords: [
    'luck blog',
    'manifestation blog',
    'positive affirmations blog',
    'lucky numbers guide',
    'good luck rituals',
    'law of attraction for beginners',
  ],
})

export default function BlogPage() {
  return (
    <>
      <JsonLd data={blogJsonLd} />

      <article className="space-y-10">
        <header className="cosmic-panel rounded-[2rem] p-8 sm:p-10">
          <p className="text-xs font-bold uppercase tracking-[0.2em] text-cyan-100/75">Trimry Blog</p>
          <h1 className="mt-4 max-w-4xl text-4xl leading-tight text-slate-50 sm:text-5xl">
            Luck, Manifestation and Positive Energy Posts
          </h1>
          <p className="mt-4 max-w-3xl text-lg text-slate-100/84">
            Explore our practical guides on luck, mindset, manifestation, rituals, and symbolic
            timing. Each post is written to help you build daily momentum with clarity and
            intention.
          </p>
        </header>

        <section className="grid gap-5 md:grid-cols-2">
          {BLOG_POSTS.map((post) => (
            <article key={post.path} className="cosmic-card rounded-3xl p-6">
              <p className="text-xs font-bold uppercase tracking-[0.2em] text-cyan-100/75">
                {post.category} · {post.readingTime}
              </p>
              <h2 className="mt-3 text-2xl text-slate-50">{post.title}</h2>
              <p className="mt-3 text-slate-100/84">{post.excerpt}</p>
              <div className="mt-5">
                <Link
                  href={post.path}
                  className="cosmic-button-secondary inline-flex rounded-full px-5 py-2.5 text-xs font-black uppercase tracking-[0.15em] text-cyan-50 transition hover:bg-cyan-300/14"
                >
                  Read post
                </Link>
              </div>
            </article>
          ))}
        </section>
      </article>
    </>
  )
}
