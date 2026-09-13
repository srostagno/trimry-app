import { JsonLd } from '@/components/json-ld'
import { HomePageClient } from '@/components/home-page-client'
import { createPageMetadata, homePageJsonLd } from '@/lib/seo'

export const metadata = createPageMetadata({
  title: 'Personalized sports events alerts',
  description:
    'Pick the sports, leagues and teams you follow and get a personal agenda of upcoming matches, races and fights by email and WhatsApp, in your time zone.',
  keywords: [
    'sports agenda',
    'match notifications',
    'game reminders',
    'premier league fixtures alerts',
    'champions league schedule',
    'nba nfl mlb nhl schedule alerts',
  ],
  path: '/',
})

export default function HomePage() {
  return (
    <>
      <JsonLd data={homePageJsonLd} />
      <HomePageClient />
    </>
  )
}
