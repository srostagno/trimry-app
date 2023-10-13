import logoImage from '@/images/logos/logo-white.png';
import Image from 'next/image';

export function Logo({ width, height, className }: { width: number; height: number; className?: string }) {
  return (
    <Image src={logoImage} alt="Trimry" width={width} height={height} className={className} />
  )
}