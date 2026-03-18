import Image from 'next/image';

const LOGO_WIDTH = 932
const LOGO_HEIGHT = 309

export function Logo({
  width = LOGO_WIDTH,
  height = LOGO_HEIGHT,
  className,
  priority = false,
}: {
  width?: number
  height?: number
  className?: string
  priority?: boolean
}) {
  return (
    <Image
      src="/logo-horizontal.png"
      alt="Trimry"
      width={width}
      height={height}
      className={className}
      priority={priority}
    />
  )
}
