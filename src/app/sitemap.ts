import type { MetadataRoute } from 'next'

import { absoluteUrl } from '@/lib/seo'

export default function sitemap(): MetadataRoute.Sitemap {
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
  ]
}
