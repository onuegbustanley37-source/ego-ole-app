import Image from 'next/image';

type ProductPhotoProps = {
  src: string | null;
  alt: string;
  sizes: string;
  className?: string;
};

export default function ProductPhoto({ src, alt, sizes, className = '' }: ProductPhotoProps) {
  if (!src) {
    return (
      <div className={`flex h-full w-full items-center justify-center bg-[#F5F5F5] p-5 text-center ${className}`}>
        <span className="text-[10px] font-bold uppercase tracking-[0.18em] text-[#111111]/50">
          Product photo coming soon
        </span>
      </div>
    );
  }

  return (
    <Image src={src} alt={alt} fill sizes={sizes} className={`object-cover ${className}`} />
  );
}
