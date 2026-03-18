import Link from 'next/link'

import { Logo } from '@/components/Logo'

export function BrandLogo() {
  return (
    <Link href="/" className="inline-flex items-center" aria-label="Trimry home">
      <Logo className="h-14 w-auto" priority />
    </Link>
  )
}
