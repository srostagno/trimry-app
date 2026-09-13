import formsPlugin from '@tailwindcss/forms'
import headlessuiPlugin from '@headlessui/tailwindcss'
import { type Config } from 'tailwindcss'

export default {
  content: ['./src/**/*.{js,jsx,ts,tsx}'],
  theme: {
    extend: {
      borderRadius: {
        '4xl': '2rem',
      },
      fontFamily: {
        sans: [
          '-apple-system',
          'BlinkMacSystemFont',
          '"Inter"',
          '"Segoe UI"',
          'Roboto',
          '"Helvetica Neue"',
          'Arial',
          'sans-serif',
        ],
      },
      colors: {
        trimry: {
          indigo: '#2b2fb8',
          blue: '#2f7bff',
          sky: '#38b6ff',
          cyan: '#35d2e5',
          teal: '#2bc9b0',
          green: '#2fc56c',
          ink: '#0b1220',
          slate: '#475569',
          muted: '#64748b',
          surface: '#f5f8fc',
          line: '#e2e8f0',
        },
      },
      backgroundImage: {
        'brand-gradient':
          'linear-gradient(135deg,#2b2fb8 0%,#2f7bff 38%,#35d2e5 72%,#2fc56c 100%)',
        'brand-gradient-soft':
          'linear-gradient(135deg,rgba(43,47,184,0.12) 0%,rgba(47,123,255,0.12) 38%,rgba(53,210,229,0.12) 72%,rgba(47,197,108,0.12) 100%)',
      },
      boxShadow: {
        card: '0 1px 2px rgba(11,18,32,0.04), 0 8px 24px rgba(11,18,32,0.06)',
        glow: '0 12px 32px rgba(47,123,255,0.28)',
      },
    },
  },
  plugins: [formsPlugin, headlessuiPlugin],
} satisfies Config
