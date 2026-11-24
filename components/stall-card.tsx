import Link from 'next/link';
import { BadgeCheck, MapPin, MessageCircle, Star } from 'lucide-react';
import ProductPhoto from '@/components/product-photo';
import { vendorWhatsAppLink, type Stall, type StallProduct } from '@/lib/stalls';

type StallCardProps = {
  stall: Stall;
  products: StallProduct[];
};

export default function StallCard({ stall, products }: StallCardProps) {
  const message = `Hello ${stall.brand_name}, I found your stall on EGO OLE? and would like to make an enquiry.`;

  return (
    <section className="overflow-hidden rounded-3xl border border-[#D9A441] bg-[#FFFFFF] shadow-[0_10px_30px_rgba(0,0,0,0.10)]">
      <div className="relative aspect-[16/8] overflow-hidden bg-[#0A0A0A]">
        <ProductPhoto
          src={stall.cover_image_url}
          alt={`${stall.brand_name} cover`}
          sizes="(max-width: 640px) 100vw, 960px"
        />
        {!stall.cover_image_url && (
          <div className="absolute inset-0 flex items-center justify-center bg-[#0A0A0A] px-6 text-center">
            <p className="max-w-sm text-xs font-bold uppercase tracking-[0.22em] text-[#E8B93C]">
              Jossy Cakes and Kitchen Hub
            </p>
          </div>
        )}
        <span className="absolute right-3 top-3 inline-flex items-center gap-1 rounded-full bg-[#FFFFFF] px-2.5 py-1 text-[10px] font-bold text-[#111111] shadow">
          <BadgeCheck className="h-3.5 w-3.5 text-[#D9A441]" />
          Verified
        </span>
      </div>

      <div className="p-5">
        <div className="flex items-start justify-between gap-3">
          <div>
            <h2 className="text-xl font-black leading-tight text-[#111111]">{stall.brand_name}</h2>
            <p className="mt-2 inline-flex items-center gap-1.5 text-xs text-[#111111]/65">
              <MapPin className="h-3.5 w-3.5 text-[#D9A441]" />
              {stall.location}
            </p>
            <p className="mt-1 text-xs font-semibold text-[#111111]/65">Cakes • Small Chops • Chin Chin</p>
          </div>
          <div className="shrink-0 text-right">
            <span className="inline-flex items-center gap-1 text-sm font-black text-[#111111]">
              <Star className="h-4 w-4 fill-[#D9A441] text-[#D9A441]" />
              {stall.rating}
            </span>
            <p className="mt-1 text-[10px] font-semibold text-[#111111]/55">{stall.item_count} items</p>
          </div>
        </div>

        <div className="mt-5 grid grid-cols-3 gap-2">
          {products.slice(0, 3).map((product) => (
            <Link key={product.id} href={`/stall/${stall.slug}`} className="group block">
              <div className="relative aspect-square overflow-hidden rounded-xl border border-[#F5F5F5] bg-[#F5F5F5]">
                <ProductPhoto
                  src={product.image_url}
                  alt={product.name}
                  sizes="(max-width: 640px) 30vw, 180px"
                  className="transition-transform duration-300 group-hover:scale-105"
                />
              </div>
              <p className="mt-1.5 truncate text-[10px] font-bold text-[#111111]">{product.name}</p>
            </Link>
          ))}
        </div>

        <div className="mt-5 grid grid-cols-2 gap-2">
          <Link
            href={`/stall/${stall.slug}`}
            className="inline-flex items-center justify-center rounded-xl bg-[#D9A441] px-3 py-3 text-xs font-black text-[#0A0A0A] transition hover:bg-[#E8B93C] active:scale-[0.98]"
          >
            Enter Stall <span className="ml-1">→</span>
          </Link>
          <a
            href={vendorWhatsAppLink(stall.contact, message)}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center justify-center gap-1.5 rounded-xl border-2 border-[#0A0A0A] px-3 py-3 text-xs font-black text-[#0A0A0A] transition hover:bg-[#F5F5F5] active:scale-[0.98]"
          >
            <MessageCircle className="h-4 w-4" />
            WhatsApp Vendor
          </a>
        </div>
      </div>
    </section>
  );
}
