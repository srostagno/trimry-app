import { createSocialImage } from '@/lib/social-image'

export const alt = 'Good and bad days to cut your hair, nails, and more with Trimry'
export const size = {
  width: 1200,
  height: 630,
}
export const contentType = 'image/png'

export default function OpenGraphImage() {
  return createSocialImage({
    eyebrow: 'Good and bad timing',
    title: 'Good and Bad Days to Cut Your Hair and Nails',
    subtitle:
      'One Monday Trimry forecast with Good, Bad, and Rare signals for haircuts, nail trimming, and more.',
  })
}
