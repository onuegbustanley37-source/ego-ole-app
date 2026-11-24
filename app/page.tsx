'use client';

import { useEffect, useMemo, useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import {
  Search,
  MapPin,
  Store,
  ShieldCheck,
  BadgeCheck,
  ArrowRight,
  Flame,
} from 'lucide-react';
import {
  PRODUCTS,
  CATEGORIES,
  BANK,
  WHATSAPP_NUMBER,
  naira,
  waLink,
  type Category,
  type Product,
} from '@/lib/products';
import BottomNav from '@/components/bottom-nav';
import BrandLogo from '@/components/brand-logo';
import BrandFooter from '@/components/brand-footer';
import StallCard from '@/components/stall-card';
import { getSupabase } from '@/lib/supabase';
import { type Stall, type StallProduct } from '@/lib/stalls';

/* --------------------------------- Helpers ------------------------------- */

function WhatsAppLink({ product }: { product: Product }) {
  const message = `Hello Mama Nkechi, I'm interested in ${product.name} (${product.unit}) at ${naira(
    product.price
  )} listed on EGO OLE?. Is it available?`;
  return waLink(message);
}

/* --------------------------------- Page ---------------------------------- */

export default function Home() {
  const [activeCategory, setActiveCategory] = useState<Category>('All');
  const [query, setQuery] = useState('');
  const [jossyStall, setJossyStall] = useState<Stall | null>(null);
  const [jossyProducts, setJossyProducts] = useState<StallProduct[]>([]);

  useEffect(() => {
    let active = true;

    const loadJossyStall = async () => {
      const supabase = getSupabase();
      if (!supabase) return;

      const { data: stall } = await supabase
        .from('stalls')
        .select('id, slug, brand_name, location, category, contact, rating, item_count, verified, cover_image_url')
        .eq('slug', 'jossy-cakes')
        .maybeSingle();

      if (!stall || !active) return;

      const { data: products } = await supabase
        .from('stall_products')
        .select('id, stall_id, name, price, price_varies, unit, category, description, image_url, created_at')
        .eq('stall_id', stall.id)
        .order('created_at', { ascending: true });

      if (!active) return;
      setJossyStall(stall as Stall);
      setJossyProducts((products ?? []) as StallProduct[]);
    };

    void loadJossyStall();
    return () => {
      active = false;
    };
  }, []);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return PRODUCTS.filter((p) => {
      const matchesCategory = activeCategory === 'All' || p.category === activeCategory;
      const matchesQuery =
        !q ||
        p.name.toLowerCase().includes(q) ||
        p.category.toLowerCase().includes(q) ||
        p.market.toLowerCase().includes(q) ||
        p.seller.toLowerCase().includes(q);
      return matchesCategory && matchesQuery;
    });
  }, [activeCategory, query]);

  return (
    <div className="min-h-screen bg-[#FFFFFF] pb-24 text-[#111111] antialiased">
      {/* ------------------------------ Header ------------------------------ */}
      <header className="sticky top-0 z-50 bg-[#0A0A0A] text-white shadow-lg shadow-black/20">
        <div className="mx-auto flex max-w-5xl flex-col gap-3 px-4 pb-4 pt-4">
          <div className="flex items-center justify-between">
            <Link href="/" className="group inline-flex items-center">
              <BrandLogo size="sm" priority className="transition-transform duration-200 group-hover:scale-105" />
            </Link>
            <span className="hidden items-center gap-1.5 rounded-full border border-[#E8B93C]/40 bg-[#E8B93C]/10 px-3 py-1 text-[11px] font-semibold uppercase tracking-wider text-[#E8B93C] sm:inline-flex">
              <ShieldCheck className="h-3.5 w-3.5" />
              Verified Prices
            </span>
          </div>

          <label className="relative block">
            <Search className="pointer-events-none absolute left-3.5 top-1/2 h-4.5 w-4.5 -translate-y-1/2 text-[#111111]/60" />
            <span className="sr-only">Search products</span>
            <input
              type="search"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search garri, rice, tomatoes..."
              className="w-full rounded-full border border-[#FFFFFF] bg-[#FFFFFF] py-2.5 pl-11 pr-4 text-sm text-[#111111] placeholder:text-[#111111]/50 outline-none transition focus:border-[#E8B93C] focus:ring-2 focus:ring-[#E8B93C]/40"
            />
          </label>
        </div>
      </header>

      {/* ------------------------------ Tagline ----------------------------- */}
      <section className="bg-[#0A0A0A] px-4 pb-8 pt-5 text-center text-white">
        <BrandLogo size="lg" priority className="mx-auto" />
        <p className="mt-3 inline-flex items-center gap-2 text-xs font-bold uppercase tracking-[0.28em] text-[#E8B93C] sm:text-sm">
          <Flame className="h-4 w-4" />
          Know Before You Buy!
          <Flame className="h-4 w-4" />
        </p>
        <p className="mx-auto mt-2 max-w-md text-xs leading-5 text-white/70">
          Check today&apos;s market price before you spend your money.
        </p>
      </section>

      <main className="mx-auto max-w-5xl px-4 pb-16">
        {jossyStall && (
          <section className="mt-6">
            <div className="mb-3 flex items-end justify-between gap-3">
              <div>
                <p className="text-[10px] font-black uppercase tracking-[0.2em] text-[#D9A441]">Featured stall</p>
                <h2 className="mt-1 text-xl font-black text-[#111111]">Shop fresh from local vendors</h2>
              </div>
              <span className="text-xs font-semibold text-[#111111]/55">Online now</span>
            </div>
            <StallCard stall={jossyStall} products={jossyProducts} />
          </section>
        )}

        {/* ---------------------------- Categories --------------------------- */}
        <nav aria-label="Categories" className="sticky top-[104px] z-40 -mx-4 bg-[#FFFFFF]/95 px-4 py-3 backdrop-blur">
          <div className="flex gap-2 overflow-x-auto pb-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
            {CATEGORIES.map((cat) => {
              const active = activeCategory === cat;
              return (
                <button
                  key={cat}
                  onClick={() => setActiveCategory(cat)}
                  aria-pressed={active}
                  className={`shrink-0 rounded-full border px-4 py-1.5 text-xs font-semibold transition-all duration-200 sm:text-sm ${
                    active
                      ? 'border-[#D9A441] bg-[#D9A441] text-[#0A0A0A] shadow-md shadow-[#D9A441]/30'
                      : 'border-[#F5F5F5] bg-[#F5F5F5] text-[#111111] hover:border-[#D9A441] hover:text-[#0A0A0A]' 
                  }`}
                >
                  {cat}
                </button>
              );
            })}
          </div>
        </nav>

        {/* ------------------------------ Products --------------------------- */}
        {filtered.length > 0 ? (
          <section className="mt-2 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {filtered.map((product, index) => (
              <article
                key={product.id}
                onClick={() => (window.location.href = `/products/${product.id}`)}
                className="group flex cursor-pointer flex-col overflow-hidden rounded-2xl border border-[#F5F5F5] border-t-2 border-t-[#D9A441] bg-[#FFFFFF] shadow-[0_2px_12px_rgba(0,0,0,0.06)] transition-all duration-300 hover:-translate-y-1 hover:border-[#D9A441] hover:shadow-[0_14px_32px_rgba(0,0,0,0.14)]"
                style={{ animation: `fadeUp 0.5s ease ${index * 70}ms both` }}
              >
                <div className="relative aspect-[4/3] overflow-hidden bg-[#F5F5F5]">
                  <Image
                    src={product.image}
                    alt={`${product.name} — ${product.unit}`}
                    fill
                    sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                    className="object-cover transition-transform duration-500 group-hover:scale-105"
                  />
                  <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/25 via-transparent to-black/10" />
                  <span className="absolute left-3 top-3 rounded-full bg-[#0A0A0A] px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider text-white shadow">
                    {product.category}
                  </span>
                  <span className="absolute right-3 top-3 rounded-full bg-[#E8B93C] px-3 py-1 text-xs font-black text-[#0A0A0A] shadow backdrop-blur">
                    {naira(product.price)}
                  </span>
                  <span className="absolute bottom-3 left-3 rounded-full bg-[#FFFFFF] px-2.5 py-0.5 text-[10px] font-bold text-[#111111] shadow backdrop-blur">
                    {product.unit}
                  </span>
                </div>

                <div className="flex flex-1 flex-col gap-2 p-4">
                  <div className="flex items-start justify-between gap-2">
                    <h2 className="text-base font-bold leading-tight text-[#111111]">{product.name}</h2>
                    <span className="whitespace-nowrap text-xs font-semibold text-[#0A0A0A] underline decoration-[#D9A441] underline-offset-2">
                      View details →
                    </span>
                  </div>

                  <div className="flex flex-col gap-1 text-xs text-[#111111]/60">
                    <span className="inline-flex items-center gap-1.5">
                      <MapPin className="h-3.5 w-3.5 text-[#D9A441]" />
                      {product.market}
                    </span>
                    <span className="inline-flex items-center gap-1.5">
                      <Store className="h-3.5 w-3.5 text-[#D9A441]" />
                      {product.seller}
                      <BadgeCheck className="h-3.5 w-3.5 text-[#D9A441]" />
                    </span>
                  </div>

                  <a
                    href={WhatsAppLink({ product })}
                    target="_blank"
                    rel="noopener noreferrer"
                    onClick={(e) => e.stopPropagation()}
                    className="mt-auto inline-flex items-center justify-center gap-2 rounded-xl bg-[#D9A441] px-4 py-2.5 text-sm font-bold text-[#0A0A0A] shadow-sm shadow-[#D9A441]/40 transition-all duration-200 hover:bg-[#E8B93C] hover:shadow-md hover:shadow-[#D9A441]/40 active:scale-[0.98]"
                  >
                    I&apos;M INTERESTED
                    <ArrowRight className="h-4 w-4 transition-transform duration-200 group-hover:translate-x-0.5" />
                  </a>
                </div>
              </article>
            ))}
          </section>
        ) : (
          <div className="mt-8 rounded-2xl border border-dashed border-[#D9A441] p-10 text-center">
            <p className="text-sm font-semibold text-[#111111]">No items found</p>
            <p className="mt-1 text-xs text-[#111111]/60">
              Try a different search or category.
            </p>
          </div>
        )}
      </main>

      <BottomNav active="home" />

      <BrandFooter />
    </div>
  );
}
