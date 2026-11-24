'use client';

import Link from 'next/link';
import { Store, Plus } from 'lucide-react';
import { PRODUCTS, naira } from '@/lib/products';
import BottomNav from '@/components/bottom-nav';
import BrandLogo from '@/components/brand-logo';
import BrandFooter from '@/components/brand-footer';

export default function StallsPage() {
  const vendors = Array.from(new Set(PRODUCTS.map((p) => p.seller)));

  return (
    <div className="min-h-screen bg-[#FFFFFF] pb-24 text-[#111111] antialiased">
      <header className="bg-[#0A0A0A] text-white">
        <div className="mx-auto flex max-w-2xl items-center justify-between px-4 py-5">
          <div>
            <h1 className="text-xl font-black">STALLS</h1>
            <p className="text-xs text-white/60">Trusted vendors on EGO OLE?</p>
          </div>
          <Link href="/" className="inline-flex items-center">
            <BrandLogo size="sm" priority />
          </Link>
        </div>
      </header>

      <main className="mx-auto max-w-2xl px-4 py-6">
        <div className="flex flex-col gap-3">
          {vendors.map((seller) => {
            const items = PRODUCTS.filter((p) => p.seller === seller);
            return (
              <section
                key={seller}
                className="rounded-2xl border border-[#F5F5F5] bg-white p-4 shadow-[0_2px_12px_rgba(0,0,0,0.06)]"
              >
                <div className="flex items-center gap-3">
                  <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-[#F5F5F5] text-[#D9A441]">
                    <Store className="h-5 w-5" />
                  </span>
                  <div>
                    <h2 className="text-sm font-bold">{seller}</h2>
                    <p className="text-xs text-[#111111]/60">{items[0].market}</p>
                  </div>
                </div>
                <ul className="mt-3 flex flex-wrap gap-2">
                  {items.map((item) => (
                    <li key={item.id}>
                      <Link
                        href={`/products/${item.id}`}
                        className="inline-block rounded-full border border-[#F5F5F5] px-3 py-1 text-xs font-semibold text-[#111111] transition hover:border-[#D9A441] hover:text-[#0A0A0A]"
                      >
                        {item.name} · {naira(item.price)}
                      </Link>
                    </li>
                  ))}
                </ul>
              </section>
            );
          })}
        </div>

        <Link
          href="/vendor/join"
          className="mt-6 flex items-center justify-between rounded-2xl bg-[#0A0A0A] p-5 text-white transition hover:bg-[#111111]"
        >
          <div>
            <p className="text-sm font-bold text-[#D9A441]">RENT YOUR ONLINE STALL</p>
            <p className="text-xs text-white/60">₦2,000 / month — sell to every buyer here</p>
          </div>
          <Plus className="h-5 w-5 text-[#D9A441]" />
        </Link>
      </main>

      <BrandFooter />
      <BottomNav active="stalls" />
    </div>
  );
}
