export type Stall = {
  id: string;
  slug: string;
  brand_name: string;
  location: string;
  category: string;
  contact: string;
  rating: number;
  item_count: number;
  verified: boolean;
  cover_image_url: string | null;
};

export type StallProduct = {
  id: string;
  stall_id: string;
  name: string;
  price: number | null;
  price_varies: boolean;
  unit: string;
  category: string;
  description: string;
  image_url: string | null;
  created_at: string;
};

export const JOSSY_SLUG = 'jossy-cakes';

export function productPriceLabel(product: Pick<StallProduct, 'price' | 'price_varies'>): string {
  if (product.price_varies || product.price === null) return 'Price Varies';
  return `₦${Number(product.price).toLocaleString('en-NG')}`;
}

export function vendorWhatsAppLink(contact: string, message: string): string {
  const normalized = contact.replace(/\D/g, '').replace(/^234/, '').replace(/^0/, '');
  return `https://wa.me/234${normalized}?text=${encodeURIComponent(message)}`;
}
