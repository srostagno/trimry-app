'use client'

import { Disclosure } from '@headlessui/react'
import clsx from 'clsx'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import type { ReactNode } from 'react'

import { BrandLogo } from '@/components/brand-logo'
import { LanguageSwitcher } from '@/components/language-switcher'
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

  const baseLinks = [
    { href: '/', label: messages.nav.home, active: pathname === '/' },
    { href: '/#how-it-works', label: messages.nav.howItWorks, active: false },
    { href: '/#pricing', label: messages.nav.pricing, active: false },
    { href: '/#faq', label: messages.nav.faq, active: false },
  ]

  const desktopNavLinkClass = (active: boolean) =>
    clsx(
      'rounded-full px-4 py-2.5 text-sm font-semibold',
      active ? 'cosmic-tab-active-alt' : 'cosmic-tab',
    )

  return (
    <div className="relative min-h-screen overflow-hidden text-slate-100">
      <div className="cosmic-nebula pointer-events-none absolute inset-0" />
      <div className="cosmic-stars pointer-events-none absolute inset-0" />
      <div className="cosmic-grid pointer-events-none absolute inset-0" />
      <div className="cosmic-orb orb-1 pointer-events-none" />
      <div className="cosmic-orb orb-2 pointer-events-none" />
      <div className="cosmic-orb orb-3 pointer-events-none" />

      <Disclosure
        as="header"
        className="relative z-20 border-b border-[rgba(134,190,255,0.2)] bg-[linear-gradient(180deg,rgba(5,11,28,0.82),rgba(8,18,45,0.62))] backdrop-blur-xl"
      >
        {({ open }) => (
          <>
            <div className="mx-auto max-w-7xl px-4 py-4 sm:px-6 lg:px-8">
              <div className="flex items-center justify-between gap-4 lg:grid lg:grid-cols-[auto_1fr_auto] lg:gap-8">
                <div className="min-w-0">
                  <BrandLogo />
                </div>

                <nav className="hidden min-w-0 items-center justify-center gap-2 lg:flex">
                  {baseLinks.map((link) => (
                    <Link
                      key={link.href}
                      href={link.href}
                      className={desktopNavLinkClass(link.active)}
                    >
                      {link.label}
                    </Link>
                  ))}
                </nav>

                <div className="hidden items-center justify-end gap-3 lg:flex">
                  <LanguageSwitcher compact />
                  {isAuthenticated ? (
                    <Link
                      href="/dashboard"
                      aria-label={messages.nav.profile}
                      title={viewer?.fullName || viewer?.email || messages.nav.profile}
                      className="inline-flex h-11 w-11 items-center justify-center rounded-full border border-[rgba(247,223,161,0.3)] bg-[linear-gradient(135deg,rgba(241,191,85,0.2),rgba(121,242,255,0.16),rgba(120,88,255,0.24))] text-sm font-black uppercase tracking-[0.12em] text-slate-50 shadow-[0_10px_28px_rgba(5,18,38,0.35)] transition hover:scale-[1.03] hover:border-[rgba(247,223,161,0.44)]"
                    >
                      {avatarLabel}
                    </Link>
                  ) : (
                    <>
                      <Link
                        href="/account/login"
                        className="cosmic-outline-button rounded-full px-4 py-2.5 text-sm font-semibold"
                      >
                        {messages.nav.login}
                      </Link>
                      <Link
                        href="/account/register"
                        className="cosmic-button-primary rounded-full px-4 py-2.5 text-sm font-black uppercase tracking-[0.1em] transition"
                      >
                        {messages.nav.register}
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
                      className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-[rgba(247,223,161,0.28)] bg-[linear-gradient(135deg,rgba(241,191,85,0.18),rgba(121,242,255,0.16),rgba(120,88,255,0.2))] text-xs font-black uppercase tracking-[0.12em] text-slate-50"
                    >
                      {avatarLabel}
                    </Link>
                  ) : null}

                  <Disclosure.Button className="cosmic-outline-button inline-flex h-11 w-11 items-center justify-center rounded-full p-0 text-cyan-50">
                    <span className="sr-only">Toggle menu</span>
                    <MenuIcon open={open} />
                  </Disclosure.Button>
                </div>
              </div>
            </div>

            <Disclosure.Panel className="border-t border-[rgba(134,190,255,0.12)] bg-[linear-gradient(180deg,rgba(5,11,28,0.9),rgba(12,17,47,0.86))] px-4 pb-5 pt-3 backdrop-blur-xl lg:hidden">
              <div className="mx-auto max-w-7xl space-y-5">
                <nav className="grid gap-2">
                  {baseLinks.map((link) => (
                    <Disclosure.Button
                      key={link.href}
                      as={Link}
                      href={link.href}
                      className={clsx(
                        'rounded-2xl px-4 py-3 text-left text-sm font-semibold',
                        link.active
                          ? 'cosmic-tab-active-alt'
                          : 'cosmic-tab',
                      )}
                    >
                      {link.label}
                    </Disclosure.Button>
                  ))}
                </nav>

                <div className="cosmic-info-box rounded-[1.5rem] p-4">
                  <LanguageSwitcher fullWidth />
                </div>

                {isAuthenticated ? (
                  <Disclosure.Button
                    as={Link}
                    href="/dashboard"
                    className="cosmic-info-box flex items-center justify-between rounded-[1.5rem] px-4 py-3 text-left transition hover:border-[rgba(247,223,161,0.28)]"
                  >
                    <div>
                      <p className="text-sm font-semibold text-slate-50">
                        {viewer?.fullName || viewer?.email}
                      </p>
                      <p className="mt-1 text-xs uppercase tracking-[0.18em] text-[rgba(247,223,161,0.72)]">
                        {messages.nav.profile}
                      </p>
                    </div>
                    <span className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-[rgba(247,223,161,0.28)] bg-[linear-gradient(135deg,rgba(241,191,85,0.18),rgba(121,242,255,0.16),rgba(120,88,255,0.2))] text-xs font-black uppercase tracking-[0.12em] text-slate-50">
                      {avatarLabel}
                    </span>
                  </Disclosure.Button>
                ) : (
                  <div className="grid gap-2">
                    <Disclosure.Button
                      as={Link}
                      href="/account/login"
                      className="cosmic-outline-button rounded-2xl px-4 py-3 text-center text-sm font-semibold"
                    >
                      {messages.nav.login}
                    </Disclosure.Button>
                    <Disclosure.Button
                      as={Link}
                      href="/account/register"
                      className="cosmic-button-primary rounded-2xl px-4 py-3 text-center text-sm font-black uppercase tracking-[0.1em]"
                    >
                      {messages.nav.register}
                    </Disclosure.Button>
                  </div>
                )}
              </div>
            </Disclosure.Panel>
          </>
        )}
      </Disclosure>

      <main className="relative z-10 mx-auto max-w-7xl px-6 py-10 lg:px-8">{children}</main>

      <footer className="relative z-10 border-t border-[rgba(134,190,255,0.18)] bg-[linear-gradient(180deg,rgba(4,10,27,0.78),rgba(8,15,38,0.9))] backdrop-blur-xl">
        <div className="mx-auto flex max-w-7xl flex-col gap-5 px-6 py-8 text-sm text-[color:var(--cosmic-copy)] lg:px-8">
          <p className="font-semibold text-slate-50">
            © {new Date().getFullYear()} {COMPANY.legalName}. {messages.footer.rightsReserved}
          </p>
          <p>
            {messages.footer.companyNumber}: {COMPANY.companyNumber}. {messages.footer.registeredOffice}:{' '}
            {COMPANY.registeredOffice}
          </p>
          <p>{messages.footer.operationsOffice}: {COMPANY.operationsOffice}</p>
          <p>
            {messages.footer.contact}:{' '}
            <a href={`mailto:${COMPANY.supportEmail}`}>{COMPANY.supportEmail}</a>
          </p>
          <div className="flex flex-wrap gap-4">
            <Link href="/legal/terms" className="cosmic-link">
              {messages.legal.terms}
            </Link>
            <Link href="/legal/privacy" className="cosmic-link">
              {messages.legal.privacy}
            </Link>
            <Link href="/legal/disclaimer" className="cosmic-link">
              {messages.legal.disclaimer}
            </Link>
            <Link href="/legal/data-deletion" className="cosmic-link">
              {messages.legal.dataDeletion}
            </Link>
          </div>
        </div>
      </footer>
    </div>
  )
}
