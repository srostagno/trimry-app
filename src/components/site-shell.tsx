'use client'

import { Disclosure } from '@headlessui/react'
import clsx from 'clsx'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import type { ReactNode } from 'react'

import { BrandLogo } from '@/components/brand-logo'
import { LanguageSwitcher } from '@/components/language-switcher'
import { ScoutChatWidget } from '@/components/scout-chat-widget'
import { useLanguage } from '@/components/language-provider'
import type { AuthViewer } from '@/lib/auth-viewer'
import { COMPANY } from '@/lib/company'

function MenuIcon({ open }: { open: boolean }) {
  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 24 24"
      className="h-5 w-5 stroke-current"
      fill="none"
      strokeWidth="2"
      strokeLinecap="round"
    >
      <path
        d="M4 7h16M4 12h16M4 17h16"
        className={clsx('origin-center transition', open && 'scale-75 opacity-0')}
      />
      <path
        d="M7 7l10 10M17 7L7 17"
        className={clsx('origin-center transition', !open && 'scale-75 opacity-0')}
      />
    </svg>
  )
}

function Avatar({ label, size = 'md' }: { label: string; size?: 'sm' | 'md' }) {
  return (
    <span
      className={clsx(
        'inline-flex items-center justify-center rounded-full bg-brand-gradient font-black uppercase tracking-[0.1em] text-white shadow-glow',
        size === 'md' ? 'h-10 w-10 text-xs' : 'h-9 w-9 text-[11px]',
      )}
    >
      {label}
    </span>
  )
}

export function SiteShell({
  children,
  viewer,
}: {
  children: ReactNode
  viewer: AuthViewer | null
}) {
  const pathname = usePathname()
  const { messages } = useLanguage()
  const isAuthenticated = Boolean(viewer)
  const avatarFallback = viewer?.fullName
    ?.split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? '')
    .join('')
  const avatarLabel =
    avatarFallback && avatarFallback.length > 0
      ? avatarFallback
      : viewer?.email.slice(0, 2).toUpperCase() ?? 'TR'
  const hideScoutChat = pathname?.startsWith('/activate') || pathname?.startsWith('/checkout')

  const baseLinks = [
    { href: '/#how-it-works', label: messages.nav.howItWorks },
    { href: '/#sports', label: messages.nav.sports },
    { href: '/#pricing', label: messages.nav.pricing },
    { href: '/#faq', label: messages.nav.faq },
  ]

  return (
    <div className="relative flex min-h-screen flex-col">
      <Disclosure
        as="header"
        className="sticky top-0 z-30 border-b border-trimry-line/80 bg-white/85 backdrop-blur-xl"
      >
        {({ open }) => (
          <>
            <div className="tr-container py-3.5">
              <div className="flex items-center justify-between gap-4 lg:grid lg:grid-cols-[auto_1fr_auto] lg:gap-8">
                <div className="min-w-0">
                  <BrandLogo />
                </div>

                <nav className="hidden min-w-0 items-center justify-center gap-1 lg:flex">
                  {baseLinks.map((link) => (
                    <Link key={link.href} href={link.href} className="tr-tab">
                      {link.label}
                    </Link>
                  ))}
                </nav>

                <div className="hidden items-center justify-end gap-3 lg:flex">
                  <LanguageSwitcher compact />
                  {isAuthenticated ? (
                    <>
                      <Link
                        href="/dashboard"
                        className={clsx(
                          'tr-tab',
                          pathname?.startsWith('/dashboard') && 'tr-tab-active',
                        )}
                      >
                        {messages.nav.dashboard}
                      </Link>
                      <Link
                        href="/dashboard?tab=account"
                        aria-label={messages.nav.profile}
                        title={viewer?.fullName || viewer?.email || messages.nav.profile}
                      >
                        <Avatar label={avatarLabel} />
                      </Link>
                    </>
                  ) : (
                    <>
                      <Link href="/account/login" className="tr-btn-secondary tr-btn-sm">
                        {messages.nav.login}
                      </Link>
                      <Link href="/activate" className="tr-btn-primary tr-btn-sm">
                        {messages.nav.startFree}
                      </Link>
                    </>
                  )}
                </div>

                <div className="flex items-center gap-3 lg:hidden">
                  {isAuthenticated ? (
                    <Link
                      href="/dashboard"
                      aria-label={messages.nav.profile}
                      title={viewer?.fullName || viewer?.email || messages.nav.profile}
                    >
                      <Avatar label={avatarLabel} size="sm" />
                    </Link>
                  ) : null}

                  <Disclosure.Button className="tr-btn-secondary h-10 w-10 rounded-full p-0">
                    <span className="sr-only">Toggle menu</span>
                    <MenuIcon open={open} />
                  </Disclosure.Button>
                </div>
              </div>
            </div>

            <Disclosure.Panel className="border-t border-trimry-line bg-white px-4 pb-5 pt-3 lg:hidden">
              <div className="mx-auto max-w-6xl space-y-4">
                <nav className="grid gap-1">
                  {baseLinks.map((link) => (
                    <Disclosure.Button
                      key={link.href}
                      as={Link}
                      href={link.href}
                      className="rounded-xl px-4 py-3 text-left text-sm font-semibold text-trimry-slate hover:bg-trimry-surface"
                    >
                      {link.label}
                    </Disclosure.Button>
                  ))}
                </nav>

                <div className="tr-card-muted p-4">
                  <LanguageSwitcher fullWidth />
                </div>

                {isAuthenticated ? (
                  <Disclosure.Button
                    as={Link}
                    href="/dashboard"
                    className="tr-card flex items-center justify-between px-4 py-3 text-left"
                  >
                    <div>
                      <p className="text-sm font-semibold text-trimry-ink">
                        {viewer?.fullName || viewer?.email}
                      </p>
                      <p className="mt-1 text-xs font-bold uppercase tracking-[0.16em] text-trimry-blue">
                        {messages.nav.dashboard}
                      </p>
                    </div>
                    <Avatar label={avatarLabel} size="sm" />
                  </Disclosure.Button>
                ) : (
                  <div className="grid gap-2">
                    <Disclosure.Button as={Link} href="/account/login" className="tr-btn-secondary">
                      {messages.nav.login}
                    </Disclosure.Button>
                    <Disclosure.Button as={Link} href="/activate" className="tr-btn-primary">
                      {messages.nav.startFree}
                    </Disclosure.Button>
                  </div>
                )}
              </div>
            </Disclosure.Panel>
          </>
        )}
      </Disclosure>

      <main className="tr-container flex-1 py-8 lg:py-12">{children}</main>
      {hideScoutChat ? null : <ScoutChatWidget />}

      <footer className="border-t border-trimry-line bg-white">
        <div className="tr-container grid gap-8 py-10 text-sm text-trimry-slate lg:grid-cols-[1.2fr_1fr_1fr]">
          <div className="space-y-3">
            <BrandLogo />
            <p className="max-w-sm">{messages.footer.tagline}</p>
            <p className="tr-meta text-xs">{messages.footer.dataSource}</p>
          </div>
          <div className="space-y-2">
            <p className="text-xs font-extrabold uppercase tracking-[0.16em] text-trimry-ink">
              Trimry
            </p>
            <Link href="/#how-it-works" className="block hover:text-trimry-ink">
              {messages.nav.howItWorks}
            </Link>
            <Link href="/#pricing" className="block hover:text-trimry-ink">
              {messages.nav.pricing}
            </Link>
            <Link href="/#faq" className="block hover:text-trimry-ink">
              {messages.nav.faq}
            </Link>
            <Link href="/legal/terms" className="block hover:text-trimry-ink">
              {messages.legal.terms}
            </Link>
            <Link href="/legal/privacy" className="block hover:text-trimry-ink">
              {messages.legal.privacy}
            </Link>
            <Link href="/legal/disclaimer" className="block hover:text-trimry-ink">
              {messages.legal.disclaimer}
            </Link>
            <Link href="/legal/data-deletion" className="block hover:text-trimry-ink">
              {messages.legal.dataDeletion}
            </Link>
          </div>
          <div className="space-y-2 text-xs leading-5">
            <p className="font-semibold text-trimry-ink">
              © {new Date().getFullYear()} {COMPANY.legalName}. {messages.footer.rightsReserved}
            </p>
            <p>
              {messages.footer.companyNumber}: {COMPANY.companyNumber}. {messages.footer.registeredOffice}:{' '}
              {COMPANY.registeredOffice}
            </p>
            <p>
              {messages.footer.operationsOffice}: {COMPANY.operationsOffice}
            </p>
            <p>
              {messages.footer.contact}:{' '}
              <a href={`mailto:${COMPANY.supportEmail}`} className="tr-link">
                {COMPANY.supportEmail}
              </a>
            </p>
          </div>
        </div>
      </footer>
    </div>
  )
}
