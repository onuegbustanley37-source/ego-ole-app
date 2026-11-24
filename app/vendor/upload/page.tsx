'use client';
 const supabase = getSupabase()!;
import { ChangeEvent, FormEvent, useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { ImagePlus, Loader2, Pencil, Save, Trash2, Upload, X } from 'lucide-react';
import { getSupabase } from '@/lib/supabase';
import { type StallProduct, productPriceLabel } from '@/lib/stalls';
import BottomNav from '@/components/bottom-nav';
import BrandFooter from '@/components/brand-footer';
import BrandLogo from '@/components/brand-logo';
import ProductPhoto from '@/components/product-photo';

const ACCESS_KEY_STORAGE = 'ego-jossy-vendor-access-key';
const PRODUCT_IDS_STORAGE = 'ego-jossy-vendor-product-ids';

const EMPTY_FORM = {
  name: '',
  price: '',
  priceVaries: true,
  unit: 'per cake',
  category: 'Cakes',
  description: '',
  imageUrl: '',
};

type UploadForm = typeof EMPTY_FORM;

function getAccessKey(): string {
  const existing = window.localStorage.getItem(ACCESS_KEY_STORAGE);
  if (existing) return existing;
  const created = `${crypto.randomUUID()}${crypto.randomUUID()}`;
  window.localStorage.setItem(ACCESS_KEY_STORAGE, created);
  return created;
}

function getOwnedIds(): string[] {
  if (typeof window === 'undefined') return [];
  const raw = window.localStorage.getItem(PRODUCT_IDS_STORAGE);
  if (!raw) return [];
  try {
    const parsed: unknown = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed.filter((id): id is string => typeof id === 'string') : [];
  } catch {
    return [];
  }
}

function saveOwnedId(id: string): void {
  const ids = new Set(getOwnedIds());
  ids.add(id);
  window.localStorage.setItem(PRODUCT_IDS_STORAGE, JSON.stringify(Array.from(ids)));
}

function removeOwnedId(id: string): void {
  window.localStorage.setItem(PRODUCT_IDS_STORAGE, JSON.stringify(getOwnedIds().filter((item) => item !== id)));
}

export default function VendorUploadPage() {
  const [form, setForm] = useState<UploadForm>(EMPTY_FORM);
  const [ownedProducts, setOwnedProducts] = useState<StallProduct[]>([]);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [loadingItems, setLoadingItems] = useState(true);
  const [saving, setSaving] = useState(false);
  const [notice, setNotice] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const ownedIdSet = useMemo(() => new Set(getOwnedIds()), [ownedProducts]);

  const loadOwnedProducts = async () => {
    const ids = getOwnedIds();
    if (ids.length === 0) {
      setOwnedProducts([]);
      setLoadingItems(false);
      return;
    }

    const { data } = await supabase
      .from('stall_products')
      .select('id, stall_id, name, price, price_varies, unit, category, description, image_url, created_at')
      .in('id', ids)
      .order('created_at', { ascending: false });

    setOwnedProducts((data ?? []) as StallProduct[]);
    setLoadingItems(false);
  };

  useEffect(() => {
    getAccessKey();
    void loadOwnedProducts();
  }, []);

  const setField = (key: keyof UploadForm, value: string | boolean) => {
    setForm((current) => ({ ...current, [key]: value }));
  };

  const selectImage = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith('image/')) {
      setError('Please choose an image file.');
      return;
    }
    if (file.size > 1800000) {
      setError('Please choose an image smaller than 1.8MB.');
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === 'string') setField('imageUrl', reader.result);
    };
    reader.readAsDataURL(file);
  };

  const resetForm = () => {
    setForm(EMPTY_FORM);
    setEditingId(null);
  };

  const submit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setSaving(true);
    setError(null);
    setNotice(null);

    const supabase = getSupabase();
    if (!supabase) {
      setError('We could not reach the market right now. Please try again.');
      setSaving(false);
      return;
    }

    const price = form.price ? Number(form.price) : null;
    const params = {
      p_access_key: getAccessKey(),
      p_name: form.name.trim(),
      p_price: price,
      p_price_varies: form.priceVaries,
      p_unit: form.unit,
      p_category: form.category.trim(),
      p_description: form.description.trim(),
      p_image_url: form.imageUrl || null,
    };

    const result = editingId
      ? await supabase.rpc('update_jossy_product', { ...params, p_product_id: editingId })
      : await supabase.rpc('create_jossy_product', params);

    if (result.error || (editingId && result.data !== true)) {
      setError('We could not save this product. Please check the fields and try again.');
      setSaving(false);
      return;
    }

    if (!editingId && typeof result.data === 'string') saveOwnedId(result.data);
    await loadOwnedProducts();
    setSaving(false);
    setNotice(editingId ? 'Product updated.' : 'Product added to Jossy’s stall.');
    resetForm();
  };

  const editProduct = (product: StallProduct) => {
    setEditingId(product.id);
    setForm({
      name: product.name,
      price: product.price === null ? '' : String(product.price),
      priceVaries: product.price_varies,
      unit: product.unit,
      category: product.category,
      description: product.description,
      imageUrl: product.image_url ?? '',
    });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const deleteProduct = async (product: StallProduct) => {
    if (!window.confirm(`Delete ${product.name} from your stall?`)) return;
    setError(null);
    const supabase = getSupabase();
    if (!supabase) {
      setError('We could not reach the market right now. Please try again.');
      return;
    }
    const { data, error: deleteError } = await supabase.rpc('delete_jossy_product', {
      p_access_key: getAccessKey(),
      p_product_id: product.id,
    });
    if (deleteError || data !== true) {
      setError('We could not delete this product. Please try again.');
      return;
    }
    removeOwnedId(product.id);
    setOwnedProducts((current) => current.filter((item) => item.id !== product.id));
    setNotice('Product deleted.');
  };

  const inputClass = 'w-full rounded-xl border border-[#F5F5F5] bg-[#FFFFFF] px-4 py-3 text-sm text-[#111111] placeholder:text-[#111111]/45 outline-none transition focus:border-[#D9A441] focus:ring-2 focus:ring-[#D9A441]/25';

  return (
    <div className="min-h-screen bg-[#FFFFFF] pb-24 text-[#111111] antialiased">
      <header className="bg-[#0A0A0A] text-white">
        <div className="mx-auto flex max-w-2xl items-center justify-between px-4 py-4">
          <Link href="/stall/jossy-cakes" className="text-xs font-bold text-white underline decoration-[#D9A441] underline-offset-4">
            ← Jossy stall
          </Link>
          <BrandLogo size="sm" priority />
          <span className="w-16" />
        </div>
      </header>

      <main className="mx-auto max-w-2xl px-4 py-6">
        <section className="rounded-3xl bg-[#0A0A0A] p-5 text-white sm:p-7">
          <p className="text-[10px] font-black uppercase tracking-[0.2em] text-[#E8B93C]">Vendor system</p>
          <h1 className="mt-2 text-2xl font-black leading-tight">Add products to JOSSY CAKES AND KITCHEN HUB</h1>
          <p className="mt-2 text-sm leading-6 text-white/65">
            Add a product once and it appears immediately inside your stall and in the home stall preview.
          </p>
        </section>

        <section className="mt-5 rounded-2xl border border-[#F5F5F5] border-t-2 border-t-[#D9A441] bg-[#FFFFFF] p-5 shadow-[0_2px_12px_rgba(0,0,0,0.06)]">
          <div className="flex items-center justify-between gap-3">
            <h2 className="text-sm font-black uppercase tracking-wider">{editingId ? 'Edit product' : 'New product'}</h2>
            {editingId && (
              <button onClick={resetForm} className="inline-flex items-center gap-1 text-xs font-bold text-[#111111]/60 hover:text-[#111111]">
                <X className="h-4 w-4" /> Cancel
              </button>
            )}
          </div>

          <form onSubmit={submit} className="mt-5 flex flex-col gap-4">
            <label className="block">
              <span className="mb-1.5 block text-xs font-bold">Product Picture</span>
              <span className="flex min-h-28 cursor-pointer items-center justify-center overflow-hidden rounded-xl border border-dashed border-[#D9A441] bg-[#F5F5F5]">
                {form.imageUrl ? (
                  <span className="relative block h-36 w-full">
                    <ProductPhoto src={form.imageUrl} alt="Selected product preview" sizes="600px" />
                  </span>
                ) : (
                  <span className="flex items-center gap-2 text-xs font-bold text-[#111111]/60">
                    <ImagePlus className="h-5 w-5 text-[#D9A441]" /> Choose a product photo
                  </span>
                )}
                <input type="file" accept="image/*" onChange={selectImage} className="sr-only" />
              </span>
            </label>

            <label className="block">
              <span className="mb-1.5 block text-xs font-bold">Product Name</span>
              <input required value={form.name} onChange={(event) => setField('name', event.target.value)} className={inputClass} placeholder="e.g. Red Velvet Cake" />
            </label>

            <div className="grid gap-4 sm:grid-cols-2">
              <label className="block">
                <span className="mb-1.5 block text-xs font-bold">Price</span>
                <input type="number" min="0" step="1" disabled={form.priceVaries} value={form.price} onChange={(event) => setField('price', event.target.value)} className={`${inputClass} disabled:bg-[#F5F5F5] disabled:text-[#111111]/45`} placeholder="Amount in naira" />
              </label>
              <label className="flex items-end gap-2 pb-3 text-xs font-bold">
                <input type="checkbox" checked={form.priceVaries} onChange={(event) => setField('priceVaries', event.target.checked)} className="h-4 w-4 accent-[#D9A441]" />
                Price Varies
              </label>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <label className="block">
                <span className="mb-1.5 block text-xs font-bold">Unit</span>
                <select value={form.unit} onChange={(event) => setField('unit', event.target.value)} className={inputClass}>
                  <option value="per cake">per cake</option>
                  <option value="per box">per box</option>
                  <option value="per pack">per pack</option>
                  <option value="per portion">per portion</option>
                  <option value="per tray">per tray</option>
                </select>
              </label>
              <label className="block">
                <span className="mb-1.5 block text-xs font-bold">Category</span>
                <input required value={form.category} onChange={(event) => setField('category', event.target.value)} className={inputClass} placeholder="Cakes" />
              </label>
            </div>

            <label className="block">
              <span className="mb-1.5 block text-xs font-bold">Description</span>
              <textarea required rows={4} value={form.description} onChange={(event) => setField('description', event.target.value)} className={`${inputClass} resize-none`} placeholder="Tell buyers what makes this product special" />
            </label>

            {error && <p className="rounded-xl bg-[#F5F5F5] px-4 py-3 text-xs font-bold text-[#111111]">{error}</p>}
            {notice && <p className="rounded-xl border border-[#D9A441] bg-[#F5F5F5] px-4 py-3 text-xs font-bold text-[#111111]">{notice}</p>}

            <button disabled={saving} className="inline-flex items-center justify-center gap-2 rounded-xl bg-[#D9A441] px-5 py-3 text-sm font-black text-[#0A0A0A] transition hover:bg-[#E8B93C] disabled:opacity-55">
              {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : editingId ? <Save className="h-4 w-4" /> : <Upload className="h-4 w-4" />}
              {saving ? 'Saving...' : editingId ? 'Save Changes' : 'Add Product'}
            </button>
          </form>
        </section>

        <section className="mt-8">
          <div className="flex items-end justify-between gap-3">
            <div>
              <p className="text-[10px] font-black uppercase tracking-[0.2em] text-[#D9A441]">Your uploads</p>
              <h2 className="mt-1 text-xl font-black">Manage your products</h2>
            </div>
            <Link href="/stall/jossy-cakes" className="text-xs font-bold text-[#111111] underline decoration-[#D9A441] underline-offset-4">View stall</Link>
          </div>

          {loadingItems ? (
            <p className="mt-5 text-sm text-[#111111]/60">Loading your uploads...</p>
          ) : ownedProducts.length === 0 ? (
            <div className="mt-4 rounded-2xl border border-dashed border-[#D9A441] p-7 text-center text-sm text-[#111111]/60">Your uploaded products will appear here.</div>
          ) : (
            <div className="mt-4 flex flex-col gap-3">
              {ownedProducts.filter((product) => ownedIdSet.has(product.id)).map((product) => (
                <article key={product.id} className="flex items-center gap-3 rounded-2xl border border-[#F5F5F5] bg-[#FFFFFF] p-3 shadow-[0_2px_12px_rgba(0,0,0,0.05)]">
                  <div className="relative h-16 w-16 shrink-0 overflow-hidden rounded-xl bg-[#F5F5F5]">
                    <ProductPhoto src={product.image_url} alt={product.name} sizes="64px" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <h3 className="truncate text-sm font-black">{product.name}</h3>
                    <p className="mt-1 text-xs font-semibold text-[#111111]/60">{productPriceLabel(product)} · {product.unit}</p>
                  </div>
                  <div className="flex shrink-0 gap-1">
                    <button onClick={() => editProduct(product)} aria-label={`Edit ${product.name}`} className="rounded-lg p-2 text-[#111111] transition hover:bg-[#F5F5F5]"><Pencil className="h-4 w-4" /></button>
                    <button onClick={() => void deleteProduct(product)} aria-label={`Delete ${product.name}`} className="rounded-lg p-2 text-[#111111] transition hover:bg-[#F5F5F5]"><Trash2 className="h-4 w-4" /></button>
                  </div>
                </article>
              ))}
            </div>
          )}
        </section>
      </main>

      <BrandFooter />
      <BottomNav active="vendor" />
    </div>
  );
}
