'use client';
import Link from 'next/link';
import { useEffect, useMemo, useRef, useState } from 'react';
import { Art } from '../Art';
import { Icon } from '../Icon';
import { useLayer } from '../layer';
import { useI18n, useUI } from '../providers';
import { LangSwitch } from './Header';
import { AccountModal, CityModal, GiftCardModal, cityLabel } from './modals';
import { BRANDS, CATS, CONFIG, OFFERS, PRODUCTS, TYPES } from '@/lib/data';
import { href } from '@/lib/i18n';
import { productPath, titleOf } from '@/lib/shop';
import { useShop } from '@/lib/store';
import type { Offer } from '@/lib/types';

type Key = 'brands' | 'hits' | 'offers' | (typeof CATS)[number]['id'];

export function MegaMenu() {
  const tr = useI18n();
  const ui = useUI();
  const open = ui.overlay === 'mega';
  const ref = useRef<HTMLDivElement>(null);
  const [key, setKey] = useState<Key>('face');
  const [sub, setSub] = useState(false);
  const [top, setTop] = useState(170);
  const [brandQ, setBrandQ] = useState('');
  const hoverT = useRef(0);
  const city = useShop((s) => s.city);
  const L = (p: string) => href(tr.lang, p);
  useLayer(open, ui.close, ref, '.mega__side-item.is-active');

  useEffect(() => {
    if (!open) return;
    const h = document.getElementById('siteHeader');
    if (h) setTop(Math.max(0, Math.round(h.getBoundingClientRect().bottom)));
    setSub(false);
  }, [open]);

  const choose = (k: Key) => { setKey(k); if (window.innerWidth < 1024) setSub(true); };
  const hover = (k: Key) => {
    if (window.innerWidth < 1024 || k === key) return;
    window.clearTimeout(hoverT.current);
    hoverT.current = window.setTimeout(() => setKey(k), 110);
  };

  const side: [Key, string, string, boolean?][] = [['brands', 'brands', tr.t('mega.brands')], ...CATS.map((c) => [c.id, c.icon, tr.L(c)] as [Key, string, string]), ['hits', 'fire', tr.t('mega.hits')], ['offers', 'percent', tr.t('mega.offers'), true]];
  const brandGroups = useMemo(() => {
    const groups: Record<string, typeof BRANDS> = {};
    BRANDS.filter((b) => b.id !== 'korea-secret').slice().sort((a, b) => a.name.localeCompare(b.name)).forEach((b) => { const l = b.name[0].toUpperCase(); (groups[l] = groups[l] || []).push(b); });
    return Object.entries(groups);
  }, []);
  const close = () => ui.close();

  const promos = (
    <div className="mega__promos">
      {[['/catalog?cat=sun', tr.t('mega.promo1'), 0], ['/catalog?brand=medicube', tr.t('mega.promo2'), 1]].map(([h, label, i]) => (
        <Link key={i} className="mega__promo" href={L(h as string)} onClick={close}>
          <Art className="mega__promo-art" as="div" spec={{ kind: 'megaPromo', index: i as number }} />
          <div className="mega__promo-title">{label}</div>
        </Link>
      ))}
    </div>
  );

  let content;
  if (key === 'brands') {
    const q = brandQ.trim().toLowerCase();
    content = (
      <div>
        <h3 className="mega__title"><Link href={L('/catalog')} onClick={close}>{tr.t('mega.brands')}</Link></h3>
        <input className="input mega__brand-search" type="search" placeholder={tr.t('mega.brandSearch')} aria-label={tr.t('mega.brandSearch')} value={brandQ} onChange={(e) => setBrandQ(e.target.value)} />
        <div className="mega__brands">
          {brandGroups.map(([letter, list]) => {
            const shown = list.filter((b) => !q || b.name.toLowerCase().includes(q));
            if (!shown.length) return null;
            return (
              <div key={letter}>
                <div className="mega__letter">{letter}</div>
                {shown.map((b) => <Link key={b.id} className="mega__link" href={L(`/catalog?brand=${b.id}`)} onClick={close}>{b.name}</Link>)}
              </div>
            );
          })}
        </div>
      </div>
    );
  } else if (key === 'hits') {
    content = (
      <>
        <div>
          <h3 className="mega__title"><Link href={L('/catalog?offer=hit')} onClick={close}>{tr.t('mega.hits')}</Link></h3>
          <div className="mega__cols">
            <div><div className="mega__group-title">{tr.t('mega.byCat')}</div>{CATS.map((c) => <Link key={c.id} className="mega__link" href={L(`/catalog?offer=hit&cat=${c.id}`)} onClick={close}>{tr.L(c)}</Link>)}</div>
            <div><div className="mega__group-title">{tr.t('mega.top')}</div>{PRODUCTS.slice().sort((a, b) => b.reviews - a.reviews).slice(0, 5).map((p) => <Link key={p.id} className="mega__link" href={L(productPath(p))} onClick={close}>{titleOf(p)}</Link>)}</div>
          </div>
        </div>
        {promos}
      </>
    );
  } else if (key === 'offers') {
    content = (
      <>
        <div>
          <h3 className="mega__title"><Link href={L('/catalog?offer=sale')} onClick={close}>{tr.t('mega.offers')}</Link></h3>
          <div className="mega__cols">
            <div>
              <div className="mega__group-title">{tr.t('mega.offersTitle')}</div>
              {(Object.keys(OFFERS) as Offer[]).map((o) => <Link key={o} className="mega__link" href={L(`/catalog?offer=${o}`)} onClick={close}>{tr.L(OFFERS[o])}</Link>)}
              <a className="mega__link" href={L('/#giftcards')} onClick={(e) => { e.preventDefault(); ui.openModal(<GiftCardModal />, { label: tr.t('gc.title') }); }}>{tr.t('nav.giftcards')}</a>
            </div>
          </div>
        </div>
        {promos}
      </>
    );
  } else {
    const c = CATS.find((x) => x.id === key) || CATS[0];
    content = (
      <>
        <div>
          <h3 className="mega__title"><Link href={L(`/catalog?cat=${c.id}`)} onClick={close}>{tr.L(c)}</Link></h3>
          <div className="mega__cols">
            {c.groups.map((g) => (
              <div key={g.ru}>
                <div className="mega__group-title">{tr.L(g)}</div>
                {g.types.map((ty) => <Link key={ty} className="mega__link" href={L(`/catalog?type=${ty}`)} onClick={close}>{tr.L(TYPES[ty].many)} <span className="muted">{PRODUCTS.filter((p) => p.type === ty).length}</span></Link>)}
              </div>
            ))}
            <div><Link className="mega__link accent" href={L(`/catalog?cat=${c.id}`)} onClick={close}>{tr.t('mega.all')} →</Link></div>
          </div>
        </div>
        {promos}
      </>
    );
  }

  return (
    <div ref={ref} id="mega" className={`mega${open ? ' is-open' : ''}${sub ? ' is-sub' : ''}`} aria-hidden={!open} style={{ ['--mega-top' as string]: `${top}px` }}>
      <div className="mega__backdrop" onClick={close} />
      <div className="mega__panel" role="dialog" aria-label={tr.t('nav.catalog')}>
        <div className="container">
          <div className="mega__grid">
            <div className="mega__side">
              {side.map(([k, ic, label, sale]) => (
                <button key={k} className={`mega__side-item${k === key ? ' is-active' : ''}${sale ? ' is-sale' : ''}`} type="button" onClick={() => choose(k)} onMouseEnter={() => hover(k)}>
                  <Icon name={ic} /><span>{label}</span><Icon name="chev-right" className="chev" />
                </button>
              ))}
              <div className="mega__mobile-extra">
                <button className="mega__extra-row" type="button" onClick={() => ui.openModal(<CityModal />, { label: tr.t('city.title') })}><Icon name="pin" /><span>{cityLabel(city || tr.t('city.default'), tr.lang)}</span></button>
                <button className="mega__extra-row" type="button" onClick={() => ui.openModal(<AccountModal />, { label: tr.t('acc.title') })}><Icon name="user" /><span>{tr.t('nav.account')}</span></button>
                <a className="mega__extra-row" href={CONFIG.phoneHref}><Icon name="phone" /><span>{CONFIG.phone} · {tr.t('mega.phone')}</span></a>
                <LangSwitch />
              </div>
            </div>
            <div className="mega__content">
              <button className="mega__back" type="button" onClick={() => setSub(false)}><Icon name="chev-left" /><span>{tr.t('mega.back')}</span></button>
              {content}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
