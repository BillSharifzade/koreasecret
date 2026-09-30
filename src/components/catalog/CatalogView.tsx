'use client';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { useEffect, useMemo, useRef, useState, type CSSProperties } from 'react';
import { Art } from '../Art';
import { Icon } from '../Icon';
import { useLayer } from '../layer';
import { useI18n, useUI } from '../providers';
import { Carousel } from '../ui/Carousel';
import { ProductCard } from '../ui/ProductCard';
import { activeCount, context, facet, parseState, priceBounds, results, SORTS, toQuery, type CatalogState, type FacetKey, type ListKey } from '@/lib/catalog';
import { CATS, CONCERNS, CONFIG, OFFERS, PRODUCTS, SKINS, TYPES } from '@/lib/data';
import { fmt, href, type StrKey } from '@/lib/i18n';
import { brandOf, catOf, price } from '@/lib/shop';

const PER = CONFIG.pageSize;
const FILTERS: [FacetKey, StrKey][] = [['price', 'f.price'], ['offer', 'f.offer'], ['brand', 'f.brand'], ['type', 'f.type'], ['skin', 'f.skin'], ['concern', 'f.concern']];
const norm = (q: string) => new URLSearchParams(q).toString();
const fromQs = (q: string) => Object.fromEntries(new URLSearchParams(q));

/** Reads the query string on the client (the page itself is statically exported). */
export function CatalogFromUrl() {
  const sp = useSearchParams();
  return <CatalogView query={sp.toString()} />;
}

function PriceRange({ st, onCommit }: { st: CatalogState; onCommit: (a: number, b: number) => void }) {
  const tr = useI18n();
  const [lo, hi] = priceBounds(st);
  const [a, setA] = useState(st.pmin || lo);
  const [b, setB] = useState(st.pmax || hi);
  useEffect(() => { setA(st.pmin || lo); setB(st.pmax || hi); }, [st.pmin, st.pmax, lo, hi]);
  const span = hi - lo || 1;
  const commit = (x = a, y = b) => {
    const mn = Math.max(lo, Math.min(x || lo, hi)), mx = Math.max(lo, Math.min(y || hi, hi));
    onCommit(mn > lo ? Math.min(mn, mx) : 0, mx < hi ? Math.max(mn, mx) : 0);
  };
  return (
    <div className="range">
      <div className="range__inputs">
        <label><span className="sr-only">{tr.t('f.from')}</span><input className="input" type="number" inputMode="numeric" min={lo} max={hi} value={a} onChange={(e) => setA(+e.target.value)} onBlur={() => commit()} onKeyDown={(e) => e.key === 'Enter' && commit()} /></label>
        <label><span className="sr-only">{tr.t('f.to')}</span><input className="input" type="number" inputMode="numeric" min={lo} max={hi} value={b} onChange={(e) => setB(+e.target.value)} onBlur={() => commit()} onKeyDown={(e) => e.key === 'Enter' && commit()} /></label>
      </div>
      <div className="range__slider">
        <div className="range__track" />
        <div className="range__fill" style={{ left: `${((a - lo) / span) * 100}%`, width: `${Math.max(0, ((b - a) / span) * 100)}%` }} />
        <input type="range" min={lo} max={hi} step={10} value={a} aria-label={tr.t('f.from')} onChange={(e) => setA(Math.min(+e.target.value, b))} onPointerUp={() => commit()} onKeyUp={() => commit()} />
        <input type="range" min={lo} max={hi} step={10} value={b} aria-label={tr.t('f.to')} onChange={(e) => setB(Math.max(+e.target.value, a))} onPointerUp={() => commit()} onKeyUp={() => commit()} />
      </div>
    </div>
  );
}

export function CatalogView({ query }: { query: string }) {
  const tr = useI18n();
  const ui = useUI();
  const [st, setSt] = useState<CatalogState>(() => parseState(fromQs(query)));
  const written = useRef(norm(query));
  const [openFilter, setOpenFilter] = useState<FacetKey | ''>('');
  const [sortOpen, setSortOpen] = useState(false);
  const [brandQ, setBrandQ] = useState('');
  const [openAcc, setOpenAcc] = useState<FacetKey[]>([]);
  const filtersRef = useRef<HTMLDivElement>(null);
  const sortRef = useRef<HTMLDivElement>(null);
  const resultsRef = useRef<HTMLDivElement>(null);
  const sheetRef = useRef<HTMLDivElement>(null);
  const L = (p: string) => href(tr.lang, p);

  // external navigation (menu links, back/forward) resets the state from the URL
  useEffect(() => {
    const q = norm(query);
    if (q !== written.current) { written.current = q; setSt(parseState(fromQs(query))); }
  }, [query]);

  // close dropdowns on outside click
  useEffect(() => {
    if (!openFilter && !sortOpen) return;
    const onDown = (e: MouseEvent) => {
      if (openFilter && filtersRef.current && !filtersRef.current.contains(e.target as Node)) setOpenFilter('');
      if (sortOpen && sortRef.current && !sortRef.current.contains(e.target as Node)) setSortOpen(false);
    };
    document.addEventListener('mousedown', onDown);
    return () => document.removeEventListener('mousedown', onDown);
  }, [openFilter, sortOpen]);

  const sheetOpen = ui.overlay === 'filters';
  useLayer(sheetOpen, ui.close, sheetRef);

  const update = (patch: Partial<CatalogState>, o: { keepPage?: boolean; push?: boolean; scroll?: boolean } = {}) => {
    const next: CatalogState = { ...st, ...patch };
    if (!o.keepPage) { next.page = 1; next.from = 1; }
    setSt(next);
    const qs = toQuery(next);
    written.current = norm(qs.slice(1));
    try { window.history[o.push ? 'pushState' : 'replaceState'](null, '', window.location.pathname + qs); } catch { /* ignore */ }
    if (o.scroll && resultsRef.current) {
      const y = resultsRef.current.getBoundingClientRect().top + window.scrollY - 110;
      if (window.scrollY > y) window.scrollTo({ top: y, behavior: 'smooth' });
    }
  };
  const toggleValue = (k: ListKey, v: string) => {
    const set = new Set<string>(st[k]);
    if (set.has(v)) set.delete(v); else set.add(v);
    update({ [k]: [...set] } as Partial<CatalogState>);
  };
  const reset = (k: FacetKey) => update(k === 'price' ? { pmin: 0, pmax: 0 } : ({ [k]: [] } as Partial<CatalogState>));
  const resetAll = () => update({ cat: '', q: '', edit: '', type: [], brand: [], skin: [], concern: [], offer: [], pmin: 0, pmax: 0, instock: false }, { push: true });

  const list = useMemo(() => results(st), [st]);
  const pages = Math.max(1, Math.ceil(list.length / PER));
  const page = Math.min(st.page, pages), from = Math.min(st.from, page);
  const shown = list.slice((from - 1) * PER, page * PER);
  const ctx = context(st, tr);
  const heroIds = (list.length ? list : PRODUCTS).slice(0, 3).map((p) => p.id);

  useEffect(() => { document.title = `${ctx.title} — Korea Secret`; }, [ctx.title]);

  const facetBody = (k: FacetKey) => {
    if (k === 'price') return <PriceRange st={st} onCommit={(a, b) => update({ pmin: a, pmax: b })} />;
    const q = brandQ.trim().toLowerCase();
    return (
      <>
        {k === 'brand' && <input className="input filter__search" type="search" placeholder={tr.t('f.findBrand')} aria-label={tr.t('f.findBrand')} value={brandQ} onChange={(e) => setBrandQ(e.target.value)} />}
        <div className="filter__list">
          {facet(k, st, tr).filter((o) => k !== 'brand' || !q || o.label.toLowerCase().includes(q)).map((o) => (
            <label key={o.v} className="check" style={o.n ? undefined : { opacity: 0.45 }}>
              <input type="checkbox" checked={(st[k] as string[]).includes(o.v)} onChange={() => toggleValue(k, o.v)} />
              <span className="check__box" /><span>{o.label}</span><span className="check__count">{o.n}</span>
            </label>
          ))}
        </div>
      </>
    );
  };

  // sub-category chips
  const chipCat = CATS.find((c) => c.id === st.cat) || (st.type.length === 1 ? CATS.find((c) => c.id === TYPES[st.type[0]].cat) : undefined);
  const chip = (label: string, patch: Partial<CatalogState>, active: boolean, qs: string) => (
    <Link key={label} className={`chip${active ? ' is-active' : ''}`} href={L(`/catalog${qs}`)} onClick={(e) => { if (e.metaKey || e.ctrlKey) return; e.preventDefault(); update({ q: '', edit: '', type: [], ...patch }, { push: true }); }}>{label}</Link>
  );

  const chips: { label: string; remove: () => void }[] = [];
  if (st.q) chips.push({ label: tr.t('f.qChip', { q: st.q }), remove: () => update({ q: '' }, { push: true }) });
  if (st.cat) chips.push({ label: tr.L(CATS.find((c) => c.id === st.cat)), remove: () => update({ cat: '' }, { push: true }) });
  st.type.forEach((v) => chips.push({ label: tr.L(TYPES[v].many), remove: () => toggleValue('type', v) }));
  st.brand.forEach((v) => chips.push({ label: brandOf(v).name, remove: () => toggleValue('brand', v) }));
  st.offer.forEach((v) => chips.push({ label: tr.L(OFFERS[v]), remove: () => toggleValue('offer', v) }));
  st.skin.forEach((v) => chips.push({ label: tr.L(SKINS[v]), remove: () => toggleValue('skin', v) }));
  st.concern.forEach((v) => chips.push({ label: tr.L(CONCERNS[v]), remove: () => toggleValue('concern', v) }));
  if (st.pmin || st.pmax) { const [lo, hi] = priceBounds(st); chips.push({ label: tr.t('f.priceChip', { a: fmt(st.pmin || lo), b: price(st.pmax || hi) }), remove: () => reset('price') }); }
  if (st.instock) chips.push({ label: tr.t('f.instock'), remove: () => update({ instock: false }) });
  if (st.edit) chips.push({ label: tr.t('c.expert'), remove: () => update({ edit: '' }, { push: true }) });

  const nums: (number | '…')[] = [];
  for (let n = 1; n <= pages; n++) { if (n === 1 || n === pages || Math.abs(n - page) <= 1) nums.push(n); else if (nums[nums.length - 1] !== '…') nums.push('…'); }
  const hits = (st.cat ? PRODUCTS.filter((p) => catOf(p) === st.cat) : PRODUCTS).filter((p) => p.type !== 'giftcard').sort((a, b) => b.reviews - a.reviews).slice(0, 10);

  return (
    <>
      <section className="page-hero">
        <div className="container page-hero__inner">
          <Art className="page-hero__art" as="div" spec={{ kind: 'pageHero', ids: heroIds }} />
          <nav className="crumbs" aria-label="breadcrumbs">
            {ctx.crumbs.map((c, i) => (
              <span key={i} style={{ display: 'contents' }}>
                {c.href ? <Link href={L(c.href)}>{c.label}</Link> : <span aria-current="page">{c.label}</span>}
                {i < ctx.crumbs.length - 1 && <span aria-hidden="true">/</span>}
              </span>
            ))}
          </nav>
          <h1 className="page-hero__title h1">{ctx.title}</h1>
          <p className="page-hero__sub">{list.length ? tr.t('c.subCount', { n: tr.pl('pl.products', list.length) }) : tr.t('c.sub')}</p>
        </div>
      </section>

      <section>
        <div className="container">
          <nav className="subcats" aria-label={tr.t('f.cat')}>
            {chipCat ? (
              <>
                {chip(tr.t('common.all'), { cat: chipCat.id }, st.cat === chipCat.id && !st.type.length, `?cat=${chipCat.id}`)}
                {chipCat.groups.flatMap((g) => g.types).map((ty) => chip(tr.L(TYPES[ty].many), { cat: '', type: [ty] }, st.type.length === 1 && st.type[0] === ty, `?type=${ty}`))}
              </>
            ) : (
              <>
                {chip(tr.t('common.all'), { cat: '', brand: [], offer: [] }, !st.cat && !st.type.length && !st.brand.length && !st.offer.length && !st.q && !st.edit, '')}
                {CATS.map((c) => chip(tr.L(c), { cat: c.id }, false, `?cat=${c.id}`))}
              </>
            )}
          </nav>

          <div className="filters" ref={filtersRef}>
            <label className="switch filters__stock"><input type="checkbox" checked={st.instock} onChange={(e) => update({ instock: e.target.checked })} /><span className="switch__track" /><span>{tr.t('f.instock')}</span></label>
            {FILTERS.map(([k, label]) => {
              const n = activeCount(k, st);
              const isOpen = openFilter === k;
              return (
                <div key={k} className={`filter${isOpen ? ' is-open' : ''}`}>
                  <button className={`filter__btn${n ? ' is-set' : ''}`} type="button" aria-expanded={isOpen} onClick={() => setOpenFilter(isOpen ? '' : k)}>
                    {tr.t(label)}{n > 0 && k !== 'price' && <span className="filter__count">{n}</span>}<Icon name="chev-down" />
                  </button>
                  <div className="filter__panel">
                    {facetBody(k)}
                    {n > 0 && <div className="filter__foot"><button className="filter__reset" type="button" onClick={() => reset(k)}>{tr.t('f.reset')}</button></div>}
                  </div>
                </div>
              );
            })}
          </div>

          {chips.length > 0 && (
            <div className="active-filters">
              {chips.map((c) => <button key={c.label} className="active-chip" type="button" onClick={c.remove}>{c.label}<Icon name="close" /></button>)}
              <button className="active-chip active-chip--reset" type="button" onClick={resetAll}>{tr.t('f.resetAll')}</button>
            </div>
          )}

          <div className="results-bar" ref={resultsRef}>
            <button className="btn btn--gray btn--sm results-bar__filters-btn" type="button" onClick={() => ui.open('filters')}><Icon name="filter" className="i--sm" />{tr.t('f.filters')}</button>
            <span className="results-bar__count" aria-live="polite">{tr.pl('pl.products', list.length)}</span>
            <div className={`sort${sortOpen ? ' is-open' : ''}`} ref={sortRef}>
              <button className="sort__btn" type="button" aria-haspopup="listbox" aria-expanded={sortOpen} onClick={() => setSortOpen((o) => !o)}>{tr.t(`sort.${st.sort}` as StrKey)}<Icon name="chev-down" /></button>
              <div className="sort__menu" role="listbox">
                {SORTS.map((s) => (
                  <button key={s} className={`sort__opt${s === st.sort ? ' is-active' : ''}`} type="button" role="option" aria-selected={s === st.sort} onClick={() => { setSortOpen(false); update({ sort: s }); }}>
                    {tr.t(`sort.${s}` as StrKey)}{s === st.sort && <Icon name="check" />}
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div className="product-grid catalog-grid">
            {list.length ? shown.map((p, i) => <ProductCard key={p.id} id={p.id} style={{ animationDelay: `${(i % PER) * 30}ms` } as CSSProperties} />) : (
              <div className="no-results" style={{ gridColumn: '1/-1' }}>
                <Art className="no-results__art" as="div" spec={{ kind: 'empty', type: 'search' }} />
                <h3>{tr.t('c.none')}</h3>
                <p>{tr.t('c.noneText')}</p>
                <button className="btn btn--primary" type="button" onClick={resetAll}>{tr.t('f.resetAll')}</button>
              </div>
            )}
          </div>

          {page < pages && <button className="load-more" type="button" onClick={() => update({ page: page + 1, from }, { keepPage: true })}>{tr.t('c.more')}</button>}
          {list.length > 0 && (
            <nav className="pager" aria-label={tr.t('c.pages')}>
              {pages > 1 && nums.map((n, i) => (n === '…' ? <span key={`g${i}`} className="pager__gap">…</span> : (
                <button key={n} className={`pager__item${n >= from && n <= page ? ' is-active' : ''}`} type="button" aria-current={n === page ? 'page' : undefined} onClick={() => update({ page: n, from: n }, { keepPage: true, scroll: true })}>{n}</button>
              )))}
              {page < pages && <button className="pager__next" type="button" onClick={() => update({ page: page + 1, from: page + 1 }, { keepPage: true, scroll: true })}>{tr.t('c.next')}<Icon name="chev-right" /></button>}
              <span className="pager__info">{tr.t('c.of', { a: Math.min(page * PER, list.length), b: list.length })}</span>
            </nav>
          )}
        </div>
      </section>

      <section className="section" data-scope>
        <div className="container reveal">
          <div className="section__head">
            <h2 className="section__title"><Link href={L('/catalog?offer=hit')}>{st.cat ? tr.t('c.hits') : tr.t('c.allHits')}</Link></h2>
            <Link className="pill-link" href={L('/catalog?offer=hit')}>{tr.t('common.all')}<Icon name="chev-right" /></Link>
            <div className="section__nav">
              <button className="arrow-btn" type="button" data-dir="prev" aria-label={tr.t('common.prev')}><Icon name="arrow-left" /></button>
              <button className="arrow-btn" type="button" data-dir="next" aria-label={tr.t('common.next')}><Icon name="arrow-right" /></button>
            </div>
          </div>
          <Carousel key={st.cat || 'all'}>{hits.map((p) => <ProductCard key={p.id} id={p.id} />)}</Carousel>
        </div>
      </section>

      <div ref={sheetRef} className={`sheet${sheetOpen ? ' is-open' : ''}`} aria-hidden={!sheetOpen}>
        <div className="sheet__backdrop" onClick={ui.close} />
        <div className="sheet__panel" role="dialog" aria-modal="true" aria-label={tr.t('f.filters')}>
          <div className="sheet__head"><div className="sheet__title">{tr.t('f.filters')}</div><button className="drawer__close" type="button" onClick={ui.close} aria-label={tr.t('common.close')}><Icon name="close" /></button></div>
          <div className="sheet__body">
            <label className="switch" style={{ padding: '14px 0' }}><input type="checkbox" checked={st.instock} onChange={(e) => update({ instock: e.target.checked })} /><span className="switch__track" /><span>{tr.t('f.instock')}</span></label>
            {FILTERS.map(([k, label]) => {
              const on = openAcc.includes(k);
              const n = activeCount(k, st);
              return (
                <div key={k} className={`acc${on ? ' is-open' : ''}`}>
                  <button className="acc__btn" type="button" aria-expanded={on} onClick={() => setOpenAcc((a) => (on ? a.filter((x) => x !== k) : [...a, k]))}>
                    <span>{tr.t(label)}{n > 0 && <> <span className="filter__count">{n}</span></>}</span><Icon name="chev-down" />
                  </button>
                  <div className="acc__panel">{on && facetBody(k)}</div>
                </div>
              );
            })}
          </div>
          <div className="sheet__foot">
            <button className="btn btn--gray" type="button" onClick={resetAll}>{tr.t('f.reset')}</button>
            <button className="btn btn--primary" type="button" onClick={ui.close}>{tr.t('f.show')} {tr.pl('pl.products', list.length)}</button>
          </div>
        </div>
      </div>
    </>
  );
}
