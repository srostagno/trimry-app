import Link from 'next/link'

import { Logo } from '@/components/Logo'

export function BrandLogo({ href = '/es' }: { href?: string }) {
  return (
    <Link href={href} className="inline-flex items-center" aria-label="Trimry home">
      <Logo size={40} priority />
    </Link>
  )
}
