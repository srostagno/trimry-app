import Link from 'next/link'

export function NavLink({
  href,
  children,
}: {
  href: string
  children: React.ReactNode
}) {
  return (
    <Link
      href={href}
      className="inline-block rounded-full px-3 py-2 text-sm text-[color:var(--cosmic-copy)] transition hover:bg-[rgba(122,88,255,0.14)] hover:text-slate-50"
    >
      {children}
    </Link>
  )
}
