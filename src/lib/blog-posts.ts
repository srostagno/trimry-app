import {
  GOOD_BAD_GUIDE_PATH,
  GOOD_LUCK_RITUALS_GUIDE_PATH,
  LAW_OF_ATTRACTION_GUIDE_PATH,
  LUCKY_NUMBERS_GUIDE_PATH,
  MANIFEST_LUCK_GUIDE_PATH,
  POSITIVE_AFFIRMATIONS_GUIDE_PATH,
} from '@/lib/seo'

export type BlogPostItem = {
  path: string
  title: string
  excerpt: string
  category: string
  readingTime: string
}

export const BLOG_POSTS: BlogPostItem[] = [
  {
    path: GOOD_BAD_GUIDE_PATH,
    title: 'Good & Bad Days to Cut Your Hair, Nails and More',
    excerpt:
      'A practical weekly timing guide to understand good, bad, and rare days for haircuts, nails, shaving, and symbolic release routines.',
    category: 'Timing',
    readingTime: '5 min read',
  },
  {
    path: MANIFEST_LUCK_GUIDE_PATH,
    title: 'How to Manifest Luck',
    excerpt:
      'A grounded method to manifest luck using intention, visualization, and aligned daily action.',
    category: 'Manifestation',
    readingTime: '6 min read',
  },
  {
    path: POSITIVE_AFFIRMATIONS_GUIDE_PATH,
    title: 'Positive Affirmations for Success and Luck',
    excerpt:
      'Daily affirmation scripts for confidence, money, focus, and positive momentum.',
    category: 'Mindset',
    readingTime: '6 min read',
  },
  {
    path: LAW_OF_ATTRACTION_GUIDE_PATH,
    title: 'Law of Attraction for Beginners',
    excerpt:
      'A beginner-friendly approach to law of attraction with practical habits for real life.',
    category: 'Manifestation',
    readingTime: '7 min read',
  },
  {
    path: LUCKY_NUMBERS_GUIDE_PATH,
    title: 'Lucky Numbers by Birthday',
    excerpt:
      'A simple numerology starter to calculate lucky numbers by date of birth and use them intentionally.',
    category: 'Numerology',
    readingTime: '6 min read',
  },
  {
    path: GOOD_LUCK_RITUALS_GUIDE_PATH,
    title: 'Good Luck Rituals for Positive Energy',
    excerpt:
      'Short daily and weekly rituals to strengthen positivity, focus, and opportunity-readiness.',
    category: 'Rituals',
    readingTime: '6 min read',
  },
]
