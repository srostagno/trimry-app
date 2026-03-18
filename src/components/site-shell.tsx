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
      'rounded-full border px-4 py-2.5 text-sm font-semibold transition',
      active
        ? 'border-cyan-200/45 bg-cyan-300/20 text-cyan-50'
        : 'border-cyan-200/18 bg-slate-800/26 text-slate-100/88 hover:border-cyan-200/42 hover:bg-cyan-300/12',
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
        className="relative z-20 border-b border-cyan-200/20 bg-slate-950/45 backdrop-blur-xl"
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
                      className="inline-flex h-11 w-11 items-center justify-center rounded-full border border-amber-100/28 bg-[linear-gradient(135deg,rgba(247,221,145,0.22),rgba(87,242,218,0.18),rgba(106,184,255,0.2))] text-sm font-black uppercase tracking-[0.12em] text-amber-50 shadow-[0_10px_28px_rgba(5,18,38,0.35)] transition hover:scale-[1.03] hover:border-amber-100/44"
                    >
                      {avatarLabel}
                    </Link>
                  ) : (
                    <>
                      <Link
                        href="/account/login"
                        className="rounded-full border border-slate-200/18 bg-slate-800/28 px-4 py-2.5 text-sm font-semibold transition hover:bg-slate-700/38"
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
                      className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-amber-100/28 bg-[linear-gradient(135deg,rgba(247,221,145,0.22),rgba(87,242,218,0.18),rgba(106,184,255,0.2))] text-xs font-black uppercase tracking-[0.12em] text-amber-50"
                    >
                      {avatarLabel}
                    </Link>
                  ) : null}

                  <Disclosure.Button className="inline-flex h-11 w-11 items-center justify-center rounded-full border border-cyan-200/18 bg-slate-900/34 text-cyan-50 transition hover:border-cyan-200/36 hover:bg-cyan-300/10">
                    <span className="sr-only">Toggle menu</span>
                    <MenuIcon open={open} />
                  </Disclosure.Button>
                </div>
              </div>
            </div>

            <Disclosure.Panel className="border-t border-cyan-200/12 bg-slate-950/78 px-4 pb-5 pt-3 backdrop-blur-xl lg:hidden">
              <div className="mx-auto max-w-7xl space-y-5">
                <nav className="grid gap-2">
                  {baseLinks.map((link) => (
                    <Disclosure.Button
                      key={link.href}
                      as={Link}
                      href={link.href}
                      className={clsx(
                        'rounded-2xl border px-4 py-3 text-left text-sm font-semibold transition',
                        link.active
                          ? 'border-cyan-200/38 bg-cyan-300/18 text-cyan-50'
                          : 'border-cyan-200/14 bg-slate-900/30 text-slate-100/88 hover:border-cyan-200/28 hover:bg-cyan-300/10',
                      )}
                    >
                      {link.label}
                    </Disclosure.Button>
                  ))}
                </nav>

                <div className="rounded-[1.5rem] border border-cyan-200/14 bg-slate-900/26 p-4">
                  <LanguageSwitcher fullWidth />
                </div>

                {isAuthenticated ? (
                  <Disclosure.Button
                    as={Link}
                    href="/dashboard"
                    className="flex items-center justify-between rounded-[1.5rem] border border-amber-100/18 bg-slate-900/28 px-4 py-3 text-left transition hover:border-amber-100/32 hover:bg-slate-900/38"
                  >
                    <div>
                      <p className="text-sm font-semibold text-amber-50">
                        {viewer?.fullName || viewer?.email}
                      </p>
                      <p className="mt-1 text-xs uppercase tracking-[0.18em] text-amber-100/62">
                        {messages.nav.profile}
                      </p>
                    </div>
                    <span className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-amber-100/28 bg-[linear-gradient(135deg,rgba(247,221,145,0.22),rgba(87,242,218,0.18),rgba(106,184,255,0.2))] text-xs font-black uppercase tracking-[0.12em] text-amber-50">
                      {avatarLabel}
                    </span>
                  </Disclosure.Button>
                ) : (
                  <div className="grid gap-2">
                    <Disclosure.Button
                      as={Link}
                      href="/account/login"
                      className="rounded-2xl border border-slate-200/14 bg-slate-900/28 px-4 py-3 text-center text-sm font-semibold transition hover:bg-slate-800/38"
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

      <footer className="relative z-10 border-t border-cyan-200/18 bg-slate-950/45 backdrop-blur-xl">
        <div className="mx-auto flex max-w-7xl flex-col gap-5 px-6 py-8 text-sm text-slate-100/85 lg:px-8">
          <p className="font-semibold text-cyan-100/95">
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
          <div className="flex flex-wrap gap-4 text-cyan-100/90">
            <Link href="/legal/terms" className="underline decoration-cyan-300/70">
              {messages.legal.terms}
            </Link>
            <Link href="/legal/privacy" className="underline decoration-cyan-300/70">
              {messages.legal.privacy}
            </Link>
            <Link href="/legal/disclaimer" className="underline decoration-cyan-300/70">
              {messages.legal.disclaimer}
            </Link>
          </div>
        </div>
      </footer>
    </div>
  )
}
