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
        sans: ["'Trebuchet MS'", "'Gill Sans'", "'Segoe UI'", 'sans-serif'],
        display: [
          "'Palatino Linotype'",
          "'Book Antiqua'",
          'Palatino',
          'Georgia',
          'serif',
        ],
      },
      colors: {
        trimry: {
          gold: '#f6c966',
          amber: '#e5832f',
          ember: '#7a3416',
          night: '#1d1411',
        },
      },
    },
  },
  plugins: [formsPlugin, headlessuiPlugin],
} satisfies Config
