import type { ReactNode } from 'react';
import { ContentRoot } from './ContentRoot';
import { Providers } from './providers';
import { Header, PromoBar } from './chrome/Header';
import { MegaMenu } from './chrome/MegaMenu';
import { SearchPanel } from './chrome/SearchPanel';
import { CartDrawer, FavDrawer } from './chrome/Drawers';
import { Footer } from './chrome/Footer';
import { ChatWidget, CookieBanner, TabBar } from './chrome/Widgets';
import { RevealObserver } from './ui/RevealObserver';

/** The storefront around a page: header, menus, drawers, footer and floating widgets. */
export function SiteShell({ children }: { children: ReactNode }) {
  return (
    <Providers>
      <ContentRoot>
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
      </ContentRoot>
      <RevealObserver />
      <noscript><style>{'.reveal{opacity:1!important;transform:none!important}'}</style></noscript>
    </Providers>
  );
}
