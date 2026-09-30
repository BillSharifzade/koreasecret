'use client';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useEffect, useState, type MouseEvent } from 'react';
import { Butterfly, Mark } from '../Brand';
import { Icon } from '../Icon';
import { useI18n, useUI } from '../providers';
import { AccountModal, CityModal, GiftCardModal, cityLabel } from './modals';
import { PROMO_BAR } from '@/lib/data';
import { href, LANGS, type StrKey } from '@/lib/i18n';
import { useShop } from '@/lib/store';
import type { Lang } from '@/lib/types';

const NAV: { path: string; key: StrKey; accent?: boolean; giftcard?: boolean }[] = [
  { path: '/catalog?offer=new', key: 'nav.new' },
  { path: '/catalog?offer=hit', key: 'nav.hits' },
  { path: '/catalog?cat=sun', key: 'nav.spf' },
  { path: '/catalog?type=sheet_mask,sleeping_mask,lip_mask', key: 'nav.masks' },
  { path: '/catalog?cat=sets', key: 'nav.sets' },
  { path: '/#giftcards', key: 'nav.giftcards', giftcard: true },
  { path: '/#stores', key: 'nav.stores' },
  { path: '/#journal', key: 'nav.journal' },
  { path: '/catalog?offer=excl', key: 'nav.excl' },
  { path: '/catalog?offer=sale', key: 'nav.sale', accent: true }
];

export function PromoBar() {
  const tr = useI18n();
  const ui = useUI();
  const [tick, setTick] = useState(0);
  useEffect(() => {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    const t = window.setInterval(() => setTick((n) => n + 1), 4200);
    return () => window.clearInterval(t);
  }, []);
  const n = PROMO_BAR.length;
  const cur = tick % n, prev = tick > 0 ? (tick - 1) % n : -1;
  return (
    <div className="promo-bar">
      <div className="promo-bar__track">
        {PROMO_BAR.map((m, i) => {
          const [a, b] = m[tr.lang].split('{code}');
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

export function useLangSwitch() {
  const pathname = usePathname();
  const router = useRouter();
  return {
    path: (l: Lang) => pathname.replace(/^\/(ru|en)(?=\/|$)/, `/${l}`),
    go: (e: MouseEvent, l: Lang, current: Lang) => {
      e.preventDefault();
      if (l === current) return;
      try { window.localStorage.setItem('ks-lang', l); } catch { /* storage unavailable */ }
      router.push(pathname.replace(/^\/(ru|en)(?=\/|$)/, `/${l}`) + window.location.search + window.location.hash, { scroll: false });
    }
  };
}

export function LangSwitch() {
  const tr = useI18n();
  const sw = useLangSwitch();
  return (
    <div className="header__lang" role="group" aria-label="Language">
      {LANGS.map((l) => (
        <Link key={l} href={sw.path(l)} className={l === tr.lang ? 'is-active' : ''} aria-current={l === tr.lang ? 'true' : undefined} onClick={(e) => sw.go(e, l, tr.lang)} prefetch={false}>{l.toUpperCase()}</Link>
      ))}
    </div>
  );
}

export function Header() {
  const tr = useI18n();
  const ui = useUI();
  const pathname = usePathname();
  const lang = tr.lang;
  const isHome = pathname === `/${lang}` || pathname === `/${lang}/`;
  const [stuck, setStuck] = useState(false);
  const cartCount = useShop((s) => s.cart.reduce((n, it) => n + it.q, 0));
  const favCount = useShop((s) => s.fav.length);
  const city = useShop((s) => s.city);

  useEffect(() => {
    const limit = isHome ? 380 : 180;
    const on = () => setStuck(window.scrollY > limit);
    on();
    window.addEventListener('scroll', on, { passive: true });
    return () => window.removeEventListener('scroll', on);
  }, [isHome]);

  const solid = stuck || !isHome || ui.overlay === 'mega';
  const megaOpen = ui.overlay === 'mega';
  const badge = (n: number, bumps: number) => <span key={bumps} className={`header__badge${n > 0 ? ' is-visible' : ''}${bumps > 0 && n > 0 ? ' is-bump' : ''}`}>{n > 99 ? '99+' : n || ''}</span>;

  return (
    <div className={`header-wrap${isHome ? ' header-wrap--overlay' : ''}`}>
      <div className={`header${isHome ? ' header--overlay' : ''}${solid ? ' is-solid' : ''}${stuck ? ' is-stuck' : ''}`} id="siteHeader">
        <div className="header__top">
          <div className="header__left">
            <button className="header__burger" type="button" aria-label={tr.t('nav.menu')} aria-expanded={megaOpen} onClick={() => ui.toggle('mega')}><Icon name={megaOpen ? 'close' : 'menu'} /></button>
            <button className="header__geo" type="button" onClick={() => ui.openModal(<CityModal />, { label: tr.t('city.title') })}><Icon name="pin" /><span>{cityLabel(city || tr.t('city.default'), lang)}</span></button>
            <div className="header__catalog-wrap">
              <button className="header__catalog" type="button" aria-expanded={megaOpen} aria-controls="mega" onClick={() => ui.toggle('mega')}>
                <Icon name="menu" className="i-menu" /><Icon name="close" className="i-close" /><span>{tr.t('nav.catalog')}</span>
              </button>
            </div>
          </div>
          <div className="header__center">
            <Link className="logo" href={`/${lang}`} aria-label={tr.t('logo.home')}>
              <Mark />
              <span className="logo__word">Korea Secret<Butterfly className="logo__bfly" /></span>
            </Link>
          </div>
          <div className="header__right">
            <LangSwitch />
            <button className="header__action" type="button" aria-label={tr.t('nav.search')} onClick={() => ui.open('search')}><Icon name="search" /></button>
            <button className="header__action header__action--fav" type="button" aria-label={tr.t('nav.fav')} onClick={() => ui.open('fav')}><Icon name="heart" />{badge(favCount, ui.bump.fav)}</button>
            <button className="header__action" type="button" aria-label={tr.t('nav.cart')} onClick={() => ui.open('cart')}><Icon name="bag" />{badge(cartCount, ui.bump.cart)}</button>
            <button className="header__action header__action--account" type="button" aria-label={tr.t('nav.account')} onClick={() => ui.openModal(<AccountModal />, { label: tr.t('acc.title') })}><Icon name="user" /></button>
          </div>
        </div>
        <div className="header__bottom">
          <nav className="header__nav" aria-label={tr.t('nav.main')}>
            {NAV.map((n) => (n.giftcard
              ? <a key={n.key} href={href(lang, n.path)} onClick={(e) => { e.preventDefault(); ui.openModal(<GiftCardModal />, { label: tr.t('gc.title') }); }}>{tr.t(n.key)}</a>
              : <Link key={n.key} href={href(lang, n.path)} className={n.accent ? 'is-accent' : undefined}>{tr.t(n.key)}</Link>))}
          </nav>
        </div>
      </div>
    </div>
  );
}
