import { Inter, Lexend } from 'next/font/google'
import clsx from 'clsx'

import '@/styles/tailwind.css'
import { type Metadata } from 'next'

export const metadata: Metadata = {
  title: {
    template: '%s - Trimry',
    default: 'Trimry - Train your brain',
  },
  description:
    'Craft your own games, share with friends, and ignite friendly competitions. Play, create, and connect in a cerebral playground.',
  verification: {
    other: {
      'facebook-domain-verification': 'c6u5evblmks2uyl105g7ph2e2yankn',
    },
  },
}

const inter = Inter({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-inter',
})

const lexend = Lexend({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-lexend',
})

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html
      lang="en"
      className={clsx(
        'h-full scroll-smooth dark antialiased',
        inter.variable,
        lexend.variable,
      )}
    >
      <body className="flex h-full flex-col dark:bg-black">{children}</body>
    </html>
  )
}