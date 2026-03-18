import Link from 'next/link'

import { Container } from '@/components/Container'
import { Logo } from '@/components/Logo'
import { NavLink } from '@/components/NavLink'

export function Footer() {
  return (
    <footer className="bg-slate-50 dark:bg-slate-800">
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
        <div className="flex flex-col items-center border-t border-slate-400/10 dark:border-slate-600 py-10 sm:flex-row-reverse sm:justify-between">
          <p className="mt-6 text-sm text-slate-500 dark:text-slate-300 sm:mt-0">
          Copyright &copy; {new Date().getFullYear()} Trimry. All rights
            reserved. Trimry Limited, registered in Ireland. Company number: 752517. Registered office: 71 Lower Baggot Street, Co. Dublin, D02 P593, Dublin 2, Ireland. Operations office: Carrer Emili Darder 1, Bealaric Islands, Mallorca, 07181.
          </p>
        </div>
      </Container>
    </footer>
  )
}
