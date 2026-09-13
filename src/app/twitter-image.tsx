import { createSocialImage } from '@/lib/social-image'

export const alt = 'Trimry, your sports events radar by email and WhatsApp'
export const size = {
  width: 1200,
  height: 630,
}
export const contentType = 'image/png'

export default function TwitterImage() {
  return createSocialImage({
    eyebrow: 'Sports events radar',
    title: 'Never miss a game again',
    subtitle:
      'Follow your sports, leagues and teams. Get a personal agenda of upcoming matches, races and fights by email and WhatsApp.',
  })
}
