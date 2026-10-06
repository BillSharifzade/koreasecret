'use client';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useEffect, useRef, useState } from 'react';
import { Butterfly, Mark } from '../Brand';
import { Icon } from '../Icon';
import { useUI } from '../providers';
import GlassSurface, { GLASS } from '../ui/GlassSurface';
import { useBackdropTone } from '../ui/useBackdropTone';
import { AccountModal, CityModal } from './modals';
import { SmartLink } from '../ui/SmartLink';
import { CONFIG, NAV, PROMO_BAR, SETTINGS, TEXTS } from '@/lib/data';
import { useShop } from '@/lib/store';

/** Announcement bar — rendered only while PROMO_BAR.enabled (to be switched from the admin panel). */
export function PromoBar() {
  const ui = useUI();
  const [tick, setTick] = useState(0);
  const msgs = PROMO_BAR.messages;
  const on = PROMO_BAR.enabled && msgs.length > 0;
  // the header offset follows the bar (it can be switched on and off in the admin's live preview)
  useEffect(() => { document.documentElement.classList.toggle('has-promo', on); }, [on]);
  useEffect(() => {
    if (!on || msgs.length < 2 || window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    const t = window.setInterval(() => setTick((n) => n + 1), 4200);
    return () => window.clearInterval(t);
  }, [on, msgs.length]);
  if (!on) return null;
  const cur = tick % msgs.length, prev = tick > 0 ? (tick - 1) % msgs.length : -1;
  return (
    <div className="promo-bar">
      <div className="promo-bar__track">
        {msgs.map((m, i) => {
          const [a, b] = m.text.split('{code}');
          return (
            <div key={i} className={`promo-bar__msg${i === cur ? ' is-active' : ''}${i === prev ? ' is-leaving' : ''}`} aria-hidden={i !== cur}>
              {a}
              {m.code && <button className="promo-bar__code" type="button" tabIndex={i === cur ? 0 : -1} onClick={() => ui.copyPromo(m.code!)}>{m.code}</button>}
              {b}
            </div>
          );
        })}
      </div>
    </div>
  );
}

export function Header() {
  const ui = useUI();
  const pathname = usePathname();
  const isHome = pathname === '/';
  const ref = useRef<HTMLElement>(null);
  const [compact, setCompact] = useState(false);
  const cartCount = useShop((s) => s.cart.reduce((n, it) => n + it.q, 0));
  const favCount = useShop((s) => s.fav.length);
  const city = useShop((s) => s.city) || CONFIG.cities[0];
  const megaOpen = ui.overlay === 'mega';
  const searchOpen = ui.overlay === 'search';
  // the ink follows whatever is behind the glass; an open menu or search slides a white panel under it
  const backdrop = useBackdropTone(ref, { force: megaOpen || searchOpen ? 'light' : undefined });

  // morph into the compact bar as soon as the page starts scrolling
  useEffect(() => {
    let raf = 0;
    const read = () => { raf = 0; setCompact(window.scrollY > 4); };
    const on = () => { if (!raf) raf = requestAnimationFrame(read); };
    read();
    window.addEventListener('scroll', on, { passive: true });
    return () => { window.removeEventListener('scroll', on); cancelAnimationFrame(raf); };
  }, []);

  const badge = (n: number, bumps: number) => <span key={bumps} className={`header__badge${n > 0 ? ' is-visible' : ''}${bumps > 0 && n > 0 ? ' is-bump' : ''}`}>{n > 99 ? '99+' : n || ''}</span>;
  const search = (cls: string) => (
    <button className={`header__action ${cls}${searchOpen ? ' is-active' : ''}`} type="button" aria-label={searchOpen ? 'Закрыть поиск' : 'Поиск'} aria-expanded={searchOpen} aria-controls="search" onClick={() => ui.toggle('search')}>
      <Icon name="search" className="i-search" /><Icon name="close" className="i-close" />
    </button>
  );

  return (
    <div className={`header-wrap${isHome ? ' header-wrap--overlay' : ''}`}>
      <GlassSurface
        {...GLASS}
        as="header"
        ref={ref}
        id="siteHeader"
        className={`header${compact ? ' is-compact' : ''}`}
        width="auto"
        height="auto"
        tone={backdrop}
        data-backdrop={backdrop}
      >
        <div className="header__top">
          <div className="header__left">
            <button className="header__burger" type="button" aria-label="Меню" aria-expanded={megaOpen} onClick={() => ui.toggle('mega')}><Icon name={megaOpen ? 'close' : 'menu'} /></button>
            {search('header__action--search header__action--mobile')}
            <button className="header__geo" type="button" onClick={() => ui.openModal(<CityModal />, { label: 'Ваш город' })}><Icon name="pin" /><span>{city}</span></button>
            <div className="header__catalog-wrap">
              <button className="header__catalog" type="button" aria-expanded={megaOpen} aria-controls="mega" onClick={() => ui.toggle('mega')}>
                <Icon name={megaOpen ? 'close' : 'menu'} /><span>Каталог</span>
              </button>
            </div>
          </div>
          <div className="header__center">
            <Link className="logo" href="/" aria-label={`${SETTINGS.name} — на главную`}>
              <Mark />
              <span className="logo__word">{SETTINGS.name}<Butterfly className="logo__bfly" /></span>
            </Link>
          </div>
          <div className="header__right">
            {search('header__action--search header__action--desktop')}
            <button className="header__action header__action--fav" type="button" aria-label="Избранное" onClick={() => ui.open('fav')}><Icon name="heart" />{badge(favCount, ui.bump.fav)}</button>
            <button className="header__action" type="button" aria-label="Корзина" onClick={() => ui.open('cart')}><Icon name="bag" />{badge(cartCount, ui.bump.cart)}</button>
            <button className="header__action header__action--account" type="button" aria-label="Профиль" onClick={() => ui.openModal(<AccountModal />, { label: TEXTS.account.title })}><Icon name="user" /></button>
          </div>
        </div>
        <div className="header__fold">
          <div className="header__bottom">
            <nav className="header__nav" aria-label="Основная навигация">
              {NAV.map((n, i) => <SmartLink key={i} href={n.href} className={n.accent ? 'is-accent' : undefined}>{n.label}</SmartLink>)}
            </nav>
          </div>
        </div>
      </GlassSurface>
    </div>
  );
}
