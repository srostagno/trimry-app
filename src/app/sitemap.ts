import type { MetadataRoute } from 'next'

import {
  BLOG_PATH,
  GOOD_BAD_GUIDE_PATH,
  GOOD_LUCK_RITUALS_GUIDE_PATH,
  IS_INDEXING_ALLOWED,
  LAW_OF_ATTRACTION_GUIDE_PATH,
  LUCKY_NUMBERS_GUIDE_PATH,
  MANIFEST_LUCK_GUIDE_PATH,
  POSITIVE_AFFIRMATIONS_GUIDE_PATH,
  absoluteUrl,
} from '@/lib/seo'

export default function sitemap(): MetadataRoute.Sitemap {
  if (!IS_INDEXING_ALLOWED) {
    return []
  }

  const lastModified = new Date()

  return [
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
      url: absoluteUrl(GOOD_BAD_GUIDE_PATH),
      lastModified,
      changeFrequency: 'weekly',
      priority: 0.9,
    },
    {
      url: absoluteUrl(MANIFEST_LUCK_GUIDE_PATH),
      lastModified,
      changeFrequency: 'weekly',
      priority: 0.85,
    },
    {
      url: absoluteUrl(POSITIVE_AFFIRMATIONS_GUIDE_PATH),
      lastModified,
      changeFrequency: 'weekly',
      priority: 0.85,
    },
    {
      url: absoluteUrl(LAW_OF_ATTRACTION_GUIDE_PATH),
      lastModified,
      changeFrequency: 'weekly',
      priority: 0.85,
    },
    {
      url: absoluteUrl(LUCKY_NUMBERS_GUIDE_PATH),
      lastModified,
      changeFrequency: 'weekly',
      priority: 0.85,
    },
    {
      url: absoluteUrl(GOOD_LUCK_RITUALS_GUIDE_PATH),
      lastModified,
      changeFrequency: 'weekly',
      priority: 0.85,
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
}
