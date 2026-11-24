'use client';

import { use, useEffect, useMemo, useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { BadgeCheck, MapPin, MessageCircle, Search, ShoppingBasket, Star } from 'lucide-react';
import { getSupabase } from '@/lib/supabase';
import { addToBasket } from '@/lib/basket';
import { JOSSY_SLUG, productPriceLabel, vendorWhatsAppLink, type Stall, type StallProduct } from '@/lib/stalls';
import BottomNav from '@/components/bottom-nav';
import BrandFooter from '@/components/brand-footer';
import BrandLogo from '@/components/brand-logo';
import ProductPhoto from '@/components/product-photo';

export default function JossyStallPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = use(params);
  const [stall, setStall] = useState<Stall | null>(null);
  const [products, setProducts] = useState<StallProduct[]>([]);
  const [query, setQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState<string | null>(null);

  useEffect(() => {
    let active = true;

    const load = async () => {
      const supabase = getSupabase();
      if (!supabase) {
        setLoading(false);
        return;
      }

      const { data: stallData, error: stallError } = await supabase
        .from('stalls')
        .select('id, slug, brand_name, location, category, contact, rating, item_count, verified, cover_image_url')
        .eq('slug', slug)
        .maybeSingle();

      if (stallError || !stallData) {
        if (active) setLoading(false);
        return;
      }

      const { data: productData } = await supabase
        .from('stall_products')
        .select('id, stall_id, name, price, price_varies, unit, category, description, image_url, created_at')
        .eq('stall_id', stallData.id)
        .order('created_at', { ascending: true });

      if (!active) return;
      setStall(stallData as Stall);
      setProducts((productData ?? []) as StallProduct[]);
      setLoading(false);
    };

    void load();
    return () => {
      active = false;
    };
  }, [slug]);

  const filteredProducts = useMemo(() => {
    const normalized = query.trim().toLowerCase();
    if (!normalized) return products;
    return products.filter((product) => product.name.toLowerCase().includes(normalized));
  }, [products, query]);

  if (loading) {
    return (
      <div className="min-h-screen bg-[#FFFFFF] text-[#111111]">
        <header className="bg-[#0A0A0A] px-4 py-4">
          <BrandLogo size="sm" priority />
        </header>
        <main className="mx-auto max-w-2xl px-4 py-16 text-center text-sm font-semibold text-[#111111]/60">
          Loading stall...
        </main>
      </div>
    );
  }

  if (!stall || stall.slug !== JOSSY_SLUG) {
    return (
      <div className="min-h-screen bg-[#FFFFFF] text-[#111111]">
        <header className="bg-[#0A0A0A] px-4 py-4">
          <Link href="/"><BrandLogo size="sm" priority /></Link>
        </header>
        <main className="mx-auto max-w-2xl px-4 py-16 text-center">
          <h1 className="text-xl font-black">Stall not found</h1>
          <Link href="/" className="mt-5 inline-flex rounded-xl bg-[#D9A441] px-5 py-3 text-sm font-bold text-[#0A0A0A]">
            Back to market
          </Link>
        </main>
        <BottomNav active="stalls" />
      </div>
    );
  }

  const vendorMessage = `Hello ${stall.brand_name}, I would like to make an enquiry about your products on EGO OLE?.`;

  return (
    <div className="min-h-screen bg-[#FFFFFF] pb-24 text-[#111111] antialiased">
      <header className="bg-[#0A0A0A] text-white">
        <div className="mx-auto flex max-w-3xl items-center justify-between px-4 py-3.5">
          <Link href="/" className="text-xs font-bold text-white underline decoration-[#D9A441] underline-offset-4">
            ← Market
          </Link>
          <BrandLogo size="sm" priority />
          <Link href="/vendor/upload" className="text-xs font-bold text-[#E8B93C]">
            Vendor upload
          </Link>
        </div>
      </header>

      <main className="mx-auto max-w-3xl">
        <section className="bg-[#0A0A0A] px-4 pb-7 text-white">
          <div className="relative aspect-[16/8] overflow-hidden rounded-2xl bg-[#111111]">
            {stall.cover_image_url ? (
              <Image
                src={stall.cover_image_url}
                alt={`${stall.brand_name} cover`}
                fill
                priority
                sizes="(max-width: 768px) 100vw, 768px"
                className="object-cover"
              />
            ) : (
              <div className="flex h-full items-center justify-center px-6 text-center">
                <p className="text-xs font-black uppercase tracking-[0.25em] text-[#E8B93C]">
                  Jossy Cakes and Kitchen Hub
                </p>
              </div>
            )}
          </div>
          <div className="mt-5 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-2xl font-black leading-tight sm:text-3xl">{stall.brand_name}</h1>
                {stall.verified && <BadgeCheck className="h-5 w-5 shrink-0 text-[#E8B93C]" />}
              </div>
              <p className="mt-2 inline-flex items-center gap-1.5 text-sm text-white/70">
                <MapPin className="h-4 w-4 text-[#E8B93C]" />
                {stall.location}
              </p>
              <p className="mt-1 text-xs font-semibold text-white/60">{stall.category}</p>
              <div className="mt-3 flex items-center gap-4 text-xs font-bold text-white/75">
                <span className="inline-flex items-center gap-1"><Star className="h-4 w-4 fill-[#D9A441] text-[#D9A441]" /> {stall.rating}</span>
                <span>{stall.item_count} items</span>
              </div>
            </div>
            <a
              href={vendorWhatsAppLink(stall.contact, vendorMessage)}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center justify-center gap-2 rounded-xl bg-[#D9A441] px-4 py-3 text-xs font-black text-[#0A0A0A] transition hover:bg-[#E8B93C] active:scale-[0.98]"
            >
              <MessageCircle className="h-4 w-4" />
              WhatsApp Vendor
            </a>
          </div>
        </section>

        <section className="px-4 py-6">
          <div className="flex items-end justify-between gap-3">
            <div>
              <p className="text-[10px] font-black uppercase tracking-[0.2em] text-[#D9A441]">Jossy&apos;s menu</p>
              <h2 className="mt-1 text-2xl font-black">Shop all products</h2>
            </div>
            <span className="text-xs font-semibold text-[#111111]/55">{products.length} listed</span>
          </div>

          <label className="relative mt-5 block">
            <Search className="pointer-events-none absolute left-3.5 top-1/2 h-4.5 w-4.5 -translate-y-1/2 text-[#111111]/55" />
            <span className="sr-only">Search Jossy products</span>
            <input
              type="search"
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Search cakes, chops, chin chin..."
              className="w-full rounded-full border border-[#F5F5F5] bg-[#F5F5F5] py-3 pl-11 pr-4 text-sm text-[#111111] placeholder:text-[#111111]/50 outline-none focus:border-[#D9A441] focus:ring-2 focus:ring-[#D9A441]/30"
            />
          </label>

          {message && <p className="mt-3 rounded-xl bg-[#F5F5F5] px-4 py-3 text-xs font-semibold text-[#111111]">{message}</p>}

          {filteredProducts.length > 0 ? (
            <div className="mt-5 grid gap-4 sm:grid-cols-2">
              {filteredProducts.map((product) => (
                <article key={product.id} className="overflow-hidden rounded-2xl border border-[#F5F5F5] border-t-2 border-t-[#D9A441] bg-[#FFFFFF] shadow-[0_2px_12px_rgba(0,0,0,0.06)]">
                  <div className="relative aspect-[4/3] overflow-hidden bg-[#F5F5F5]">
                    <ProductPhoto
                      src={product.image_url}
                      alt={product.name}
                      sizes="(max-width: 640px) 100vw, 360px"
                    />
                    <span className="absolute left-3 top-3 rounded-full bg-[#0A0A0A] px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider text-white">
                      {product.category}
                    </span>
                  </div>
                  <div className="p-4">
                    <div className="flex items-start justify-between gap-3">
                      <h3 className="text-lg font-black leading-tight">{product.name}</h3>
                      <p className="shrink-0 text-sm font-black text-[#111111]">{productPriceLabel(product)}</p>
                    </div>
                    <p className="mt-1 text-xs font-semibold text-[#111111]/55">{product.unit}</p>
                    <p className="mt-3 text-xs leading-5 text-[#111111]/65">{product.description}</p>
                    <button
                      onClick={() => {
                        addToBasket(product, stall.brand_name);
                        setMessage(`${product.name} added to your basket.`);
                        window.setTimeout(() => setMessage(null), 2200);
                      }}
                      className="mt-4 inline-flex w-full items-center justify-center gap-2 rounded-xl bg-[#D9A441] px-4 py-3 text-xs font-black text-[#0A0A0A] transition hover:bg-[#E8B93C] active:scale-[0.98]"
                    >
                      <ShoppingBasket className="h-4 w-4" />
                      Add to Basket
                    </button>
                  </div>
                </article>
              ))}
            </div>
          ) : (
            <div className="mt-6 rounded-2xl border border-dashed border-[#D9A441] p-10 text-center">
              <p className="text-sm font-bold">No products match that search.</p>
              <p className="mt-1 text-xs text-[#111111]/60">Try a different product name.</p>
            </div>
          )}
        </section>
      </main>

      <BrandFooter />
      <BottomNav active="stalls" />
    </div>
  );
}
