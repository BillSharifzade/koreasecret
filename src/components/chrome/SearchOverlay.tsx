'use client';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useDeferredValue, useMemo, useRef, useState, type FormEvent } from 'react';
import { Art } from '../Art';
import { Icon } from '../Icon';
import { useLayer } from '../layer';
import { useI18n, useUI } from '../providers';
import { PRODUCTS } from '@/lib/data';
import { href } from '@/lib/i18n';
import { price, productPath, searchProducts, titleOf, typeLabel } from '@/lib/shop';
import type { Product } from '@/lib/types';

function Highlight({ text, q }: { text: string; q: string }) {
  if (!q) return <>{text}</>;
  const i = text.toLowerCase().indexOf(q.toLowerCase());
  if (i < 0) return <>{text}</>;
  return <>{text.slice(0, i)}<mark>{text.slice(i, i + q.length)}</mark>{text.slice(i + q.length)}</>;
}

export function SearchOverlay() {
  const tr = useI18n();
  const ui = useUI();
  const router = useRouter();
  const open = ui.overlay === 'search';
  const ref = useRef<HTMLDivElement>(null);
  const [q, setQ] = useState('');
  const dq = useDeferredValue(q.trim());
  const results = useMemo(() => (dq ? searchProducts(dq) : []), [dq]);
  const hits = useMemo(() => PRODUCTS.filter((p) => p.tags.includes('hit')).slice(0, 6), []);
  useLayer(open, ui.close, ref, '.search__input');

  const submit = (e: FormEvent) => {
    e.preventDefault();
    if (!q.trim()) return;
    ui.close();
    router.push(href(tr.lang, `/catalog?q=${encodeURIComponent(q.trim())}`));
  };
  const item = (p: Product, hl: string) => (
    <Link key={p.id} className="search__item" href={href(tr.lang, productPath(p))} onClick={ui.close}>
      <Art className="search__item-art" spec={{ kind: 'product', id: p.id }} />
      <span>
        <span className="search__item-type">{typeLabel(p, tr.lang)}</span>
        <span className="search__item-title"><Highlight text={titleOf(p)} q={hl} /></span>
        <span className="search__item-price">{price(p.price)}{p.old ? <s>{price(p.old)}</s> : null}</span>
      </span>
    </Link>
  );
  const chips = <div className="search__chips">{tr.list('search.chips').map((c) => <button key={c} className="chip" type="button" onClick={() => setQ(c)}>{c}</button>)}</div>;

  return (
    <div ref={ref} className={`search${open ? ' is-open' : ''}`} aria-hidden={!open}>
      <div className="search__backdrop" onClick={ui.close} />
      <div className="search__panel" role="dialog" aria-label={tr.t('nav.search')}>
        <div className="container">
          <form className="search__form" role="search" onSubmit={submit}>
            <label className="search__field">
              <Icon name="search" />
              <span className="sr-only">{tr.t('nav.search')}</span>
              <input className="input search__input" name="q" type="search" placeholder={tr.t('search.placeholder')} autoComplete="off" value={q} onChange={(e) => setQ(e.target.value)} />
            </label>
            <button className="search__close" type="button" onClick={ui.close} aria-label={tr.t('common.close')}><Icon name="close" /></button>
          </form>
          <div className="search__body">
            {!dq && (<><div className="search__label">{tr.t('search.popular')}</div>{chips}<div className="search__label">{tr.t('search.hits')}</div><div className="search__results">{hits.map((p) => item(p, ''))}</div></>)}
            {dq && !results.length && (<><div className="search__empty">{tr.t('search.empty', { q: dq })}</div>{chips}</>)}
            {dq && results.length > 0 && (
              <>
                <div className="search__label">{tr.t('search.found')}: {tr.pl('pl.products', results.length)}</div>
                <div className="search__results">{results.slice(0, 6).map((p) => item(p, dq))}</div>
                {results.length > 6 && <Link className="btn btn--gray search__all" href={href(tr.lang, `/catalog?q=${encodeURIComponent(dq)}`)} onClick={ui.close}>{tr.t('search.all')} <Icon name="arrow-right" /></Link>}
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
