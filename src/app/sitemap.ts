import type { MetadataRoute } from 'next'

import { IS_INDEXING_ALLOWED, absoluteUrl } from '@/lib/seo'

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
