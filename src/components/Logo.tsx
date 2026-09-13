import Image from 'next/image'
import clsx from 'clsx'

type LogoProps = {
  className?: string
  size?: number
  withWordmark?: boolean
  priority?: boolean
  inverted?: boolean
}

export function Logo({
  className,
  size = 40,
  withWordmark = true,
  priority = false,
  inverted = false,
}: LogoProps) {
  return (
    <span className={clsx('inline-flex items-center gap-2.5', className)}>
      <Image
        src="/brand/trimry-icon-rounded-128.png"
        alt="Trimry"
        width={size}
        height={size}
        priority={priority}
        className="shrink-0"
        style={{ width: size, height: size }}
      />
      {withWordmark ? (
        <span
          className={clsx(
            'text-[1.35rem] font-extrabold tracking-[-0.03em]',
            inverted ? 'text-white' : 'text-trimry-ink',
          )}
          style={{ lineHeight: 1 }}
        >
          trimry
        </span>
      ) : null}
    </span>
  )
}
