'use client';

import Link from 'next/link';
import { Home, Store, ShoppingBasket, UserPlus } from 'lucide-react';

type Active = 'home' | 'stalls' | 'basket' | 'vendor';

const ITEMS: { key: Active; label: string; href: string; icon: typeof Home }[] = [
  { key: 'home', label: 'Home', href: '/', icon: Home },
  { key: 'stalls', label: 'Stalls', href: '/stalls', icon: Store },
  { key: 'basket', label: 'Basket', href: '/basket', icon: ShoppingBasket },
  { key: 'vendor', label: 'Vendor Join', href: '/vendor/join', icon: UserPlus },
];

export default function BottomNav({ active }: { active?: Active }) {
  return (
    <nav
      aria-label="Main navigation"
      className="fixed inset-x-0 bottom-0 z-50 border-t border-white/10 bg-[#0A0A0A]/97 text-white shadow-[0_-4px_20px_rgba(0,0,0,0.35)] backdrop-blur"
      style={{ paddingBottom: 'env(safe-area-inset-bottom)' }}
    >
      <div className="mx-auto grid max-w-2xl grid-cols-4">
        {ITEMS.map(({ key, label, href, icon: Icon }) => {
          const isActive = active === key;
          return (
            <Link
              key={key}
              href={href}
              aria-current={isActive ? 'page' : undefined}
              className={`flex flex-col items-center gap-0.5 py-2.5 text-[10px] font-semibold transition-colors ${
                isActive ? 'text-[#E8B93C]' : 'text-white hover:text-[#E8B93C]'
              }`}
            >
              <Icon className="h-5 w-5" />
              {label}
              <span
                className={`h-0.5 w-6 rounded-full transition-colors ${
                  isActive ? 'bg-[#E8B93C]' : 'bg-transparent'
                }`}
              />
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
