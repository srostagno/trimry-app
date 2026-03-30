import Link from 'next/link'

import { Container } from '@/components/Container'
import { Logo } from '@/components/Logo'
import { NavLink } from '@/components/NavLink'

export function Footer() {
  return (
    <footer className="border-t border-[rgba(134,190,255,0.18)] bg-[linear-gradient(180deg,rgba(4,10,27,0.76),rgba(8,15,38,0.9))]">
      <Container>
        <div className="py-16">
          <Logo className="h-10 w-auto" />
          <nav className="mt-10 text-sm" aria-label="quick links">
            <div className="-my-1 flex justify-center gap-x-6">
              <NavLink href="#testimonials">Testimonials</NavLink>
              <NavLink href="#get-started-today">Get started</NavLink>
              <NavLink href="#faq">Questions</NavLink>
            </div>
          </nav>
        </div>
        <div className="flex flex-col items-center border-t border-[rgba(134,190,255,0.12)] py-10 sm:flex-row-reverse sm:justify-between">
          <p className="mt-6 text-sm text-[color:var(--cosmic-copy)] sm:mt-0">
          Copyright &copy; {new Date().getFullYear()} Trimry. All rights
            reserved. Trimry Limited, registered in Ireland. Company number: 752517. Registered office: 71 Lower Baggot Street, Co. Dublin, D02 P593, Dublin 2, Ireland. Operations office: Carrer Emili Darder 1, Bealaric Islands, Mallorca, 07181.
          </p>
        </div>
      </Container>
    </footer>
  )
}
