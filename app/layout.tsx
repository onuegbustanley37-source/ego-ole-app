import './globals.css';
import type { Metadata } from 'next';
import { Inter } from 'next/font/google';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'EGO OLE? — Know Before You Buy',
  description:
    'Compare real market prices before you buy. Garri, rice, tomatoes and more — verified daily from Market Eke Awka.',
  viewport: {
    width: 'device-width',
    initialScale: 1,
  },
  themeColor: '#0A0A0A',
  icons: {
    icon: '/images/EGO_OLE_LOGO_2.jpeg',
    apple: '/images/EGO_OLE_LOGO_2.jpeg',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={inter.className}>{children}</body>
    </html>
  );
}
