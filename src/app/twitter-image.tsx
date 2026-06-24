import { createSocialImage } from '@/lib/social-image'

export const alt = 'Trimry, Your Luck Guide with daily fortune projections'
export const size = {
  width: 1200,
  height: 630,
}
export const contentType = 'image/png'

export default function TwitterImage() {
  return createSocialImage({
    eyebrow: 'Your Luck Guide',
    title: 'Trimry Daily Fortune Signals',
    subtitle:
      'A weekly luck calendar with Good, Bad, and Rare signals. Email and WhatsApp reminders are optional.',
  })
}
