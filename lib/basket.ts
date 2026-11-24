import type { StallProduct } from '@/lib/stalls';

export type BasketItem = Pick<StallProduct, 'id' | 'name' | 'price' | 'price_varies' | 'unit' | 'image_url'> & {
  stallName: string;
  quantity: number;
};

const BASKET_KEY = 'ego-ole-basket';

export function readBasket(): BasketItem[] {
  if (typeof window === 'undefined') return [];
  const raw = window.localStorage.getItem(BASKET_KEY);
  if (!raw) return [];
  try {
    const parsed: unknown = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    return parsed as BasketItem[];
  } catch {
    return [];
  }
}

export function writeBasket(items: BasketItem[]): void {
  window.localStorage.setItem(BASKET_KEY, JSON.stringify(items));
  window.dispatchEvent(new Event('ego-basket-updated'));
}

export function addToBasket(product: StallProduct, stallName: string): BasketItem[] {
  const current = readBasket();
  const existing = current.find((item) => item.id === product.id);
  if (existing) {
    existing.quantity += 1;
    writeBasket(current);
    return current;
  }

  const next = [
    ...current,
    {
      id: product.id,
      name: product.name,
      price: product.price,
      price_varies: product.price_varies,
      unit: product.unit,
      image_url: product.image_url,
      stallName,
      quantity: 1,
    },
  ];
  writeBasket(next);
  return next;
}
