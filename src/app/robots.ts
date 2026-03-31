import type { MetadataRoute } from 'next'

import { IS_INDEXING_ALLOWED, SITE_URL, absoluteUrl } from '@/lib/seo'

export default function robots(): MetadataRoute.Robots {
  if (!IS_INDEXING_ALLOWED) {
    return {
      rules: [
        {
          userAgent: '*',
          disallow: ['/'],
        },
      ],
      sitemap: absoluteUrl('/sitemap.xml'),
      host: SITE_URL,
    }
  }

  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        disallow: ['/api/', '/account', '/activate', '/checkout', '/dashboard', '/trivia', '/user'],
      },
    ],
    sitemap: absoluteUrl('/sitemap.xml'),
    host: SITE_URL,
  }
}
