import type { Metadata, Viewport } from 'next';
import { Onest, Playfair_Display } from 'next/font/google';
import type { ReactNode } from 'react';
import './globals.css';
import { IconSprite } from '@/components/Icon';
import { Providers } from '@/components/providers';
import { Header, PromoBar } from '@/components/chrome/Header';
import { MegaMenu } from '@/components/chrome/MegaMenu';
import { SearchPanel } from '@/components/chrome/SearchPanel';
import { CartDrawer, FavDrawer } from '@/components/chrome/Drawers';
import { Footer } from '@/components/chrome/Footer';
import { ChatWidget, CookieBanner, TabBar } from '@/components/chrome/Widgets';
import { RevealObserver } from '@/components/ui/RevealObserver';
import { CONFIG, PROMO_BAR } from '@/lib/data';
import { SITE_URL } from '@/lib/site';

const onest = Onest({ subsets: ['latin', 'cyrillic'], variable: '--font-onest', display: 'swap' });
const playfair = Playfair_Display({ subsets: ['latin', 'cyrillic'], style: ['normal', 'italic'], variable: '--font-playfair', display: 'swap' });

const TITLE = 'Korea Secret — корейская косметика в Душанбе: уход, SPF и макияж';
const DESC = `Korea Secret — магазин оригинальной корейской косметики в Душанбе: тонеры, сыворотки, санскрины, кушоны и подарочные наборы. Бесплатная доставка по Душанбе от ${CONFIG.freeShipping} ${CONFIG.currency}.`;

export const viewport: Viewport = { themeColor: '#dd4487', width: 'device-width', initialScale: 1, viewportFit: 'cover' };

export const metadata: Metadata = {
  metadataBase: new URL(`${SITE_URL}/`),
  title: { default: TITLE, template: '%s — Korea Secret' },
  description: DESC,
  applicationName: 'Korea Secret',
  openGraph: { type: 'website', siteName: 'Korea Secret', locale: 'ru_TJ', title: TITLE, description: DESC, images: [{ url: `${SITE_URL}/ks-logo.png`, width: 640, height: 640, alt: 'Korea Secret' }] }
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="ru" className={`${onest.variable} ${playfair.variable}${PROMO_BAR.enabled ? ' has-promo' : ''}`} data-scroll-behavior="smooth">
      <body>
        <IconSprite />
        <Providers>
          <a className="skip-link" href="#main">Перейти к содержимому</a>
          <PromoBar />
          <Header />
          <main id="main">{children}</main>
          <Footer />
          <MegaMenu />
          <SearchPanel />
          <CartDrawer />
          <FavDrawer />
          <TabBar />
          <ChatWidget />
          <CookieBanner />
          <RevealObserver />
        </Providers>
        <noscript><style>{'.reveal{opacity:1!important;transform:none!important}'}</style></noscript>
      </body>
    </html>
  );
}
