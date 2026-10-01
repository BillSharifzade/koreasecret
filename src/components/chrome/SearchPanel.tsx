'use client';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useDeferredValue, useEffect, useMemo, useRef, useState, type CSSProperties, type FormEvent } from 'react';
import { Art } from '../Art';
import { Icon } from '../Icon';
import { useLayer } from '../layer';
import { useUI } from '../providers';
import { PRODUCTS } from '@/lib/data';
import { count } from '@/lib/format';
import { price, productPath, searchProducts, titleOf, typeLabel } from '@/lib/shop';
import type { Product } from '@/lib/types';

const CHIPS = ['санскрин', 'центелла', 'COSRX', 'тонер', 'PDRN', 'тинт', 'увлажнение', 'Anua'];
const SHOWN = 6;

function Highlight({ text, q }: { text: string; q: string }) {
  const i = q ? text.toLowerCase().indexOf(q.toLowerCase()) : -1;
  if (i < 0) return <>{text}</>;
  return <>{text.slice(0, i)}<mark>{text.slice(i, i + q.length)}</mark>{text.slice(i + q.length)}</>;
}

function Row({ p, q, onGo }: { p: Product; q: string; onGo: () => void }) {
  return (
    <li>
      <Link className="search-row" href={productPath(p)} onClick={onGo}>
        <Art className="search-row__art" spec={{ kind: 'product', id: p.id }} />
        <span className="search-row__body">
          <span className="search-row__type">{typeLabel(p)}</span>
          <span className="search-row__title"><Highlight text={titleOf(p)} q={q} /></span>
          <span className="search-row__rating"><Icon name="star" className="i--fill" /><b>{p.rating}</b>{count(p.reviews, 'отзыв', 'отзыва', 'отзывов')}</span>
        </span>
        {p.stock > 0
          ? <span className="search-row__price">{price(p.price)}{p.old ? <s>{price(p.old)}</s> : null}</span>
          : <span className="search-row__price is-oos">Нет в наличии</span>}
      </Link>
    </li>
  );
}

/** Search drops down under the header: a big query field on the left, matching products on the right. */
export function SearchPanel() {
  const ui = useUI();
  const router = useRouter();
  const open = ui.overlay === 'search';
  const ref = useRef<HTMLDivElement>(null);
  const [q, setQ] = useState('');
  const [top, setTop] = useState(150);
  const dq = useDeferredValue(q.trim());
  const results = useMemo(() => (dq ? searchProducts(dq) : []), [dq]);
  const popular = useMemo(() => PRODUCTS.filter((p) => p.tags.includes('hit')).slice(0, SHOWN), []);
  useLayer(open, ui.close, ref, '.search__input');

  useEffect(() => {
    if (!open) return;
    const h = document.getElementById('siteHeader');
    if (h) setTop(Math.round(h.getBoundingClientRect().bottom));
  }, [open]);

  const submit = (e: FormEvent) => {
    e.preventDefault();
    if (!q.trim()) return;
    ui.close();
    router.push(`/catalog?q=${encodeURIComponent(q.trim())}`);
  };

  const list = dq ? results.slice(0, SHOWN) : popular;
  return (
    <div ref={ref} id="search" className={`search${open ? ' is-open' : ''}`} aria-hidden={!open} style={{ '--search-top': `${top}px` } as CSSProperties}>
      <div className="search__backdrop" onClick={ui.close} />
      <div className="search__panel" role="dialog" aria-modal="true" aria-label="Поиск по каталогу">
        <div className="container search__grid">
          <div className="search__side">
            <form className="search__form" role="search" onSubmit={submit}>
              <label className="sr-only" htmlFor="search-q">Поиск по каталогу</label>
              <input id="search-q" className="search__input" name="q" type="search" placeholder="Найти средство" autoComplete="off" spellCheck={false} enterKeyHint="search" value={q} onChange={(e) => setQ(e.target.value)} />
              <button className="search__submit" type="submit" aria-label="Найти" disabled={!q.trim()}>
                <svg viewBox="0 0 48 24" aria-hidden="true"><path d="M1 12h45M35 1.5 46 12 35 22.5" /></svg>
              </button>
            </form>
            <div className="search__label">Часто ищут</div>
            <div className="search__chips">{CHIPS.map((c) => <button key={c} className="chip" type="button" onClick={() => setQ(c)}>{c}</button>)}</div>
          </div>
          <div className="search__results" aria-live="polite">
            <div className="search__label">{dq ? (results.length ? `Найдено ${count(results.length, 'товар', 'товара', 'товаров')}` : 'Ничего не нашлось') : 'Популярное сейчас'}</div>
            {dq && !results.length
              ? <p className="search__empty">По запросу «{dq}» ничего нет. Попробуйте другое слово или загляните в хиты.</p>
              : <ul className="search__list">{list.map((p) => <Row key={p.id} p={p} q={dq} onGo={ui.close} />)}</ul>}
            {results.length > SHOWN && <Link className="search__all" href={`/catalog?q=${encodeURIComponent(dq)}`} onClick={ui.close}>Все результаты · {results.length}<Icon name="arrow-right" /></Link>}
          </div>
        </div>
      </div>
    </div>
  );
}
