import { createSocialImage } from '@/lib/social-image'

export const alt = 'Trimry weekly ritual timing and fortune guidance'
export const size = {
  width: 1200,
  height: 630,
}
export const contentType = 'image/png'

export default function TwitterImage() {
  return createSocialImage({
    eyebrow: 'Weekly fortune delivery',
    title: 'Timing can change the feeling of a fresh start.',
    subtitle:
      'Trimry sends one Monday ritual forecast with haircut, release, luck, love, and momentum signals.',
  })
}
