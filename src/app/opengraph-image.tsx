import { createSocialImage } from '@/lib/social-image'

export const alt = 'Trimry weekly ritual timing and fortune guidance'
export const size = {
  width: 1200,
  height: 630,
}
export const contentType = 'image/png'

export default function OpenGraphImage() {
  return createSocialImage({
    eyebrow: 'Weekly ritual timing',
    title: 'Catch the lucky days before your next cut.',
    subtitle:
      'One weekly Trimry forecast with lucky, challenging, and rare day signals by email, WhatsApp, or both.',
  })
}
