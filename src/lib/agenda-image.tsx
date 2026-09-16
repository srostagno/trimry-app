import { ImageResponse } from 'next/server'

// Shareable agenda card. Portrait 4:5 so it fills a phone screen in WhatsApp
// and fits Stories without cropping.
export const agendaImageSize = {
  width: 1080,
  height: 1350,
}

const BRAND_GRADIENT = 'linear-gradient(135deg,#2b2fb8 0%,#2f7bff 38%,#35d2e5 72%,#2fc56c 100%)'

// ImageResponse substitutes emoji with Twemoji images, so the sport shows its
// own icon. The colour is kept as the tint behind it, which keeps the rows
// readable at a glance and still marks the sport if an icon fails to load.
const SPORT_COLORS: Record<string, string> = {
  soccer: '#2fc56c',
  basketball: '#f97316',
  american_football: '#8b5cf6',
  baseball: '#0ea5e9',
  ice_hockey: '#64748b',
  tennis: '#eab308',
  motorsport: '#ef4444',
  fighting: '#dc2626',
  rugby: '#14b8a6',
  golf: '#22c55e',
  cycling: '#f59e0b',
  cricket: '#6366f1',
}

export type AgendaImageEvent = {
  time: string | null
  title: string
  league: string | null
  sport: string | null
  emoji: string | null
}

export type AgendaImageDay = {
  label: string
  events: AgendaImageEvent[]
}

export type AgendaImageInput = {
  heading: string
  subheading: string
  footer: string
  days: AgendaImageDay[]
  moreLabel: string | null
}

export function createAgendaImage(input: AgendaImageInput) {
  return new ImageResponse(
    (
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          width: '100%',
          height: '100%',
          background: 'linear-gradient(170deg,#ffffff 0%,#f6f9fd 58%,#eef4ff 100%)',
          color: '#0b1220',
          fontFamily: 'ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
        }}
      >
        {/* Brand header: the logo is the point of sharing this */}
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            flexShrink: 0,
            padding: '52px 64px 40px 64px',
            background: BRAND_GRADIENT,
            color: '#ffffff',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                width: '84px',
                height: '84px',
                borderRadius: '24px',
                background: '#ffffff',
                color: '#2f7bff',
                fontSize: 56,
                fontWeight: 800,
                lineHeight: 1,
              }}
            >
              t
            </div>
            <div style={{ display: 'flex', fontSize: 58, fontWeight: 800, letterSpacing: '-0.04em' }}>
              trimry
            </div>
          </div>

          <div
            style={{
              display: 'flex',
              marginTop: '34px',
              fontSize: 58,
              lineHeight: 1.05,
              fontWeight: 800,
              letterSpacing: '-0.035em',
            }}
          >
            {input.heading}
          </div>
          <div style={{ display: 'flex', marginTop: '16px', fontSize: 28, color: 'rgba(255,255,255,0.9)' }}>
            {input.subheading}
          </div>
        </div>

        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            flexGrow: 1,
            flexShrink: 1,
            padding: '36px 64px 0 64px',
            overflow: 'hidden',
          }}
        >
          {input.days.map((day) => (
            <div key={day.label} style={{ display: 'flex', flexDirection: 'column', marginBottom: '18px' }}>
              <div
                style={{
                  display: 'flex',
                  fontSize: 24,
                  fontWeight: 800,
                  letterSpacing: '0.16em',
                  textTransform: 'uppercase',
                  color: '#2f7bff',
                  marginBottom: '12px',
                }}
              >
                {day.label}
              </div>

              {day.events.map((event, index) => (
                <div
                  key={`${day.label}-${index}`}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '18px',
                    padding: '12px 22px',
                    marginBottom: '9px',
                    borderRadius: '20px',
                    background: '#ffffff',
                    border: '1px solid #e2e8f0',
                  }}
                >
                  <div
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      flexShrink: 0,
                      width: '52px',
                      height: '52px',
                      borderRadius: '9999px',
                      fontSize: 30,
                      background: `${SPORT_COLORS[event.sport ?? ''] ?? '#2f7bff'}22`,
                      border: `2px solid ${SPORT_COLORS[event.sport ?? ''] ?? '#2f7bff'}`,
                    }}
                  >
                    {event.emoji ?? ''}
                  </div>
                  <div
                    style={{
                      display: 'flex',
                      width: '124px',
                      fontSize: 31,
                      fontWeight: 800,
                      letterSpacing: '-0.02em',
                    }}
                  >
                    {event.time ?? '—'}
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', flexGrow: 1, overflow: 'hidden' }}>
                    <div style={{ display: 'flex', fontSize: 27, fontWeight: 700, letterSpacing: '-0.015em' }}>
                      {event.title}
                    </div>
                    {event.league ? (
                      <div style={{ display: 'flex', fontSize: 20, color: '#64748b', marginTop: '2px' }}>
                        {event.league}
                      </div>
                    ) : null}
                  </div>
                </div>
              ))}
            </div>
          ))}
        </div>

        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            flexShrink: 0,
            padding: '20px 64px 40px 64px',
          }}
        >
          {input.moreLabel ? (
            <div
              style={{
                display: 'flex',
                marginBottom: '18px',
                fontSize: 26,
                fontWeight: 600,
                color: '#64748b',
              }}
            >
              {input.moreLabel}
            </div>
          ) : null}

          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', fontSize: 30, fontWeight: 700, color: '#0b1220' }}>
            {input.footer}
          </div>
          <div
            style={{
              display: 'flex',
              padding: '16px 30px',
              borderRadius: '9999px',
              background: BRAND_GRADIENT,
              color: '#ffffff',
              fontSize: 28,
              fontWeight: 800,
            }}
          >
            trimry.com
          </div>
          </div>
        </div>
      </div>
    ),
    agendaImageSize,
  )
}
