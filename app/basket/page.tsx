'use client';

import { useEffect, useState } from 'react';
import { Minus, Plus, ShoppingBasket, Trash2 } from 'lucide-react';
import { type BasketItem, readBasket, writeBasket } from '@/lib/basket';
import BottomNav from '@/components/bottom-nav';
import BrandLogo from '@/components/brand-logo';
import BrandFooter from '@/components/brand-footer';
import ProductPhoto from '@/components/product-photo';

function naira(amount: number): string {
  return `₦${amount.toLocaleString('en-NG')}`;
}

export default function BasketPage() {
  const [items, setItems] = useState<BasketItem[]>([]);

  useEffect(() => {
    const sync = () => setItems(readBasket());
    sync();
    window.addEventListener('ego-basket-updated', sync);
    return () => window.removeEventListener('ego-basket-updated', sync);
  }, []);

  const update = (next: BasketItem[]) => {
    setItems(next);
    writeBasket(next);
  };

  const changeQuantity = (id: string, delta: number) => {
    update(
      items
        .map((item) => (item.id === id ? { ...item, quantity: item.quantity + delta } : item))
        .filter((item) => item.quantity > 0)
    );
  };

  const removeItem = (id: string) => {
    update(items.filter((item) => item.id !== id));
  };

  const pricedItems = items.filter((item) => !item.price_varies && item.price !== null);
  const total = pricedItems.reduce((sum, item) => sum + (item.price ?? 0) * item.quantity, 0);
  const hasVaries = items.some((item) => item.price_varies || item.price === null);

  const stallNames = Array.from(new Set(items.map((item) => item.stallName)));

  return (
    <div className="min-h-screen bg-[#FFFFFF] pb-24 text-[#111111] antialiased">
      <header className="bg-[#0A0A0A] text-white">
        <div className="mx-auto flex max-w-2xl items-center justify-between px-4 py-5">
          <div>
            <h1 className="text-xl font-black">BASKET</h1>
            <p className="text-xs text-white/60">Items you want to buy</p>
          </div>
          <a href="/" className="inline-flex items-center">
            <BrandLogo size="sm" priority />
          </a>
        </div>
      </header>

      {items.length === 0 ? (
        <main className="mx-auto flex max-w-2xl flex-col items-center px-4 py-16 text-center">
          <span className="flex h-16 w-16 items-center justify-center rounded-2xl bg-[#F5F5F5]">
            <ShoppingBasket className="h-8 w-8 text-[#D9A441]" />
          </span>
          <h2 className="mt-4 text-lg font-black">Your basket is empty</h2>
          <p className="mt-1 max-w-xs text-sm text-[#111111]/60">
            Browse the market, check prices, and chat with vendors on WhatsApp to buy.
          </p>
          <a
            href="/"
            className="mt-6 inline-flex items-center justify-center rounded-xl bg-[#D9A441] px-6 py-3 text-sm font-bold text-[#0A0A0A] shadow-md shadow-[#D9A441]/30 transition hover:bg-[#E8B93C] active:scale-[0.98]"
          >
            GO TO MARKET
          </a>
        </main>
      ) : (
        <main className="mx-auto max-w-2xl px-4 py-6">
          {stallNames.map((stallName) => {
            const stallItems = items.filter((item) => item.stallName === stallName);
            return (
              <section key={stallName} className="mb-6">
                <div className="flex items-center justify-between gap-3">
                  <h2 className="text-sm font-black uppercase tracking-wider">{stallName}</h2>
                  <span className="rounded-full bg-[#F5F5F5] px-3 py-1 text-[10px] font-black uppercase tracking-wider text-[#111111]/60">
                    {stallItems.length} item{stallItems.length === 1 ? '' : 's'}
                  </span>
                </div>

                <div className="mt-3 flex flex-col gap-3">
                  {stallItems.map((item) => (
                    <article key={item.id} className="flex items-center gap-3 rounded-2xl border border-[#F5F5F5] border-t-2 border-t-[#D9A441] bg-[#FFFFFF] p-3 shadow-[0_2px_12px_rgba(0,0,0,0.05)]">
                      <div className="relative h-16 w-16 shrink-0 overflow-hidden rounded-xl bg-[#F5F5F5]">
                        <ProductPhoto src={item.image_url} alt={item.name} sizes="64px" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <h3 className="truncate text-sm font-black">{item.name}</h3>
                        <p className="mt-0.5 text-xs font-semibold text-[#111111]/60">
                          {item.price_varies || item.price === null ? 'Price Varies' : `${naira(item.price)} · ${item.unit}`}
                        </p>
                        <div className="mt-2 flex items-center gap-2">
                          <button onClick={() => changeQuantity(item.id, -1)} aria-label={`Reduce ${item.name}`} className="flex h-7 w-7 items-center justify-center rounded-lg bg-[#F5F5F5] transition hover:bg-[#E8B93C]/30">
                            <Minus className="h-3.5 w-3.5" />
                          </button>
                          <span className="w-6 text-center text-sm font-black">{item.quantity}</span>
                          <button onClick={() => changeQuantity(item.id, 1)} aria-label={`Add another ${item.name}`} className="flex h-7 w-7 items-center justify-center rounded-lg bg-[#F5F5F5] transition hover:bg-[#E8B93C]/30">
                            <Plus className="h-3.5 w-3.5" />
                          </button>
                          <button onClick={() => removeItem(item.id)} aria-label={`Remove ${item.name}`} className="ml-1 rounded-lg p-1.5 text-[#111111]/50 transition hover:bg-[#F5F5F5] hover:text-[#111111]">
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                      </div>
                      <p className="shrink-0 text-sm font-black text-[#111111]">
                        {item.price_varies || item.price === null ? '—' : naira(item.price * item.quantity)}
                      </p>
                    </article>
                  ))}
                </div>
              </section>
            );
          })}

          <section className="rounded-2xl bg-[#0A0A0A] p-5 text-white">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-white/60">Total</span>
              <span className="text-2xl font-black text-[#E8B93C]">{naira(total)}</span>
            </div>
            {hasVaries && (
              <p className="mt-2 text-xs text-white/60">Items marked “Price Varies” are not included — confirm their price with the vendor on WhatsApp.</p>
            )}
            <p className="mt-3 text-xs text-white/60">You pay the vendor directly when you collect your items.</p>
          </section>
        </main>
      )}

      <BrandFooter />
      <BottomNav active="basket" />
    </div>
  );
}
