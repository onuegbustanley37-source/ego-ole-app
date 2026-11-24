export type Category = 'All' | 'Foodstuff' | 'Vegetables' | 'Provisions';

export type Product = {
  id: string;
  name: string;
  unit: string;
  price: number;
  category: Exclude<Category, 'All'>;
  market: string;
  seller: string;
  image: string;
};

export const PRODUCTS: Product[] = [
  {
    id: 'garri',
    name: 'Garri Yellow',
    unit: '1 Paint',
    price: 2500,
    category: 'Foodstuff',
    market: 'Market Eke Awka',
    seller: 'Mama Nkechi',
    image: 'https://images.unsplash.com/photo-1586201375761-83865001e31c?w=800',
  },
  {
    id: 'rice',
    name: 'Rice',
    unit: '1 Paint',
    price: 4500,
    category: 'Provisions',
    market: 'Market Eke Awka',
    seller: 'Mama Nkechi',
    image: 'https://images.unsplash.com/photo-1516684732162-798a0062be99?w=800',
  },
  {
    id: 'tomatoes',
    name: 'Tomatoes',
    unit: '1 Basket',
    price: 8000,
    category: 'Vegetables',
    market: 'Market Eke Awka',
    seller: 'Mama Nkechi',
    image: 'https://images.unsplash.com/photo-1592924357228-91a4daadcfea?w=800',
  },
  {
    id: 'onions',
    name: 'Onions',
    unit: '1 Basket',
    price: 6000,
    category: 'Vegetables',
    market: 'Market Eke Awka',
    seller: 'Mama Nkechi',
    image: 'https://images.unsplash.com/photo-1518977956812-cd3dbadaaf31?w=800',
  },
  {
    id: 'yam',
    name: 'Yam',
    unit: '1 Tuber',
    price: 3500,
    category: 'Foodstuff',
    market: 'Market Eke Awka',
    seller: 'Mama Nkechi',
    image: 'https://images.unsplash.com/photo-1598964350274-5dc9e8a51e84?w=800',
  },
  {
    id: 'palm-oil',
    name: 'Palm Oil',
    unit: '1 Bottle',
    price: 1800,
    category: 'Foodstuff',
    market: 'Market Eke Awka',
    seller: 'Mama Nkechi',
    image: 'https://images.unsplash.com/photo-1474979266404-7eaacbcd87c5?w=800',
  },
];

export const CATEGORIES: Category[] = ['All', 'Foodstuff', 'Vegetables', 'Provisions'];

export function getProduct(id: string): Product | undefined {
  return PRODUCTS.find((p) => p.id === id);
}

export const naira = (n: number) => `₦${n.toLocaleString('en-NG')}`;

export const BANK = {
  name: 'UBA BANK',
  accountNumber: '2087484005',
  accountName: 'Stanley Onuegbu',
};

export const VENDOR_FEE = 2000;

export const WHATSAPP_NUMBER = '08161280254';

export function waLink(message: string): string {
  return `https://wa.me/234${WHATSAPP_NUMBER.replace(/^0/, '')}?text=${encodeURIComponent(message)}`;
}
