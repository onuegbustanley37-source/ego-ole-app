'use client';

import { use } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import {
  MapPin,
  Store,
  BadgeCheck,
  ArrowLeft,
  Banknote,
  Copy,
  Check,
  Send,
  ShieldCheck,
} from 'lucide-react';
import { useState } from 'react';
import { BANK, getProduct, naira, waLink } from '@/lib/products';
import BottomNav from '@/components/bottom-nav';
import BrandLogo from '@/components/brand-logo';
import BrandFooter from '@/components/brand-footer';

function CopyAccount() {
  const [copied, setCopied] = useState(false);

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(BANK.accountNumber);
    } catch {
      const el = document.createElement('textarea');
      el.value = BANK.accountNumber;
      document.body.appendChild(el);
      el.select();
      document.execCommand('copy');
      document.body.removeChild(el);
    }
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <button
      onClick={copy}
      aria-label="Copy account number"
      className="inline-flex items-center gap-1.5 rounded-lg bg-[#D9A441] px-3 py-1.5 text-xs font-bold text-[#0A0A0A] transition-all hover:bg-[#E8B93C] active:scale-95"
    >
      {copied ? <Check className="h-3.5 w-3.5" /> : <Copy className="h-3.5 w-3.5" />}
      {copied ? 'Copied!' : 'Copy'}
    </button>
  );
}

export default function ProductDetailsPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const product = getProduct(id);
  if (!product) notFound();

  const enquiryMessage = `Hello ${product.seller}, I'm interested in ${product.name} (${product.unit}) at ${naira(
    product.price
  )} listed on EGO OLE?. Is it available?`;

  return (
    <div className="min-h-screen bg-[#FFFFFF] pb-24 text-[#111111] antialiased">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-[#0A0A0A] text-white shadow-lg shadow-black/20">
        <div className="mx-auto flex max-w-2xl items-center justify-between px-4 py-3.5">
          <Link
            href="/"
            className="inline-flex items-center gap-1.5 rounded-full bg-white/10 py-1.5 pl-2 pr-3.5 text-xs font-semibold text-white transition hover:bg-white/20"
          >
            <ArrowLeft className="h-4 w-4" />
            Back
          </Link>
          <Link href="/" className="inline-flex items-center">
            <BrandLogo size="sm" priority />
          </Link>
        </div>
      </header>

      <main className="mx-auto max-w-2xl px-4 pb-10">
        {/* Big photo */}
        <div className="relative -mt-px aspect-[4/3] w-full overflow-hidden bg-[#F5F5F5]">
          <Image
            src={product.image}
            alt={`${product.name} — ${product.unit}`}
            fill
            priority
            sizes="(max-width: 640px) 100vw, 672px"
            className="object-cover"
          />
          <span className="absolute left-4 top-4 rounded-full bg-[#0A0A0A] px-3 py-1 text-[11px] font-bold uppercase tracking-wider text-white shadow">
            {product.category}
          </span>
          <span className="absolute right-4 top-4 rounded-full bg-[#0A0A0A]/85 px-4 py-1.5 text-base font-black text-[#D9A441] shadow backdrop-blur">
            {naira(product.price)}
          </span>
        </div>

        <div className="flex flex-col gap-5 pt-5">
          {/* Title block */}
          <section>
            <div className="flex items-start justify-between gap-3">
              <h1 className="text-2xl font-black leading-tight">{product.name}</h1>
              <span className="shrink-0 rounded-full border border-[#D9A441]/50 bg-[#F5F5F5] px-3 py-1 text-xs font-bold text-[#111111]">
                {product.unit}
              </span>
            </div>
            <p className="mt-1 text-2xl font-black text-[#111111]">{naira(product.price)}</p>

            <div className="mt-3 flex flex-col gap-1.5 text-sm text-[#111111]/70">
              <span className="inline-flex items-center gap-2">
                <MapPin className="h-4 w-4 text-[#111111]" />
                {product.market}
              </span>
              <span className="inline-flex items-center gap-2">
                <Store className="h-4 w-4 text-[#111111]" />
                {product.seller}
                <BadgeCheck className="h-4 w-4 text-[#D9A441]" />
              </span>
            </div>

            <a
              href={waLink(enquiryMessage)}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-4 inline-flex w-full items-center justify-center gap-2 rounded-xl bg-[#D9A441] px-4 py-3 text-sm font-bold text-[#0A0A0A] shadow-md shadow-[#D9A441]/30 transition hover:bg-[#E8B93C] active:scale-[0.98]"
            >
              I&apos;M INTERESTED — CHAT ON WHATSAPP
            </a>
          </section>

          {/* Pay vendor directly */}
          <section className="rounded-2xl border-2 border-[#D9A441] bg-[#F5F5F5] p-5">
            <h2 className="flex items-center gap-2 text-sm font-black uppercase tracking-wider text-[#111111]">
              <Banknote className="h-4 w-4" />
              Pay Vendor Directly
            </h2>
            <p className="mt-1.5 text-xs text-[#111111]/70">
              Transfer the exact amount to the account below and send your receipt to the vendor on
              WhatsApp. Always pay before delivery — no cash on credit.
            </p>

            <div className="mt-4 rounded-xl bg-[#0A0A0A] p-4 text-white">
              <div className="flex items-center justify-between gap-3">
                <div>
                  <p className="text-[11px] uppercase tracking-wider text-white/60">Bank</p>
                  <p className="text-sm font-bold">{BANK.name}</p>
                </div>
                <div className="text-right">
                  <p className="text-[11px] uppercase tracking-wider text-white/60">Amount</p>
                  <p className="text-sm font-black text-[#D9A441]">{naira(product.price)}</p>
                </div>
              </div>
              <div className="mt-4 flex items-center justify-between gap-3 border-t border-white/10 pt-4">
                <div>
                  <p className="text-[11px] uppercase tracking-wider text-white/60">
                    Account Number
                  </p>
                  <p className="text-lg font-black tracking-wide text-[#D9A441]">
                    {BANK.accountNumber}
                  </p>
                  <p className="text-xs text-white/80">{BANK.accountName}</p>
                </div>
                <CopyAccount />
              </div>
            </div>

            <a
              href={waLink(enquiryMessage)}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-4 inline-flex w-full items-center justify-center gap-2 rounded-xl border-2 border-[#D9A441] px-4 py-2.5 text-sm font-bold text-[#0A0A0A] transition hover:bg-[#F5F5F5] active:scale-[0.98]"
            >
              <Send className="h-4 w-4" />
              Send Receipt on WhatsApp
            </a>
          </section>

          {/* Trust note */}
          <p className="flex items-center justify-center gap-2 text-center text-[11px] font-semibold text-[#111111]/60">
            <ShieldCheck className="h-4 w-4 text-[#D9A441]" />
            Prices verified daily at {product.market}
          </p>
        </div>
      </main>

      <BrandFooter />
      <BottomNav active="home" />
    </div>
  );
}
