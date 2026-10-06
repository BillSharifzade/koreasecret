import type { Metadata, Viewport } from 'next';
import { Onest, Playfair_Display } from 'next/font/google';
import type { ReactNode } from 'react';
import './globals.css';
import { IconSprite } from '@/components/Icon';
import { fill, PROMO_BAR, SEO, SETTINGS, THEME } from '@/lib/data';
import { SITE_URL } from '@/lib/site';
import { isHex, themeCss } from '@/lib/theme';

const onest = Onest({ subsets: ['latin', 'cyrillic'], variable: '--font-onest', display: 'swap' });
const playfair = Playfair_Display({ subsets: ['latin', 'cyrillic'], style: ['normal', 'italic'], variable: '--font-playfair', display: 'swap' });

export const viewport: Viewport = { themeColor: isHex(THEME.brand) ? THEME.brand : '#dd4487', width: 'device-width', initialScale: 1, viewportFit: 'cover' };

export const metadata: Metadata = {
  metadataBase: new URL(`${SITE_URL}/`),
  title: { default: SEO.title, template: `%s — ${SETTINGS.name}` },
  description: fill(SEO.description),
  applicationName: SETTINGS.name,
  openGraph: { type: 'website', siteName: SETTINGS.name, locale: 'ru_TJ', title: SEO.title, description: fill(SEO.description), images: [{ url: `${SITE_URL}/ks-logo.png`, width: 640, height: 640, alt: SETTINGS.name }] }
};

/* The shared document: fonts, the icon sprite and the brand colour. The storefront chrome lives in (site)/layout,
   the admin panel brings its own in admin/layout. */
export default function RootLayout({ children }: { children: ReactNode }) {
  const theme = themeCss(THEME.brand);
  return (
    <html lang="ru" className={`${onest.variable} ${playfair.variable}${PROMO_BAR.enabled ? ' has-promo' : ''}`} data-scroll-behavior="smooth">
      <body>
        {theme && <style id="ks-theme" dangerouslySetInnerHTML={{ __html: theme }} />}
        <IconSprite />
        {children}
      </body>
    </html>
  );
}
