'use client';

import { useState } from 'react';
import Link from 'next/link';
import {
  Banknote,
  Copy,
  Check,
  Send,
  Store,
  User,
  Phone,
  MapPin,
  ShoppingBasket,
  Loader2,
  PartyPopper,
} from 'lucide-react';
import { getSupabase } from '@/lib/supabase';
import { BANK, VENDOR_FEE, WHATSAPP_NUMBER, naira, waLink } from '@/lib/products';
import BottomNav from '@/components/bottom-nav';
import BrandLogo from '@/components/brand-logo';
import BrandFooter from '@/components/brand-footer';

type FormState = {
  stallName: string;
  ownerName: string;
  phone: string;
  market: string;
  area: string;
  sells: string;
};

const EMPTY_FORM: FormState = {
  stallName: '',
  ownerName: '',
  phone: '',
  market: '',
  area: '',
  sells: '',
};

function CopyButton({ value, label }: { value: string; label: string }) {
  const [copied, setCopied] = useState(false);

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(value);
    } catch {
      const el = document.createElement('textarea');
      el.value = value;
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
      className="inline-flex items-center gap-1.5 rounded-lg bg-[#D9A441] px-3 py-1.5 text-xs font-bold text-[#0A0A0A] transition-all hover:bg-[#E8B93C] active:scale-95"
    >
      {copied ? <Check className="h-3.5 w-3.5" /> : <Copy className="h-3.5 w-3.5" />}
      {copied ? 'Copied!' : label}
    </button>
  );
}

export default function VendorJoinPage() {
  const [form, setForm] = useState<FormState>(EMPTY_FORM);
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const set = (key: keyof FormState) => (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => setForm((f) => ({ ...f, [key]: e.target.value }));

  const receiptMessage = `Hello, I have paid ${naira(VENDOR_FEE)} for my online stall.

Stall Name: ${form.stallName || '(fill form)'}
Owner: ${form.ownerName || '(fill form)'}
Phone: ${form.phone || '(fill form)'}
Market: ${form.market || '(fill form)'}
Area: ${form.area || '(fill form)'}
What I sell: ${form.sells || '(fill form)'}

UBA BANK ${BANK.accountNumber} - ${BANK.accountName}
My receipt is attached.`;

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setError(null);
    const supabase = getSupabase();
    if (!supabase) {
      setError('We could not reach the market right now. Please try again.');
      setSubmitting(false);
      return;
    }
    const { error: err } = await supabase.from('vendor_applications').insert({
      stall_name: form.stallName.trim(),
      owner_name: form.ownerName.trim(),
      phone: form.phone.trim(),
      market: form.market.trim(),
      area: form.area.trim(),
      sells: form.sells.trim(),
    });
    if (err) {
      setError('Could not submit your application. Please try again or send your receipt on WhatsApp.');
      setSubmitting(false);
      return;
    }
    setSubmitting(false);
    setSubmitted(true);
  };

  const inputClass =
    'w-full rounded-xl border border-[#F5F5F5] bg-white py-2.5 pl-10 pr-4 text-sm text-[#111111] placeholder:text-[#111111]/50 outline-none transition focus:border-[#D9A441] focus:ring-2 focus:ring-[#D9A441]/30';

  return (
    <div className="min-h-screen bg-[#FFFFFF] pb-24 text-[#111111] antialiased">
      {/* Header */}
      <header className="bg-[#0A0A0A] text-white">
        <div className="mx-auto max-w-2xl px-4 py-5">
          <Link href="/" className="inline-flex items-center">
            <BrandLogo size="sm" priority />
          </Link>
          <BrandLogo size="md" className="mt-4" />
          <h1 className="mt-4 text-2xl font-black leading-tight sm:text-3xl">
            RENT YOUR ONLINE STALL
          </h1>
          <p className="mt-1 text-lg font-bold text-[#D9A441]">{naira(VENDOR_FEE)} / MONTH</p>
          <p className="mt-2 text-xs text-white/60">
            Sell to thousands of buyers who check prices on EGO OLE? before they buy.
          </p>
        </div>
      </header>

      <main className="mx-auto max-w-2xl px-4 py-6">
        {submitted ? (
          <section className="rounded-2xl border border-[#D9A441] bg-[#D9A441]/5 p-8 text-center">
            <PartyPopper className="mx-auto h-10 w-10 text-[#D9A441]" />
            <h2 className="mt-3 text-xl font-black">Application Received!</h2>
            <p className="mt-2 text-sm text-[#111111]/70">
              Now send your payment receipt on WhatsApp to confirm your stall. Your stall goes live
              once your {naira(VENDOR_FEE)} payment is confirmed.
            </p>
            <a
              href={waLink(receiptMessage)}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-5 inline-flex items-center gap-2 rounded-xl bg-[#D9A441] px-6 py-3 text-sm font-bold text-[#0A0A0A] shadow-md shadow-[#D9A441]/30 transition hover:bg-[#E8B93C] active:scale-[0.98]"
            >
              <Send className="h-4 w-4" />
              SEND RECEIPT ON WHATSAPP
            </a>
            <button
              onClick={() => {
                setForm(EMPTY_FORM);
                setSubmitted(false);
              }}
              className="mt-4 block w-full text-center text-xs font-semibold text-[#111111]/60 underline underline-offset-2 hover:text-[#111111]"
            >
              Submit another application
            </button>
          </section>
        ) : (
          <div className="flex flex-col gap-6">
            {/* Payment box */}
            <section className="rounded-2xl border border-[#F5F5F5] bg-white p-5 shadow-[0_2px_12px_rgba(0,0,0,0.06)]">
              <h2 className="flex items-center gap-2 text-sm font-black uppercase tracking-wider text-[#0A0A0A]">
                <Banknote className="h-4 w-4" />
                Step 1 — Pay {naira(VENDOR_FEE)}
              </h2>

              <div className="mt-4 rounded-xl bg-[#0A0A0A] p-4 text-white">
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <p className="text-[11px] uppercase tracking-wider text-white/60">Bank</p>
                    <p className="text-sm font-bold">{BANK.name}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-[11px] uppercase tracking-wider text-white/60">Amount</p>
                    <p className="text-sm font-black text-[#D9A441]">{naira(VENDOR_FEE)}</p>
                  </div>
                </div>
                <div className="mt-4 flex items-center justify-between gap-3 border-t border-white/10 pt-4">
                  <div>
                    <p className="text-[11px] uppercase tracking-wider text-white/60">Account Number</p>
                    <p className="text-lg font-black tracking-wide text-[#D9A441]">
                      {BANK.accountNumber}
                    </p>
                    <p className="text-xs text-white/80">{BANK.accountName}</p>
                  </div>
                  <CopyButton value={BANK.accountNumber} label="Copy" />
                </div>
              </div>
            </section>

            {/* Application form */}
            <section className="rounded-2xl border border-[#F5F5F5] bg-white p-5 shadow-[0_2px_12px_rgba(0,0,0,0.06)]">
              <h2 className="text-sm font-black uppercase tracking-wider text-[#0A0A0A]">
                Step 2 — Tell us about your stall
              </h2>

              <form onSubmit={submit} className="mt-4 flex flex-col gap-3">
                <label className="relative block">
                  <Store className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#111111]/60" />
                  <span className="sr-only">Stall name</span>
                  <input
                    required
                    value={form.stallName}
                    onChange={set('stallName')}
                    placeholder="Stall Name (e.g. Mama Nkechi Foodstuff)"
                    className={inputClass}
                  />
                </label>

                <label className="relative block">
                  <User className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#111111]/60" />
                  <span className="sr-only">Owner name</span>
                  <input
                    required
                    value={form.ownerName}
                    onChange={set('ownerName')}
                    placeholder="Owner Name"
                    className={inputClass}
                  />
                </label>

                <label className="relative block">
                  <Phone className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#111111]/60" />
                  <span className="sr-only">Phone number</span>
                  <input
                    required
                    type="tel"
                    value={form.phone}
                    onChange={set('phone')}
                    placeholder="Phone Number (WhatsApp)"
                    className={inputClass}
                  />
                </label>

                <label className="relative block">
                  <MapPin className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#111111]/60" />
                  <span className="sr-only">Market</span>
                  <input
                    required
                    value={form.market}
                    onChange={set('market')}
                    placeholder="Market (e.g. Market Eke Awka)"
                    className={inputClass}
                  />
                </label>

                <label className="relative block">
                  <MapPin className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#111111]/60" />
                  <span className="sr-only">Area</span>
                  <input
                    required
                    value={form.area}
                    onChange={set('area')}
                    placeholder="Area (e.g. Awka, Anambra)"
                    className={inputClass}
                  />
                </label>

                <label className="relative block">
                  <ShoppingBasket className="pointer-events-none absolute left-3 top-3 h-4 w-4 text-[#111111]/60" />
                  <span className="sr-only">What you sell</span>
                  <textarea
                    required
                    rows={3}
                    value={form.sells}
                    onChange={set('sells')}
                    placeholder="What you sell (e.g. Garri, rice, beans, palm oil...)"
                    className={`${inputClass} resize-none`}
                  />
                </label>

                {error && (
                  <p className="rounded-lg bg-[#F5F5F5] px-3 py-2 text-xs font-semibold text-[#0A0A0A]">
                    {error}
                  </p>
                )}

                <button
                  type="submit"
                  disabled={submitting}
                  className="mt-1 inline-flex items-center justify-center gap-2 rounded-xl bg-[#D9A441] px-6 py-3 text-sm font-bold text-[#0A0A0A] shadow-md shadow-[#D9A441]/30 transition hover:bg-[#E8B93C] active:scale-[0.98] disabled:opacity-60"
                >
                  {submitting ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      Submitting...
                    </>
                  ) : (
                    'SUBMIT APPLICATION'
                  )}
                </button>
              </form>
            </section>

            {/* Step 3 */}
            <section className="rounded-2xl border border-[#F5F5F5] bg-white p-5 shadow-[0_2px_12px_rgba(0,0,0,0.06)]">
              <h2 className="text-sm font-black uppercase tracking-wider text-[#0A0A0A]">
                Step 3 — Send your receipt
              </h2>
              <p className="mt-2 text-sm text-[#111111]/70">
                After payment, send your receipt on WhatsApp to{' '}
                <span className="font-bold text-[#111111]">{WHATSAPP_NUMBER}</span>. Include your
                stall name so we can match your payment fast.
              </p>
              <a
                href={waLink('Hello, I want to rent an online stall on EGO OLE?.')}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-4 inline-flex items-center gap-2 rounded-xl border-2 border-[#D9A441] px-5 py-2.5 text-sm font-bold text-[#0A0A0A] transition hover:bg-[#D9A441]/10 active:scale-[0.98]"
              >
                <Send className="h-4 w-4" />
                Send Receipt on WhatsApp to {WHATSAPP_NUMBER}
              </a>
            </section>
          </div>
        )}
      </main>

      <BrandFooter />
      <BottomNav active="vendor" />
    </div>
  );
}
