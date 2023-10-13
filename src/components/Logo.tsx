import logoImage from '@/images/logos/logo-white.png';
import Image from 'next/image';

type LogoProps = {
  width: number,
  height: number,
  className?: string,
  // ... any other props you might need
};

export function Logo({ width, height, ...props }: LogoProps) {
  return (
    <Image src={logoImage} alt="Trimry" width={width} height={height} {...props} />
  )
}
