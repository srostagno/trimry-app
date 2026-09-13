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
          padding: '64px',
          position: 'relative',
          background:
            'radial-gradient(circle at 10% 10%, rgba(53,210,229,0.28), transparent 32%), radial-gradient(circle at 90% 8%, rgba(43,47,184,0.22), transparent 34%), radial-gradient(circle at 70% 95%, rgba(47,197,108,0.24), transparent 30%), linear-gradient(160deg, #ffffff 0%, #f5f8fc 60%, #eef4ff 100%)',
          color: '#0b1220',
          fontFamily:
            'ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
          overflow: 'hidden',
        }}
      >
        <div
          style={{
            position: 'absolute',
            right: '-120px',
            top: '-120px',
            width: '520px',
            height: '520px',
            borderRadius: '9999px',
            background:
              'linear-gradient(135deg,#2b2fb8 0%,#2f7bff 38%,#35d2e5 72%,#2fc56c 100%)',
            opacity: 0.14,
          }}
        />
        <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between', width: '100%' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '18px' }}>
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                width: '72px',
                height: '72px',
                borderRadius: '22px',
                background:
                  'linear-gradient(135deg,#2b2fb8 0%,#2f7bff 38%,#35d2e5 72%,#2fc56c 100%)',
                color: '#ffffff',
                fontSize: 48,
                fontWeight: 800,
                lineHeight: 1,
              }}
            >
              t
            </div>
            <div style={{ display: 'flex', fontSize: 40, fontWeight: 800, letterSpacing: '-0.03em' }}>
              {SITE_NAME.toLowerCase()}
            </div>
            <div
              style={{
                display: 'flex',
                marginLeft: '18px',
                padding: '10px 18px',
                borderRadius: '9999px',
                border: '1px solid rgba(47,123,255,0.3)',
                background: 'rgba(47,123,255,0.08)',
                color: '#2f7bff',
                fontSize: 20,
                fontWeight: 700,
                letterSpacing: '0.24em',
                textTransform: 'uppercase',
              }}
            >
              {eyebrow}
            </div>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', maxWidth: '860px' }}>
            <div
              style={{
                display: 'flex',
                fontSize: 84,
                lineHeight: 0.98,
                fontWeight: 800,
                letterSpacing: '-0.04em',
              }}
            >
              {title}
            </div>
            <div
              style={{
                display: 'flex',
                fontSize: 30,
                lineHeight: 1.35,
                color: '#475569',
                marginTop: '28px',
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
              color: '#0b1220',
              fontSize: 24,
              fontWeight: 700,
            }}
          >
            <span>⚽</span>
            <span>🏀</span>
            <span>🏈</span>
            <span>🏎️</span>
            <span>🥊</span>
            <span style={{ marginLeft: '12px', color: '#64748b', fontWeight: 600 }}>
              Email · WhatsApp · Scout assistant
            </span>
          </div>
        </div>
      </div>
    ),
    socialImageSize,
  )
}
