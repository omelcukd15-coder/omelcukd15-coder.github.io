import type { Metadata, Viewport } from 'next';
import { Manrope, Unbounded } from 'next/font/google';
import './globals.css';

const manrope = Manrope({
  subsets: ['latin', 'cyrillic'],
  variable: '--font-manrope',
  display: 'swap',
});

const unbounded = Unbounded({
  subsets: ['latin', 'cyrillic'],
  variable: '--font-unbounded',
  display: 'swap',
});

export const metadata: Metadata = {
  title: 'VibePlay LIVE — Интерактивные игры для TikTok LIVE',
  description:
    'Многостраничная платформа и телефонное приложение с 17 интерактивными играми для стримов в TikTok LIVE. Зрители играют чатом и подарками.',
  manifest: '/manifest.json',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'black-translucent',
    title: 'VibePlay LIVE',
  },
};

export const viewport: Viewport = {
  themeColor: '#080612',
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ru" className={`${manrope.variable} ${unbounded.variable} dark`}>
      <body className="min-h-screen bg-[#080612] font-sans text-[#F8FAFC] antialiased selection:bg-[#7C3AED]/40 selection:text-white">
        {children}
      </body>
    </html>
  );
}
