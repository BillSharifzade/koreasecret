'use client';
import Link from 'next/link';
import { useRef, useState, type FormEvent, type ReactNode } from 'react';
import { Art } from '../Art';
import { Icon } from '../Icon';
import { useLayer } from '../layer';
import { useUI, type OverlayName } from '../providers';
import { BuyControl, FavButton } from '../ui/ProductCard';
import { CheckoutModal } from './modals';
import { CONFIG } from '@/lib/data';
import { count } from '@/lib/format';
import { cartTotals, getProduct, oldOf, priceOf, price, productPath, titleOf, typeLabel } from '@/lib/shop';
import { shop, useShop } from '@/lib/store';

function Drawer({ name, title, count, children, foot }: { name: OverlayName; title: string; count: number; children: ReactNode; foot?: ReactNode }) {
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
          <button className="drawer__close" type="button" onClick={ui.close} aria-label="Закрыть"><Icon name="close" /></button>
        </div>
        <div className="drawer__body">{children}</div>
        {foot && <div className="drawer__foot">{foot}</div>}
      </aside>
    </div>
  );
}

function Empty({ kind, title, text }: { kind: 'bag' | 'heart'; title: string; text: string }) {
  const ui = useUI();
  return (
    <div className="empty-state">
      <Art className="empty-state__art" as="div" spec={{ kind: 'empty', type: kind }} />
      <div className="empty-state__title">{title}</div>
      <p>{text}</p>
      <Link className="btn btn--primary" href={'/catalog'} onClick={ui.close}>Перейти в каталог</Link>
    </div>
  );
}

export function CartDrawer() {
  const ui = useUI();
  const cart = useShop((s) => s.cart);
  const promo = useShop((s) => s.promo);
  const [code, setCode] = useState('');
  const T = cartTotals(cart, promo);

  let msg: string, pct: number;
  if (T.sub < CONFIG.freeShipping) { msg = `До бесплатной доставки — <b>${price(CONFIG.freeShipping - T.sub)}</b>`; pct = T.sub / CONFIG.freeShipping; }
  else if (T.sub < CONFIG.giftFrom) { msg = `Доставка бесплатная. Ещё <b>${price(CONFIG.giftFrom - T.sub)}</b> — и миниатюра в подарок`; pct = T.sub / CONFIG.giftFrom; }
  else { msg = 'Бесплатная доставка и <b>миниатюра в подарок</b>'; pct = 1; }

  const apply = (e: FormEvent) => {
    e.preventDefault();
    const c = code.trim().toUpperCase();
    if (c === CONFIG.promo.code) { shop.setPromo(c); setCode(''); }
    else ui.toast({ title: 'Такого промокода нет', icon: 'close' });
  };
  const remove = (id: string, v: number, q: number) => {
    const p = getProduct(id);
    shop.remove(id, v);
    ui.toast({ title: 'Товар удалён', text: p ? titleOf(p) : '', icon: 'trash', action: { label: 'Вернуть', fn: () => shop.add(id, v, q) } });
  };
  const minTier = CONFIG.promo.tiers[CONFIG.promo.tiers.length - 1][0];

  const foot = cart.length ? (
    <>
      {promo ? (
        <div className="promo-code__ok"><span>{T.pct ? `Промокод ${promo}: −${T.pct}%` : `Промокод ${promo} применён — скидка начнётся от ${price(minTier)}`}</span><button type="button" onClick={() => shop.setPromo('')}>Убрать</button></div>
      ) : (
        <form className="promo-code" onSubmit={apply}>
          <input className="input" name="code" placeholder="Промокод" aria-label="Промокод" autoComplete="off" value={code} onChange={(e) => setCode(e.target.value)} />
          <button className="btn btn--gray" type="submit">Применить</button>
        </form>
      )}
      <div className="sum-row"><span>Товары · {count(T.count, 'товар', 'товара', 'товаров')}</span><span>{price(T.full)}</span></div>
      {T.savings > 0 && <div className="sum-row"><span>Скидка на товары</span><span className="accent">−{price(T.savings)}</span></div>}
      {T.promo > 0 && <div className="sum-row"><span>Промокод {promo}</span><span className="accent">−{price(T.promo)}</span></div>}
      <div className="sum-row"><span>Доставка</span><span>{T.delivery ? price(T.delivery) : 'бесплатно'}</span></div>
      <div className="sum-row sum-row--total"><span>Итого</span><span>{price(T.total)}</span></div>
      <button className="btn btn--primary btn--block btn--lg" type="button" onClick={() => ui.openModal(<CheckoutModal />, { wide: true, label: 'Оформление заказа' })}>Оформить заказ</button>
    </>
  ) : null;

  return (
    <Drawer name="cart" title="Корзина" count={T.count} foot={foot}>
      {!cart.length ? <Empty kind="bag" title="Корзина пуста" text="Загляните в каталог — там много секретов красивой кожи" /> : (
        <>
          <div className="free-ship"><span dangerouslySetInnerHTML={{ __html: msg }} /><div className="free-ship__bar"><div className="free-ship__fill" style={{ width: `${Math.min(100, pct * 100).toFixed(1)}%` }} /></div></div>
          {cart.map((it) => {
            const p = getProduct(it.id);
            if (!p) return null;
            const va = p.variants?.[it.v];
            const old = oldOf(p, it.v);
            const url = productPath(p);
            return (
              <div className="cart-item" key={`${it.id}:${it.v}`}>
                <Link className="cart-item__art" href={url} onClick={ui.close}><Art spec={{ kind: 'product', id: p.id, variant: va?.color, amount: va?.price ? va.name : undefined }} /></Link>
                <div>
                  <div className="cart-item__type">{typeLabel(p)}</div>
                  <Link className="cart-item__title" href={url} onClick={ui.close}>{titleOf(p)}</Link>
                  {va && <div className="cart-item__variant">{va.name}</div>}
                  <div className="cart-item__row">
                    <div className="qty">
                      <button className="qty__btn" type="button" onClick={() => shop.setQty(it.id, it.v, it.q - 1)} aria-label="Уменьшить количество"><Icon name="minus" /></button>
                      <span className="qty__val">{it.q}</span>
                      <button className="qty__btn" type="button" onClick={() => shop.setQty(it.id, it.v, it.q + 1)} aria-label="Увеличить количество"><Icon name="plus" /></button>
                    </div>
                    <div className="cart-item__price">{price(priceOf(p, it.v) * it.q)}{old ? <s>{price(old * it.q)}</s> : null}</div>
                    <button className="cart-item__remove" type="button" onClick={() => remove(it.id, it.v, it.q)} aria-label="Удалить"><Icon name="trash" /></button>
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
  const ui = useUI();
  const fav = useShop((s) => s.fav);
  return (
    <Drawer name="fav" title="Избранное" count={fav.length}>
      {!fav.length ? <Empty kind="heart" title="Здесь пока пусто" text="Нажимайте на сердечко, чтобы сохранить понравившиеся средства" /> : fav.map((id) => {
        const p = getProduct(id);
        if (!p) return null;
        const url = productPath(p);
        return (
          <div className="fav-item" key={id}>
            <Link className="cart-item__art" href={url} onClick={ui.close}><Art spec={{ kind: 'product', id }} /></Link>
            <div>
              <div className="cart-item__type">{typeLabel(p)}</div>
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
