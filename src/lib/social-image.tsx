import { ImageResponse } from 'next/server'

import { SITE_NAME } from '@/lib/seo'

export const socialImageSize = {
  width: 1200,
  height: 630,
}

type SocialImageOptions = {
  eyebrow: string
  title: string
  subtitle: string
}

export function createSocialImage({ eyebrow, title, subtitle }: SocialImageOptions) {
  return new ImageResponse(
    (
      <div
        style={{
          display: 'flex',
          width: '100%',
          height: '100%',
          padding: '56px',
          position: 'relative',
          background:
            'radial-gradient(circle at 18% 20%, rgba(90,243,220,0.24), transparent 28%), radial-gradient(circle at 84% 12%, rgba(117,173,255,0.3), transparent 34%), linear-gradient(120deg, #06111d 0%, #08162a 44%, #12284c 100%)',
          color: '#eff7ff',
          fontFamily:
            'ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
          overflow: 'hidden',
        }}
      >
        <div
          style={{
            position: 'absolute',
            inset: '28px',
            borderRadius: '34px',
            border: '1px solid rgba(151, 235, 255, 0.22)',
            boxShadow: '0 0 0 1px rgba(151, 235, 255, 0.05) inset',
          }}
        />
        <div
          style={{
            position: 'absolute',
            right: '-80px',
            top: '-70px',
            width: '360px',
            height: '360px',
            borderRadius: '9999px',
            border: '1px solid rgba(255, 255, 255, 0.2)',
          }}
        />
        <div
          style={{
            position: 'absolute',
            right: '-20px',
            top: '20px',
            width: '250px',
            height: '250px',
            borderRadius: '9999px',
            border: '1px solid rgba(151, 235, 255, 0.15)',
          }}
        />
        <div
          style={{
            position: 'absolute',
            left: '72px',
            bottom: '72px',
            width: '220px',
            height: '220px',
            borderRadius: '9999px',
            background: 'radial-gradient(circle, rgba(96,223,255,0.18), transparent 68%)',
            filter: 'blur(4px)',
          }}
        />
        <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
          <div
            style={{
              display: 'flex',
              padding: '12px 20px',
              borderRadius: '9999px',
              border: '1px solid rgba(151, 235, 255, 0.3)',
              background: 'rgba(79, 133, 184, 0.26)',
              color: '#cbeeff',
              fontSize: 22,
              fontWeight: 700,
              letterSpacing: '0.32em',
              textTransform: 'uppercase',
            }}
          >
            {eyebrow}
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', maxWidth: '760px' }}>
            <div
              style={{
                display: 'flex',
                fontSize: 88,
                lineHeight: 0.96,
                fontWeight: 700,
                letterSpacing: '-0.05em',
                marginTop: '34px',
              }}
            >
              {title}
            </div>
            <div
              style={{
                display: 'flex',
                fontSize: 30,
                lineHeight: 1.35,
                color: 'rgba(239, 247, 255, 0.84)',
                marginTop: '30px',
              }}
            >
              {subtitle}
            </div>
          </div>

          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '14px',
              color: '#b5f7f0',
              fontSize: 28,
              fontWeight: 700,
              letterSpacing: '0.16em',
              textTransform: 'uppercase',
            }}
          >
            <span
              style={{
                display: 'flex',
                width: '16px',
                height: '16px',
                borderRadius: '9999px',
                background: '#5af3dc',
                boxShadow: '0 0 28px rgba(90, 243, 220, 0.8)',
              }}
            />
            {SITE_NAME}
          </div>
        </div>
      </div>
    ),
    socialImageSize,
  )
}
