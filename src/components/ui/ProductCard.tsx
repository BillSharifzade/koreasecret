'use client';
import Link from 'next/link';
import { useEffect, useState, type CSSProperties } from 'react';
import { Art } from '../Art';
import { Icon } from '../Icon';
import { useUI } from '../providers';
import { GiftCardModal } from '../chrome/modals';
import { TEXTS } from '@/lib/data';
import { count } from '@/lib/format';
import { discountOf, getProduct, priceOf, price, productPath, titleOf, typeLabel, variantsLabel } from '@/lib/shop';
import { shop, useShop } from '@/lib/store';

export function BuyControl({ id, v = 0 }: { id: string; v?: number }) {
  const ui = useUI();
  const q = useShop((s) => s.cart.find((x) => x.id === id && x.v === v)?.q ?? 0);
  const p = getProduct(id);
  if (!p) return null;
  const name = titleOf(p);
  if (p.stock <= 0) return <span className="price-pill is-oos">Нет в наличии</span>;
  if (p.type === 'giftcard') {
    return <button className="price-pill price-pill--from" type="button" onClick={() => ui.openModal(<GiftCardModal />, { label: TEXTS.giftcard.title })}>от {price(p.price)}</button>;
  }
  if (q > 0) {
    return (
      <div className="stepper" role="group" aria-label={name}>
        <button className="stepper__btn" type="button" onClick={() => shop.setQty(id, v, q - 1)} aria-label="Уменьшить количество"><Icon name="minus" /></button>
        <span className="stepper__val">{q} шт<small>{price(priceOf(p, v) * q)}</small></span>
        <button className="stepper__btn" type="button" onClick={() => shop.setQty(id, v, q + 1)} aria-label="Увеличить количество"><Icon name="plus" /></button>
      </div>
    );
  }
  const d = discountOf(p);
  return (
    <button className={`price-pill${d ? ' price-pill--sale' : ''}`} type="button" onClick={() => ui.addToCart(id, v)} aria-label={`${'В корзину'}: ${name}`}>
      <Icon name="bag" className="price-pill__icon" />
      {price(p.price)}
      {d ? <><span className="price-pill__old">{price(p.old!)}</span><span className="price-pill__off">−{d}%</span></> : null}
    </button>
  );
}

export function FavButton({ id, className = 'pcard__fav', style }: { id: string; className?: string; style?: CSSProperties }) {
  const ui = useUI();
  const on = useShop((s) => s.fav.includes(id));
  const [pop, setPop] = useState(false);
  useEffect(() => { if (!pop) return; const t = window.setTimeout(() => setPop(false), 450); return () => window.clearTimeout(t); }, [pop]);
  return (
    <button className={`${className}${on ? ' is-active' : ''}${pop ? ' is-pop' : ''}`} style={style} type="button" aria-pressed={on} aria-label="В избранное" onClick={() => { ui.toggleFav(id); setPop(true); }}>
      <Icon name="heart" />
    </button>
  );
}

export function ProductCard({ id, className, style }: { id: string; className?: string; style?: CSSProperties }) {
  const p = getProduct(id);
  if (!p) return null;
  const d = discountOf(p);
  const url = productPath(p);
  const more = variantsLabel(p);
  return (
    <article className={`pcard${className ? ' ' + className : ''}`} style={style}>
      <Link className="pcard__media" href={url} tabIndex={-1} aria-hidden="true" draggable={false}>
        <Art className="pcard__art" spec={{ kind: 'product', id }} />
        <span className="pcard__badges">
          {d ? <span className="badge-sale">−{d}%</span> : null}
          {p.tags.includes('hit') && <span className="tag tag--hit">Хит</span>}
          {p.tags.includes('new') && <span className="tag tag--new">New</span>}
        </span>
        {more && (
          <span className="pcard__variants">
            <span className="pcard__swatches">{p.variants!.slice(0, 3).map((x) => <i key={x.name} style={{ background: x.color }} />)}</span>
            {more}
          </span>
        )}
      </Link>
      <FavButton id={id} />
      <div className="pcard__body">
        <div className="pcard__type">{typeLabel(p)}</div>
        <Link className="pcard__title" href={url} draggable={false}>{titleOf(p)}</Link>
        {p.reviews > 0 && <div className="pcard__rating"><Icon name="star" className="i--fill" /><b>{p.rating}</b>{count(p.reviews, 'отзыв', 'отзыва', 'отзывов')}</div>}
        <div className="pcard__buy"><BuyControl id={id} /></div>
      </div>
    </article>
  );
}
