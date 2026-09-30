'use client';
import Link from 'next/link';
import { useRef, useState, type FormEvent, type ReactNode } from 'react';
import { Art } from '../Art';
import { Icon } from '../Icon';
import { useLayer } from '../layer';
import { useI18n, useUI, type OverlayName } from '../providers';
import { BuyControl, FavButton } from '../ui/ProductCard';
import { CheckoutModal } from './modals';
import { CONFIG } from '@/lib/data';
import { href } from '@/lib/i18n';
import { cartTotals, getProduct, oldOf, priceOf, price, productPath, titleOf, typeLabel } from '@/lib/shop';
import { shop, useShop } from '@/lib/store';

function Drawer({ name, title, count, children, foot }: { name: OverlayName; title: string; count: number; children: ReactNode; foot?: ReactNode }) {
  const tr = useI18n();
  const ui = useUI();
  const open = ui.overlay === name;
  const ref = useRef<HTMLDivElement>(null);
  useLayer(open, ui.close, ref, '.drawer__close');
  return (
    <div ref={ref} className={`drawer${open ? ' is-open' : ''}`} aria-hidden={!open}>
      <div className="drawer__backdrop" onClick={ui.close} />
      <aside className="drawer__panel" role="dialog" aria-modal="true" aria-label={title}>
        <div className="drawer__head">
          <h2 className="drawer__title">{title}{count > 0 && <sup>{count}</sup>}</h2>
          <button className="drawer__close" type="button" onClick={ui.close} aria-label={tr.t('common.close')}><Icon name="close" /></button>
        </div>
        <div className="drawer__body">{children}</div>
        {foot && <div className="drawer__foot">{foot}</div>}
      </aside>
    </div>
  );
}

function Empty({ kind, title, text }: { kind: 'bag' | 'heart'; title: string; text: string }) {
  const tr = useI18n();
  const ui = useUI();
  return (
    <div className="empty-state">
      <Art className="empty-state__art" as="div" spec={{ kind: 'empty', type: kind }} />
      <div className="empty-state__title">{title}</div>
      <p>{text}</p>
      <Link className="btn btn--primary" href={href(tr.lang, '/catalog')} onClick={ui.close}>{tr.t('cart.toCatalog')}</Link>
    </div>
  );
}

export function CartDrawer() {
  const tr = useI18n();
  const ui = useUI();
  const cart = useShop((s) => s.cart);
  const promo = useShop((s) => s.promo);
  const [code, setCode] = useState('');
  const T = cartTotals(cart, promo);

  let msg: string, pct: number;
  if (T.sub < CONFIG.freeShipping) { msg = tr.t('cart.free.left', { sum: price(CONFIG.freeShipping - T.sub) }); pct = T.sub / CONFIG.freeShipping; }
  else if (T.sub < CONFIG.giftFrom) { msg = tr.t('cart.gift.left', { sum: price(CONFIG.giftFrom - T.sub) }); pct = T.sub / CONFIG.giftFrom; }
  else { msg = tr.t('cart.all.ok'); pct = 1; }

  const apply = (e: FormEvent) => {
    e.preventDefault();
    const c = code.trim().toUpperCase();
    if (c === CONFIG.promo.code) { shop.setPromo(c); setCode(''); }
    else ui.toast({ title: tr.t('cart.promo.bad'), icon: 'close' });
  };
  const remove = (id: string, v: number, q: number) => {
    const p = getProduct(id);
    shop.remove(id, v);
    ui.toast({ title: tr.t('cart.removed'), text: p ? titleOf(p) : '', icon: 'trash', action: { label: tr.t('cart.undo'), fn: () => shop.add(id, v, q) } });
  };
  const minTier = CONFIG.promo.tiers[CONFIG.promo.tiers.length - 1][0];

  const foot = cart.length ? (
    <>
      {promo ? (
        <div className="promo-code__ok"><span>{T.pct ? tr.t('cart.promo.ok', { code: promo, pct: T.pct }) : tr.t('cart.promo.min', { code: promo, sum: price(minTier) })}</span><button type="button" onClick={() => shop.setPromo('')}>{tr.t('cart.promo.remove')}</button></div>
      ) : (
        <form className="promo-code" onSubmit={apply}>
          <input className="input" name="code" placeholder={tr.t('cart.promo.ph')} aria-label={tr.t('cart.promo.ph')} autoComplete="off" value={code} onChange={(e) => setCode(e.target.value)} />
          <button className="btn btn--gray" type="submit">{tr.t('cart.promo.apply')}</button>
        </form>
      )}
      <div className="sum-row"><span>{tr.t('cart.subtotal')} · {tr.pl('pl.items', T.count)}</span><span>{price(T.full)}</span></div>
      {T.savings > 0 && <div className="sum-row"><span>{tr.t('cart.savings')}</span><span className="accent">−{price(T.savings)}</span></div>}
      {T.promo > 0 && <div className="sum-row"><span>{tr.t('cart.promoLine')} {promo}</span><span className="accent">−{price(T.promo)}</span></div>}
      <div className="sum-row"><span>{tr.t('cart.delivery')}</span><span>{T.delivery ? price(T.delivery) : tr.t('cart.free')}</span></div>
      <div className="sum-row sum-row--total"><span>{tr.t('cart.total')}</span><span>{price(T.total)}</span></div>
      <button className="btn btn--primary btn--block btn--lg" type="button" onClick={() => ui.openModal(<CheckoutModal />, { wide: true, label: tr.t('co.title') })}>{tr.t('cart.checkout')}</button>
    </>
  ) : null;

  return (
    <Drawer name="cart" title={tr.t('cart.title')} count={T.count} foot={foot}>
      {!cart.length ? <Empty kind="bag" title={tr.t('cart.empty.title')} text={tr.t('cart.empty.text')} /> : (
        <>
          <div className="free-ship"><span dangerouslySetInnerHTML={{ __html: msg }} /><div className="free-ship__bar"><div className="free-ship__fill" style={{ width: `${Math.min(100, pct * 100).toFixed(1)}%` }} /></div></div>
          {cart.map((it) => {
            const p = getProduct(it.id);
            if (!p) return null;
            const va = p.variants?.[it.v];
            const old = oldOf(p, it.v);
            const url = href(tr.lang, productPath(p));
            return (
              <div className="cart-item" key={`${it.id}:${it.v}`}>
                <Link className="cart-item__art" href={url} onClick={ui.close}><Art spec={{ kind: 'product', id: p.id, variant: va?.color, amount: va?.price ? va.name : undefined }} /></Link>
                <div>
                  <div className="cart-item__type">{typeLabel(p, tr.lang)}</div>
                  <Link className="cart-item__title" href={url} onClick={ui.close}>{titleOf(p)}</Link>
                  {va && <div className="cart-item__variant">{va.name}</div>}
                  <div className="cart-item__row">
                    <div className="qty">
                      <button className="qty__btn" type="button" onClick={() => shop.setQty(it.id, it.v, it.q - 1)} aria-label={tr.t('card.dec')}><Icon name="minus" /></button>
                      <span className="qty__val">{it.q}</span>
                      <button className="qty__btn" type="button" onClick={() => shop.setQty(it.id, it.v, it.q + 1)} aria-label={tr.t('card.inc')}><Icon name="plus" /></button>
                    </div>
                    <div className="cart-item__price">{price(priceOf(p, it.v) * it.q)}{old ? <s>{price(old * it.q)}</s> : null}</div>
                    <button className="cart-item__remove" type="button" onClick={() => remove(it.id, it.v, it.q)} aria-label={tr.t('cart.remove')}><Icon name="trash" /></button>
                  </div>
                </div>
              </div>
            );
          })}
        </>
      )}
    </Drawer>
  );
}

export function FavDrawer() {
  const tr = useI18n();
  const ui = useUI();
  const fav = useShop((s) => s.fav);
  return (
    <Drawer name="fav" title={tr.t('fav.title')} count={fav.length}>
      {!fav.length ? <Empty kind="heart" title={tr.t('fav.empty.title')} text={tr.t('fav.empty.text')} /> : fav.map((id) => {
        const p = getProduct(id);
        if (!p) return null;
        const url = href(tr.lang, productPath(p));
        return (
          <div className="fav-item" key={id}>
            <Link className="cart-item__art" href={url} onClick={ui.close}><Art spec={{ kind: 'product', id }} /></Link>
            <div>
              <div className="cart-item__type">{typeLabel(p, tr.lang)}</div>
              <Link className="cart-item__title" href={url} onClick={ui.close}>{titleOf(p)}</Link>
              <div className="pcard__buy" style={{ paddingTop: 10, minHeight: 0 }}><BuyControl id={id} /></div>
            </div>
            <FavButton id={id} style={{ position: 'static' }} />
          </div>
        );
      })}
    </Drawer>
  );
}
