'use client';
import Link from 'next/link';
import { useEffect, useRef, useState, type CSSProperties, type FormEvent } from 'react';
import { Art } from '../Art';
import { Icon } from '../Icon';
import { useI18n, useUI, copyText } from '../providers';
import { Carousel } from '../ui/Carousel';
import { FavButton, ProductCard } from '../ui/ProductCard';
import { Stars } from '../ui/bits';
import type { GalleryView } from '@/lib/art';
import { CATS, CONCERNS, HOWTO, INGREDIENTS, REVIEW_POOL, REVIEW_PROS, SKINS, STORES, TYPES } from '@/lib/data';
import { href, type StrKey } from '@/lib/i18n';
import { brandOf, catOf, discountOf, firstSentence, getProduct, hasPriceVariants, oldOf, priceOf, price, ratingDist, reviewsFor, sku, stockLevel, titleOf, typeLabel } from '@/lib/shop';
import { shop, useShop } from '@/lib/store';
import type { Product } from '@/lib/types';

const galleryViews = (p: Product): GalleryView[] => {
  if (p.type === 'giftcard') return ['front'];
  const s = p.art.shape;
  const v: GalleryView[] = ['front', 'texture'];
  if (p.ingr.length) v.push('ingredients');
  if (!['box', 'mask', 'pads', 'cushion', 'minijar'].includes(s)) v.push('box');
  if (s !== 'box') v.push('duo');
  return v;
};

function Gallery({ p, v }: { p: Product; v: number }) {
  const tr = useI18n();
  const views = galleryViews(p);
  const [view, setView] = useState<GalleryView>('front');
  const [zoom, setZoom] = useState<{ x: number; y: number } | null>(null);
  const va = p.variants?.[v];
  const opts = { variant: va?.color, amount: va?.price ? va.name : undefined };
  const d = discountOf(p);
  const brand = brandOf(p.brand);
  return (
    <div className="gallery">
      <div className={`gallery__main${zoom ? ' is-zoom' : ''}`} style={zoom ? ({ '--zx': `${zoom.x}%`, '--zy': `${zoom.y}%` } as CSSProperties) : undefined}
        onPointerMove={(e) => { if (e.pointerType !== 'mouse') return; const r = e.currentTarget.getBoundingClientRect(); setZoom({ x: ((e.clientX - r.left) / r.width) * 100, y: ((e.clientY - r.top) / r.height) * 100 }); }}
        onPointerLeave={() => setZoom(null)}
        onClick={() => setView(views[(views.indexOf(view) + 1) % views.length])}>
        {views.map((vw) => <Art key={vw} className={`gallery__view${vw === view ? ' is-active' : ''}`} as="div" spec={{ kind: 'gallery', id: p.id, view: vw, ...opts }} />)}
        <span className="pcard__badges">
          {d ? <span className="badge-sale">−{d}%</span> : null}
          {p.tags.includes('hit') && <span className="tag tag--hit">{tr.t('tag.hit')}</span>}
          {p.tags.includes('new') && <span className="tag tag--new">{tr.t('tag.new')}</span>}
        </span>
        <span className="gallery__zoom-hint"><Icon name="search" className="i--xs" />{tr.t('pp.zoom')}</span>
      </div>
      {views.length > 1 && (
        <div className="gallery__thumbs" role="tablist">
          {views.map((vw) => (
            <button key={vw} className={`gallery__thumb${vw === view ? ' is-active' : ''}`} type="button" role="tab" aria-selected={vw === view} aria-label={tr.t(`pp.view.${vw}` as StrKey)} onClick={() => setView(vw)}>
              <Art spec={{ kind: 'gallery', id: p.id, view: vw, ...opts }} />
            </button>
          ))}
        </div>
      )}
      <Link className="pp__brand-link" href={href(tr.lang, `/catalog?brand=${brand.id}`)}>
        <span>{tr.t('pp.allBrand')} {brand.name}</span>
        <span style={{ display: 'flex', alignItems: 'center', gap: 10 }}><b>{brand.name}</b><Icon name="chev-right" /></span>
      </Link>
    </div>
  );
}

function BuyCard({ p, v, setV }: { p: Product; v: number; setV: (v: number) => void }) {
  const tr = useI18n();
  const ui = useUI();
  const q = useShop((s) => s.cart.find((x) => x.id === p.id && x.v === v)?.q ?? 0);
  const city = useShop((s) => s.city);
  const [tab, setTab] = useState<'online' | 'stores'>('online');
  const pr = priceOf(p, v), old = oldOf(p, v), d = old ? Math.round((1 - pr / old) * 100) : 0;
  const priced = hasPriceVariants(p);
  const rows: [string, number][] = tab === 'online'
    ? [[city || tr.t('city.default'), p.stock], [tr.lang === 'en' ? 'Saint Petersburg' : 'Санкт-Петербург', Math.round(p.stock * 0.6)], [tr.lang === 'en' ? 'Kazan' : 'Казань', Math.round(p.stock * 0.3)]]
    : STORES.map((s, i) => [`${tr.L(s.city)}, ${tr.L(s.addr)}`, Math.max(0, Math.round(p.stock * [0.5, 0.35, 0.4, 0.2][i]) - (i === 3 ? 3 : 0))]);
  const dots = { many: 3, some: 2, few: 1, none: 0 };
  return (
    <div className={`buy-card${old ? ' is-sale' : ''}`}>
      <div className="buy-card__main">
        <div className="buy-card__prices">
          <span className="buy-card__price">{price(pr)}</span>
          {old ? <><s className="buy-card__old">{price(old)}</s><span className="buy-card__off">−{d}%</span></> : null}
        </div>
        <a className="buy-card__split" href="#" onClick={(e) => { e.preventDefault(); ui.soon(); }}>{tr.t('pp.split', { sum: price(Math.ceil(pr / 4)) })}<Icon name="chev-right" /></a>
        {p.variants && (
          <>
            <div className="buy-card__label">{priced ? tr.t('pp.amount') : tr.t('pp.shade')}: <b>{p.variants[v].name}</b></div>
            <div className="variants" role="radiogroup" aria-label={priced ? tr.t('pp.amount') : tr.t('pp.shade')}>
              {p.variants.map((x, i) => (x.color && !priced
                ? <button key={x.name} className={`swatch${i === v ? ' is-active' : ''}`} type="button" role="radio" aria-checked={i === v} aria-label={x.name} title={x.name} style={{ background: x.color }} onClick={() => setV(i)} />
                : <button key={x.name} className={`variant${i === v ? ' is-active' : ''}`} type="button" role="radio" aria-checked={i === v} onClick={() => setV(i)}>{x.name}</button>))}
            </div>
          </>
        )}
        <div className="buy-card__actions">
          {p.stock <= 0 ? <button className="btn btn--gray" type="button" disabled>{tr.t('card.oos')}</button>
            : q > 0 ? (
              <div className="buy-card__incart">
                <div className="qty">
                  <button className="qty__btn" type="button" onClick={() => shop.setQty(p.id, v, q - 1)} aria-label={tr.t('card.dec')}><Icon name="minus" /></button>
                  <span className="qty__val">{q}</span>
                  <button className="qty__btn" type="button" onClick={() => shop.setQty(p.id, v, q + 1)} aria-label={tr.t('card.inc')}><Icon name="plus" /></button>
                </div>
                <button className="btn btn--primary" type="button" onClick={() => ui.open('cart')}>{tr.t('pp.goCart')}</button>
              </div>
            ) : <button className="btn btn--primary" type="button" onClick={() => ui.addToCart(p.id, v)}><Icon name="bag" />{tr.t('pp.add')}</button>}
          <FavButton id={p.id} className="buy-card__fav" />
        </div>
      </div>
      <div className="buy-card__stock">
        <div className="stock-tabs" role="tablist">
          {(['online', 'stores'] as const).map((k) => <button key={k} className={`stock-tab${k === tab ? ' is-active' : ''}`} type="button" role="tab" aria-selected={k === tab} onClick={() => setTab(k)}>{tr.t(`pp.${k}` as StrKey)}</button>)}
        </div>
        {rows.map(([name, n]) => {
          const lv = stockLevel(n);
          return (
            <div key={name} className="stock-row">
              <span>{name}</span><span className="stock-row__dots" />
              <span className={`stock-row__val${lv === 'few' ? ' is-low' : lv === 'none' ? ' is-none' : ''}`}>{tr.t(`pp.lvl.${lv}` as StrKey)}<i>{[0, 1, 2].map((k) => <b key={k} style={{ opacity: k < dots[lv] ? 1 : 0.25 }} />)}</i></span>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function About({ p }: { p: Product }) {
  const tr = useI18n();
  const [tab, setTab] = useState('desc');
  const brand = brandOf(p.brand);
  const skins = p.skin.map((k) => tr.L(SKINS[k])).join(', ').toLowerCase();
  const concerns = p.concerns.map((k) => tr.L(CONCERNS[k])).join(', ').toLowerCase();
  const tabs: [string, StrKey][] = [['desc', 'pp.desc'], ['specs', 'pp.specs'], ...(p.ingr.length ? [['ingr', 'pp.ingr'] as [string, StrKey]] : []), ['how', 'pp.how']];
  const specs: [string, React.ReactNode][] = [
    [tr.t('pp.brand'), <Link key="b" className="accent" href={href(tr.lang, `/catalog?brand=${brand.id}`)}>{brand.name}</Link>],
    [tr.t('pp.type'), typeLabel(p, tr.lang)],
    ...(p.volume ? [[tr.t('pp.vol'), p.volume] as [string, string]] : []),
    ...(skins ? [[tr.t('pp.skin'), skins] as [string, string]] : []),
    ...(concerns ? [[tr.t('pp.concern'), concerns] as [string, string]] : []),
    [tr.t('pp.country'), tr.t('pp.korea')],
    [tr.t('pp.sku'), sku(p)]
  ];
  return (
    <div className="pp-about reveal">
      <div>
        <h2 className="h2">{tr.t('pp.about')}</h2>
        <div className="tabs" role="tablist">
          {tabs.map(([k, label]) => <button key={k} className={`tab${k === tab ? ' is-active' : ''}`} type="button" role="tab" aria-selected={k === tab} aria-controls={`tab-${k}`} id={`tabbtn-${k}`} onClick={() => setTab(k)}>{tr.t(label)}</button>)}
        </div>
        <div className={`tab-panel${tab === 'desc' ? ' is-active' : ''}`} id="tab-desc" role="tabpanel" aria-labelledby="tabbtn-desc">
          <p>{tr.L(p.desc)}</p>{skins && <p>{tr.t('pp.suits', { v: skins })}</p>}{concerns && <p>{tr.t('pp.solves', { v: concerns })}</p>}
        </div>
        <div className={`tab-panel${tab === 'specs' ? ' is-active' : ''}`} id="tab-specs" role="tabpanel" aria-labelledby="tabbtn-specs">
          <dl className="specs">{specs.map(([a, b]) => <div key={a} style={{ display: 'contents' }}><dt>{a}</dt><dd>{b}</dd></div>)}</dl>
        </div>
        {p.ingr.length > 0 && (
          <div className={`tab-panel${tab === 'ingr' ? ' is-active' : ''}`} id="tab-ingr" role="tabpanel" aria-labelledby="tabbtn-ingr">
            <p><b>{tr.t('pp.keyIngr')}:</b></p>
            <ol>{p.ingr.map((k) => <li key={k}><b>{tr.L(INGREDIENTS[k])}</b> — {tr.L(INGREDIENTS[k].note)}</li>)}</ol>
            <p>{tr.t('pp.inci')}</p>
          </div>
        )}
        <div className={`tab-panel${tab === 'how' ? ' is-active' : ''}`} id="tab-how" role="tabpanel" aria-labelledby="tabbtn-how"><p>{tr.L(HOWTO[p.type])}</p></div>
      </div>
      {p.ingr.length > 0 ? (
        <div>
          <h2 className="h2">{tr.t('pp.actives')}</h2>
          <div className="ingredients">
            {p.ingr.map((k) => (
              <div key={k} className="ingredient">
                <Art className="ingredient__art" as="div" spec={{ kind: 'ingredient', key: k }} />
                <span>{tr.L(INGREDIENTS[k])}<br /><small>{tr.L(INGREDIENTS[k].note)}</small></span>
              </div>
            ))}
          </div>
        </div>
      ) : <div />}
    </div>
  );
}

function ReviewForm({ p }: { p: Product }) {
  const tr = useI18n();
  const ui = useUI();
  const [rating, setRating] = useState(0);
  const [hover, setHover] = useState(0);
  const submit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const text = (e.currentTarget.elements.namedItem('text') as HTMLTextAreaElement).value.trim();
    if (!rating || text.length < 3) { ui.toast({ title: tr.t('rv.need'), icon: 'star' }); return; }
    ui.closeModal();
    ui.toast({ title: tr.t('rv.thanks') });
  };
  const shown = hover || rating;
  return (
    <>
      <h2 className="modal__title">{tr.t('rv.title')}</h2>
      <p className="modal__text">{titleOf(p)}</p>
      <form className="modal__stack" onSubmit={submit} noValidate>
        <div className="field">
          <span className="field__label">{tr.t('rv.rating')}</span>
          <div className="star-input" role="radiogroup" aria-label={tr.t('rv.rating')} onMouseLeave={() => setHover(0)}>
            {[1, 2, 3, 4, 5].map((n) => <button key={n} type="button" role="radio" aria-checked={n === rating} aria-label={tr.t('rv.star', { n })} className={n <= shown ? 'is-on' : ''} onMouseEnter={() => setHover(n)} onClick={() => setRating(n)}><Icon name="star" className="i--fill" /></button>)}
          </div>
        </div>
        <label className="field"><span className="field__label">{tr.t('rv.name')}</span><input className="input" name="name" autoComplete="given-name" /></label>
        <label className="field"><span className="field__label">{tr.t('rv.text')}</span><textarea className="input" name="text" rows={4} /></label>
        <button className="btn btn--primary btn--block" type="submit">{tr.t('rv.send')}</button>
      </form>
    </>
  );
}

function Reviews({ p }: { p: Product }) {
  const tr = useI18n();
  const ui = useUI();
  const rv = reviewsFor(p, 6);
  const dist = ratingDist(p);
  const [helpful, setHelpful] = useState<Record<number, boolean>>({});
  return (
    <section className="section" id="reviews">
      <div className="container reveal">
        <div className="section__head">
          <h2 className="section__title">{tr.t('pp.reviews')}</h2>
          <button className="pill-link" type="button" onClick={() => ui.openModal(<ReviewForm p={p} />, { label: tr.t('rv.title') })}>{tr.t('pp.write')}<Icon name="chev-right" /></button>
        </div>
        <div className="pp-reviews">
          <div className="rating-summary">
            <div>
              <div className="rating-summary__score">{p.rating}<small> /5</small></div>
              <Stars rating={p.rating} />
              <div className="rating-summary__count">{tr.t('pp.basedOn', { n: tr.pl('pl.reviews', p.reviews) })}</div>
              <div className="rating-summary__count">{tr.t('pp.recommend', { p: Math.min(99, dist[0] + dist[1]) })}</div>
            </div>
            <div className="rating-bars">
              {dist.map((pc, i) => <div key={i} className="rating-bar"><span>{5 - i}</span><span className="rating-bar__track"><span className="rating-bar__fill" style={{ display: 'block', width: `${pc}%` }} /></span><span>{pc}%</span></div>)}
            </div>
          </div>
          <div className="review-list">
            {rv.map((r, i) => (
              <div key={i} className="review">
                <div className="review__head"><div className="review__name">{tr.L(r.name)}<span className="review__date">{tr.date(r.date)}</span></div><Stars rating={r.rating} /></div>
                <p className="review__text">{tr.L(r.text)}</p>
                {r.pros.length > 0 && <div className="review__pros">{r.pros.map((k) => <span key={k}>{tr.L(REVIEW_PROS[k])}</span>)}</div>}
                <button className={`review__helpful${helpful[i] ? ' is-active' : ''}`} type="button" onClick={() => setHelpful((h) => ({ ...h, [i]: true }))}>
                  <Icon name="thumb" />{tr.t('pp.helpful')} · <span>{3 + ((i * 7 + p.reviews) % 23) + (helpful[i] ? 1 : 0)}</span>
                </button>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

function CarouselSection({ title, ids }: { title: string; ids: string[] }) {
  const tr = useI18n();
  if (!ids.length) return null;
  return (
    <section className="section" data-scope>
      <div className="container reveal">
        <div className="section__head">
          <h2 className="section__title">{title}</h2>
          <div className="section__nav">
            <button className="arrow-btn" type="button" data-dir="prev" aria-label={tr.t('common.prev')}><Icon name="arrow-left" /></button>
            <button className="arrow-btn" type="button" data-dir="next" aria-label={tr.t('common.next')}><Icon name="arrow-right" /></button>
          </div>
        </div>
        <Carousel key={ids.join()}>{ids.map((id) => <ProductCard key={id} id={id} />)}</Carousel>
      </div>
    </section>
  );
}

export function ProductView({ id, related, similar }: { id: string; related: string[]; similar: string[] }) {
  const tr = useI18n();
  const ui = useUI();
  const p = getProduct(id)!;
  const [v, setV] = useState(0);
  const recent = useShop((s) => s.recent);
  const [recentShown, setRecentShown] = useState<string[]>([]);
  const cat = CATS.find((c) => c.id === catOf(p))!;
  const seen = useRef(false);

  useEffect(() => {
    if (seen.current) return;
    seen.current = true;
    setRecentShown(shop.get().recent.filter((x) => x !== id).slice(0, 10));
    shop.viewed(id);
  }, [id]);
  void recent;

  const share = () => {
    const url = window.location.href;
    if (navigator.share) navigator.share({ title: titleOf(p), url }).catch(() => {});
    else { copyText(url); ui.toast({ title: tr.t('pp.shared'), icon: 'share' }); }
  };

  return (
    <>
      <section className="container pp">
        <nav className="crumbs pp__crumbs" aria-label="breadcrumbs">
          <Link href={href(tr.lang, '/')}>{tr.t('c.home')}</Link><span aria-hidden="true">/</span>
          <Link href={href(tr.lang, '/catalog')}>{tr.t('c.title')}</Link><span aria-hidden="true">/</span>
          <Link href={href(tr.lang, `/catalog?cat=${cat.id}`)}>{tr.L(cat)}</Link><span aria-hidden="true">/</span>
          <Link href={href(tr.lang, `/catalog?type=${p.type}`)}>{tr.L(TYPES[p.type].many)}</Link>
        </nav>
        <div className="pp__grid">
          <Gallery p={p} v={v} />
          <div className="pp__info">
            <div className="pp__meta">
              <div className="pp__rating"><Icon name="star" className="i--fill" /><b>{p.rating}</b><span className="muted">·</span><a href="#reviews">{tr.pl('pl.reviews', p.reviews)}</a></div>
              <button className="pp__share" type="button" onClick={share}>{tr.t('pp.share')}<Icon name="share" /></button>
            </div>
            <div className="pp__type">{typeLabel(p, tr.lang)}</div>
            <h1 className="pp__title">{titleOf(p)}</h1>
            <p className="pp__short">{firstSentence(tr.L(p.desc))}</p>
            <BuyCard p={p} v={v} setV={setV} />
            <div className="perks">
              {([['shield', 'pp.perk1', 'pp.perk1t'], ['truck', 'pp.perk2', 'pp.perk2t'], ['return', 'pp.perk3', 'pp.perk3t']] as [string, StrKey, StrKey][]).map(([ic, a, b]) => (
                <div key={a} className="perk"><Icon name={ic} /><b>{tr.t(a)}</b><span>{tr.t(b)}</span></div>
              ))}
            </div>
          </div>
        </div>
        <About p={p} />
      </section>
      <Reviews p={p} />
      <CarouselSection title={tr.t('pp.related')} ids={related} />
      <CarouselSection title={tr.t('pp.similar')} ids={similar} />
      <CarouselSection title={tr.t('pp.recent')} ids={recentShown} />
    </>
  );
}

export const REVIEW_COUNT = REVIEW_POOL.length;
