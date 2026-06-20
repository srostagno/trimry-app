import type { MetadataRoute } from 'next'

import { BLOG_POSTS } from '@/lib/blog-posts'
import {
  BLOG_PATH,
  IS_INDEXING_ALLOWED,
  absoluteUrl,
} from '@/lib/seo'

export default function sitemap(): MetadataRoute.Sitemap {
  if (!IS_INDEXING_ALLOWED) {
    return []
  }

  const lastModified = new Date()
  const blogPostEntries = BLOG_POSTS.map((post) => ({
    url: absoluteUrl(post.path),
    lastModified,
    changeFrequency: 'weekly' as const,
    priority: 0.85,
  }))

  const staticEntries: MetadataRoute.Sitemap = [
    {
      url: absoluteUrl('/'),
      lastModified,
      changeFrequency: 'weekly',
      priority: 1,
    },
    {
      url: absoluteUrl(BLOG_PATH),
      lastModified,
      changeFrequency: 'weekly',
      priority: 0.95,
    },
    {
      url: absoluteUrl('/legal/terms'),
      lastModified,
      changeFrequency: 'monthly',
      priority: 0.2,
    },
    {
      url: absoluteUrl('/legal/privacy'),
      lastModified,
      changeFrequency: 'monthly',
      priority: 0.2,
    },
    {
      url: absoluteUrl('/legal/disclaimer'),
      lastModified,
      changeFrequency: 'monthly',
      priority: 0.2,
    },
    {
      url: absoluteUrl('/legal/data-deletion'),
      lastModified,
      changeFrequency: 'monthly',
      priority: 0.2,
    },
  ]

  const deduplicatedByUrl = new Map<string, (typeof staticEntries)[number]>()

  for (const entry of [...staticEntries, ...blogPostEntries]) {
    deduplicatedByUrl.set(entry.url, entry)
  }

  return Array.from(deduplicatedByUrl.values())
}
