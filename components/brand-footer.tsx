import Link from 'next/link';
import { Banknote, Phone } from 'lucide-react';
import BrandLogo from '@/components/brand-logo';
import { BANK, WHATSAPP_NUMBER } from '@/lib/products';

export default function BrandFooter() {
  return (
    <footer className="bg-[#0A0A0A] text-white">
      <div className="mx-auto max-w-5xl px-4 py-10">
        <div className="flex flex-col items-center gap-3 text-center">
          <Link href="/" aria-label="EGO OLE? home">
            <BrandLogo size="md" />
          </Link>
          <p className="text-[11px] font-bold uppercase tracking-[0.28em] text-[#E8B93C]">
            Know Before You Buy!
          </p>
        </div>

        <div className="mt-8 grid gap-3 sm:grid-cols-2">
          <div className="rounded-2xl border border-white/15 bg-white/5 p-4">
            <p className="flex items-center gap-2 text-[11px] font-bold uppercase tracking-wider text-[#E8B93C]">
              <Banknote className="h-4 w-4" />
              Bank Payment
            </p>
            <p className="mt-2 text-sm font-semibold text-white">
              {BANK.name} <span className="font-black">{BANK.accountNumber}</span>
            </p>
            <p className="text-xs text-white/60">{BANK.accountName}</p>
          </div>

          <div className="rounded-2xl border border-white/15 bg-white/5 p-4">
            <p className="flex items-center gap-2 text-[11px] font-bold uppercase tracking-wider text-[#E8B93C]">
              <Phone className="h-4 w-4" />
              WhatsApp
            </p>
            <a
              href={`https://wa.me/234${WHATSAPP_NUMBER.replace(/^0/, '')}`}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-2 inline-block text-sm font-semibold text-white underline decoration-[#E8B93C] decoration-2 underline-offset-4 transition-colors hover:text-[#E8B93C]"
            >
              {WHATSAPP_NUMBER}
            </a>
            <p className="text-xs text-white/60">Tap to chat with us</p>
          </div>
        </div>

        <p className="mt-8 text-center text-[11px] text-white/50">
          © {new Date().getFullYear()} EGO OLE?. All rights reserved.
        </p>
      </div>
    </footer>
  );
}
