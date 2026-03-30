import Link from 'next/link'
import clsx from 'clsx'

const baseStyles = {
  solid:
    'group inline-flex items-center justify-center rounded-full px-4 py-2 text-sm font-semibold transition focus:outline-none focus-visible:outline-2 focus-visible:outline-offset-2',
  outline:
    'group inline-flex items-center justify-center rounded-full px-4 py-2 text-sm transition focus:outline-none',
}

const variantStyles = {
  solid: {
    slate:
      'border border-[rgba(138,196,255,0.28)] bg-[linear-gradient(140deg,rgba(8,18,43,0.88),rgba(23,28,78,0.72))] text-slate-50 hover:-translate-y-[1px] hover:border-[rgba(171,224,255,0.44)] hover:bg-[linear-gradient(140deg,rgba(10,24,58,0.92),rgba(31,37,95,0.8))] focus-visible:outline-[rgba(121,242,255,0.6)]',
    blue: 'border border-white/35 bg-[linear-gradient(120deg,#f3fff5,#9af8ff_42%,#70bcff_68%,#8c78ff)] text-slate-950 hover:-translate-y-[1px] hover:saturate-110 focus-visible:outline-[rgba(121,242,255,0.6)]',
    white:
      'border border-[rgba(138,196,255,0.3)] bg-[rgba(10,20,47,0.82)] text-slate-50 hover:-translate-y-[1px] hover:border-[rgba(171,224,255,0.46)] focus-visible:outline-[rgba(121,242,255,0.6)]',
    green:
      'border border-white/35 bg-[linear-gradient(120deg,#f3fff5,#9af8ff_42%,#70bcff_68%,#8c78ff)] text-slate-950 hover:-translate-y-[1px] hover:saturate-110 focus-visible:outline-[rgba(121,242,255,0.6)]',
  },
  outline: {
    slate:
      'border border-[rgba(138,196,255,0.3)] bg-[rgba(10,20,47,0.42)] text-slate-50 hover:-translate-y-[1px] hover:border-[rgba(171,224,255,0.44)] hover:bg-[rgba(18,30,66,0.68)] focus-visible:outline-[rgba(121,242,255,0.6)]',
    white:
      'border border-white/26 bg-white/6 text-white hover:-translate-y-[1px] hover:border-white/42 hover:bg-white/12 focus-visible:outline-[rgba(121,242,255,0.6)]',
  },
}

type VariantKey = keyof typeof variantStyles
type ColorKey<Variant extends VariantKey> =
  keyof (typeof variantStyles)[Variant]

type ButtonProps<
  Variant extends VariantKey,
  Color extends ColorKey<Variant>,
> = {
  variant?: Variant
  color?: Color
} & (
  | Omit<React.ComponentPropsWithoutRef<typeof Link>, 'color'>
  | (Omit<React.ComponentPropsWithoutRef<'button'>, 'color'> & {
      href?: undefined
    })
)

export function Button<
  Color extends ColorKey<Variant>,
  Variant extends VariantKey = 'solid',
>({ variant, color, className, ...props }: ButtonProps<Variant, Color>) {
  variant = variant ?? ('solid' as Variant)
  color = color ?? ('slate' as Color)

  className = clsx(
    baseStyles[variant],
    variantStyles[variant][color],
    className,
  )

  return typeof props.href === 'undefined' ? (
    <button className={className} {...props} />
  ) : (
    <Link className={className} {...props} />
  )
}
