import type { Metadata, Viewport } from 'next';
import { Onest, Playfair_Display } from 'next/font/google';
import { notFound } from 'next/navigation';
import type { ReactNode } from 'react';
import '../globals.css';
import { IconSprite } from '@/components/Icon';
import { Providers } from '@/components/providers';
import { Header, PromoBar } from '@/components/chrome/Header';
import { MegaMenu } from '@/components/chrome/MegaMenu';
import { SearchOverlay } from '@/components/chrome/SearchOverlay';
import { CartDrawer, FavDrawer } from '@/components/chrome/Drawers';
import { Footer } from '@/components/chrome/Footer';
import { ChatWidget, CookieBanner, TabBar } from '@/components/chrome/Widgets';
import { RevealObserver } from '@/components/ui/RevealObserver';
import { isLang, LANGS, translator } from '@/lib/i18n';
import { SITE_URL } from '@/lib/site';

const onest = Onest({ subsets: ['latin', 'cyrillic'], variable: '--font-onest', display: 'swap' });
const playfair = Playfair_Display({ subsets: ['latin', 'cyrillic'], style: ['normal', 'italic'], variable: '--font-playfair', display: 'swap' });

export const dynamicParams = false;
export function generateStaticParams() {
  return LANGS.map((lang) => ({ lang }));
}

export const viewport: Viewport = { themeColor: '#dd4487', width: 'device-width', initialScale: 1, viewportFit: 'cover' };

export async function generateMetadata({ params }: { params: Promise<{ lang: string }> }): Promise<Metadata> {
  const { lang } = await params;
  const tr = translator(isLang(lang) ? lang : 'ru');
  return {
    metadataBase: new URL(`${SITE_URL}/`),
    title: { default: tr.t('meta.title'), template: '%s — Korea Secret' },
    description: tr.t('meta.desc'),
    applicationName: 'Korea Secret',
    alternates: { languages: { ru: `${SITE_URL}/ru/`, en: `${SITE_URL}/en/` } },
    openGraph: { type: 'website', siteName: 'Korea Secret', locale: lang === 'en' ? 'en_US' : 'ru_RU', title: tr.t('meta.title'), description: tr.t('meta.desc'), images: [{ url: `${SITE_URL}/ks-logo.png`, width: 640, height: 640, alt: 'Korea Secret' }] }
  };
}

export default async function LangLayout({ children, params }: { children: ReactNode; params: Promise<{ lang: string }> }) {
  const { lang } = await params;
  if (!isLang(lang)) notFound();
  const tr = translator(lang);
  return (
    <html lang={lang} className={`${onest.variable} ${playfair.variable}`} data-scroll-behavior="smooth">
      <body>
        <IconSprite />
        <Providers lang={lang}>
          <a className="skip-link" href="#main">{tr.t('skip')}</a>
          <PromoBar />
          <Header />
          <main id="main">{children}</main>
          <Footer />
          <MegaMenu />
          <SearchOverlay />
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
