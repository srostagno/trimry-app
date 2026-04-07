import { createSocialImage } from '@/lib/social-image'

export const alt = 'Good and bad days to cut your hair, nails, and more with Trimry'
export const size = {
  width: 1200,
  height: 630,
}
export const contentType = 'image/png'

export default function TwitterImage() {
  return createSocialImage({
    eyebrow: 'Weekly timing guide',
    title: 'Good and Bad Days to Cut Your Hair, Nails and More',
    subtitle:
      'Trimry sends one Monday forecast with Good, Bad, and Rare timing signals by email or WhatsApp.',
  })
}
