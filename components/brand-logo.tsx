import Image from 'next/image';

type BrandLogoProps = {
  size?: 'sm' | 'md' | 'lg';
  priority?: boolean;
  className?: string;
};

const dimensions = {
  sm: 48,
  md: 72,
  lg: 176,
};

export default function BrandLogo({ size = 'md', priority = false, className = '' }: BrandLogoProps) {
  const dimension = dimensions[size];

  return (
    <Image
      src="/images/EGO_OLE_LOGO_2.jpeg"
      alt="EGO OLE? — Know Before You Buy"
      width={dimension}
      height={dimension}
      priority={priority}
      sizes={`${dimension}px`}
      className={`object-contain ${className}`}
    />
  );
}
