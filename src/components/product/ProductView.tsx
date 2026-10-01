'use client';
import Link from 'next/link';
import { useEffect, useRef, useState, type CSSProperties, type FormEvent } from 'react';
import { Art } from '../Art';
import { Icon } from '../Icon';
import { useUI, copyText } from '../providers';
import { Slider, SliderScope } from '../ui/Slider';
import { FavButton, ProductCard } from '../ui/ProductCard';
import { SectionHead, Stars } from '../ui/bits';
import type { GalleryView } from '@/lib/art';
import { CATS, CONCERNS, CONFIG, HOWTO, INGREDIENTS, REVIEW_POOL, REVIEW_PROS, SKINS, STORES, TYPES } from '@/lib/data';
import { count, dateRu } from '@/lib/format';
import { brandOf, catOf, discountOf, firstSentence, getProduct, hasPriceVariants, oldOf, priceOf, price, ratingDist, reviewsFor, sku, stockLevel, titleOf, typeLabel } from '@/lib/shop';
import { shop, useShop } from '@/lib/store';
import type { Product } from '@/lib/types';

const VIEW_LABELS: Record<GalleryView, string> = { front: 'Упаковка', texture: 'Текстура', ingredients: 'Компоненты', box: 'Коробка', duo: 'Дуэт' };
const LEVELS = { many: 'много', some: 'есть', few: 'мало', none: 'нет' };
const reviewsN = (n: number) => count(n, 'отзыв', 'отзыва', 'отзывов');

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
          {p.tags.includes('hit') && <span className="tag tag--hit">Хит</span>}
          {p.tags.includes('new') && <span className="tag tag--new">New</span>}
        </span>
        <span className="gallery__zoom-hint"><Icon name="search" className="i--xs" />Наведите для увеличения</span>
      </div>
      {views.length > 1 && (
        <div className="gallery__thumbs" role="tablist">
          {views.map((vw) => (
            <button key={vw} className={`gallery__thumb${vw === view ? ' is-active' : ''}`} type="button" role="tab" aria-selected={vw === view} aria-label={VIEW_LABELS[vw]} onClick={() => setView(vw)}>
              <Art spec={{ kind: 'gallery', id: p.id, view: vw, ...opts }} />
            </button>
          ))}
        </div>
      )}
      <Link className="pp__brand-link" href={`/catalog?brand=${brand.id}`}>
        <span>Все товары бренда {brand.name}</span>
        <span style={{ display: 'flex', alignItems: 'center', gap: 10 }}><b>{brand.name}</b><Icon name="chev-right" /></span>
      </Link>
    </div>
  );
}

function BuyCard({ p, v, setV }: { p: Product; v: number; setV: (v: number) => void }) {
  const ui = useUI();
  const q = useShop((s) => s.cart.find((x) => x.id === p.id && x.v === v)?.q ?? 0);
  const city = useShop((s) => s.city);
  const [tab, setTab] = useState<'online' | 'stores'>('online');
  const pr = priceOf(p, v), old = oldOf(p, v), d = old ? Math.round((1 - pr / old) * 100) : 0;
  const priced = hasPriceVariants(p);
  const rows: [string, number][] = tab === 'online'
    ? [[city || CONFIG.cities[0], p.stock], ...CONFIG.cities.filter((c) => c !== (city || CONFIG.cities[0])).slice(0, 2).map((c, i): [string, number] => [c, Math.round(p.stock * [0.6, 0.3][i])])]
    : STORES.map((s, i) => [s.addr, Math.max(0, Math.round(p.stock * [0.5, 0.35, 0.4, 0.2][i]) - (i === 3 ? 3 : 0))]);
  const dots = { many: 3, some: 2, few: 1, none: 0 };
  return (
    <div className={`buy-card${old ? ' is-sale' : ''}`}>
      <div className="buy-card__main">
        <div className="buy-card__prices">
          <span className="buy-card__price">{price(pr)}</span>
          {old ? <><s className="buy-card__old">{price(old)}</s><span className="buy-card__off">−{d}%</span></> : null}
        </div>
        <a className="buy-card__split" href="#" onClick={(e) => { e.preventDefault(); ui.soon(); }}>{price(Math.ceil(pr / 4))} × 4 платежа частями<Icon name="chev-right" /></a>
        {p.variants && (
          <>
            <div className="buy-card__label">{priced ? 'Номинал' : 'Оттенок'}: <b>{p.variants[v].name}</b></div>
            <div className="variants" role="radiogroup" aria-label={priced ? 'Номинал' : 'Оттенок'}>
              {p.variants.map((x, i) => (x.color && !priced
                ? <button key={x.name} className={`swatch${i === v ? ' is-active' : ''}`} type="button" role="radio" aria-checked={i === v} aria-label={x.name} title={x.name} style={{ background: x.color }} onClick={() => setV(i)} />
                : <button key={x.name} className={`variant${i === v ? ' is-active' : ''}`} type="button" role="radio" aria-checked={i === v} onClick={() => setV(i)}>{x.name}</button>))}
            </div>
          </>
        )}
        <div className="buy-card__actions">
          {p.stock <= 0 ? <button className="btn btn--gray" type="button" disabled>Нет в наличии</button>
            : q > 0 ? (
              <div className="buy-card__incart">
                <div className="qty">
                  <button className="qty__btn" type="button" onClick={() => shop.setQty(p.id, v, q - 1)} aria-label="Уменьшить количество"><Icon name="minus" /></button>
                  <span className="qty__val">{q}</span>
                  <button className="qty__btn" type="button" onClick={() => shop.setQty(p.id, v, q + 1)} aria-label="Увеличить количество"><Icon name="plus" /></button>
                </div>
                <button className="btn btn--primary" type="button" onClick={() => ui.open('cart')}>Перейти в корзину</button>
              </div>
            ) : <button className="btn btn--primary" type="button" onClick={() => ui.addToCart(p.id, v)}><Icon name="bag" />Добавить в корзину</button>}
          <FavButton id={p.id} className="buy-card__fav" />
        </div>
      </div>
      <div className="buy-card__stock">
        <div className="stock-tabs" role="tablist">
          {(['online', 'stores'] as const).map((k) => <button key={k} className={`stock-tab${k === tab ? ' is-active' : ''}`} type="button" role="tab" aria-selected={k === tab} onClick={() => setTab(k)}>{k === 'online' ? 'Интернет-магазин' : 'Магазины'}</button>)}
        </div>
        {rows.map(([name, n]) => {
          const lv = stockLevel(n);
          return (
            <div key={name} className="stock-row">
              <span>{name}</span><span className="stock-row__dots" />
              <span className={`stock-row__val${lv === 'few' ? ' is-low' : lv === 'none' ? ' is-none' : ''}`}>{LEVELS[lv]}<i>{[0, 1, 2].map((k) => <b key={k} style={{ opacity: k < dots[lv] ? 1 : 0.25 }} />)}</i></span>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function About({ p }: { p: Product }) {
  const [tab, setTab] = useState('desc');
  const brand = brandOf(p.brand);
  const skins = p.skin.map((k) => SKINS[k]).join(', ').toLowerCase();
  const concerns = p.concerns.map((k) => CONCERNS[k]).join(', ').toLowerCase();
  const tabs: [string, string][] = [['desc', 'Описание'], ['specs', 'Характеристики'], ...(p.ingr.length ? [['ingr', 'Состав'] as [string, string]] : []), ['how', 'Применение']];
  const specs: [string, React.ReactNode][] = [
    ['Бренд', <Link key="b" className="accent" href={`/catalog?brand=${brand.id}`}>{brand.name}</Link>],
    ['Тип', typeLabel(p)],
    ...(p.volume ? [['Объём', p.volume] as [string, string]] : []),
    ...(skins ? [['Тип кожи', skins] as [string, string]] : []),
    ...(concerns ? [['Задачи', concerns] as [string, string]] : []),
    ['Страна', 'Республика Корея'],
    ['Артикул', sku(p)]
  ];
  return (
    <div className="pp-about reveal">
      <div>
        <h2 className="h2">О продукте</h2>
        <div className="tabs" role="tablist">
          {tabs.map(([k, label]) => <button key={k} className={`tab${k === tab ? ' is-active' : ''}`} type="button" role="tab" aria-selected={k === tab} aria-controls={`tab-${k}`} id={`tabbtn-${k}`} onClick={() => setTab(k)}>{label}</button>)}
        </div>
        <div className={`tab-panel${tab === 'desc' ? ' is-active' : ''}`} id="tab-desc" role="tabpanel" aria-labelledby="tabbtn-desc">
          <p>{p.desc}</p>{skins && <p>Подходит для кожи: {skins}.</p>}{concerns && <p>Решает задачи: {concerns}.</p>}
        </div>
        <div className={`tab-panel${tab === 'specs' ? ' is-active' : ''}`} id="tab-specs" role="tabpanel" aria-labelledby="tabbtn-specs">
          <dl className="specs">{specs.map(([a, b]) => <div key={a} style={{ display: 'contents' }}><dt>{a}</dt><dd>{b}</dd></div>)}</dl>
        </div>
        {p.ingr.length > 0 && (
          <div className={`tab-panel${tab === 'ingr' ? ' is-active' : ''}`} id="tab-ingr" role="tabpanel" aria-labelledby="tabbtn-ingr">
            <p><b>Ключевые компоненты:</b></p>
            <ol>{p.ingr.map((k) => <li key={k}><b>{INGREDIENTS[k].name}</b> — {INGREDIENTS[k].note}</li>)}</ol>
            <p>Полный состав (INCI) указан на упаковке.</p>
          </div>
        )}
        <div className={`tab-panel${tab === 'how' ? ' is-active' : ''}`} id="tab-how" role="tabpanel" aria-labelledby="tabbtn-how"><p>{HOWTO[p.type]}</p></div>
      </div>
      {p.ingr.length > 0 ? (
        <div>
          <h2 className="h2">Активные компоненты</h2>
          <div className="ingredients">
            {p.ingr.map((k) => (
              <div key={k} className="ingredient">
                <Art className="ingredient__art" as="div" spec={{ kind: 'ingredient', key: k }} />
                <span>{INGREDIENTS[k].name}<br /><small>{INGREDIENTS[k].note}</small></span>
              </div>
            ))}
          </div>
        </div>
      ) : <div />}
    </div>
  );
}

function ReviewForm({ p }: { p: Product }) {
  const ui = useUI();
  const [rating, setRating] = useState(0);
  const [hover, setHover] = useState(0);
  const submit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const text = (e.currentTarget.elements.namedItem('text') as HTMLTextAreaElement).value.trim();
    if (!rating || text.length < 3) { ui.toast({ title: 'Поставьте оценку и напишите пару слов', icon: 'star' }); return; }
    ui.closeModal();
    ui.toast({ title: 'Спасибо! Отзыв появится после модерации' });
  };
  const shown = hover || rating;
  return (
    <>
      <h2 className="modal__title">Ваш отзыв</h2>
      <p className="modal__text">{titleOf(p)}</p>
      <form className="modal__stack" onSubmit={submit} noValidate>
        <div className="field">
          <span className="field__label">Оценка</span>
          <div className="star-input" role="radiogroup" aria-label="Оценка" onMouseLeave={() => setHover(0)}>
            {[1, 2, 3, 4, 5].map((n) => <button key={n} type="button" role="radio" aria-checked={n === rating} aria-label={`Оценка ${n} из 5`} className={n <= shown ? 'is-on' : ''} onMouseEnter={() => setHover(n)} onClick={() => setRating(n)}><Icon name="star" className="i--fill" /></button>)}
          </div>
        </div>
        <label className="field"><span className="field__label">Имя</span><input className="input" name="name" autoComplete="given-name" /></label>
        <label className="field"><span className="field__label">Отзыв</span><textarea className="input" name="text" rows={4} /></label>
        <button className="btn btn--primary btn--block" type="submit">Отправить</button>
      </form>
    </>
  );
}

function Reviews({ p }: { p: Product }) {
  const ui = useUI();
  const rv = reviewsFor(p, 6);
  const dist = ratingDist(p);
  const [helpful, setHelpful] = useState<Record<number, boolean>>({});
  return (
    <section className="section" id="reviews">
      <div className="container reveal">
        <div className="section__head">
          <h2 className="section__title">Отзывы</h2>
          <button className="pill-link" type="button" onClick={() => ui.openModal(<ReviewForm p={p} />, { label: 'Ваш отзыв' })}>Написать отзыв<Icon name="chev-right" /></button>
        </div>
        <div className="pp-reviews">
          <div className="rating-summary">
            <div>
              <div className="rating-summary__score">{p.rating}<small> /5</small></div>
              <Stars rating={p.rating} />
              <div className="rating-summary__count">на основе {reviewsN(p.reviews)}</div>
              <div className="rating-summary__count">{Math.min(99, dist[0] + dist[1])}% покупателей рекомендуют</div>
            </div>
            <div className="rating-bars">
              {dist.map((pc, i) => <div key={i} className="rating-bar"><span>{5 - i}</span><span className="rating-bar__track"><span className="rating-bar__fill" style={{ display: 'block', width: `${pc}%` }} /></span><span>{pc}%</span></div>)}
            </div>
          </div>
          <div className="review-list">
            {rv.map((r, i) => (
              <div key={i} className="review">
                <div className="review__head"><div className="review__name">{r.name}<span className="review__date">{dateRu(r.date)}</span></div><Stars rating={r.rating} /></div>
                <p className="review__text">{r.text}</p>
                {r.pros.length > 0 && <div className="review__pros">{r.pros.map((k) => <span key={k}>{REVIEW_PROS[k]}</span>)}</div>}
                <button className={`review__helpful${helpful[i] ? ' is-active' : ''}`} type="button" onClick={() => setHelpful((h) => ({ ...h, [i]: true }))}>
                  <Icon name="thumb" />Полезно · <span>{3 + ((i * 7 + p.reviews) % 23) + (helpful[i] ? 1 : 0)}</span>
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
  if (!ids.length) return null;
  return (
    <SliderScope>
      <section className="section">
        <div className="container reveal">
          <SectionHead title={title} nav />
          <Slider key={ids.join()} label={title}>{ids.map((id) => <ProductCard key={id} id={id} />)}</Slider>
        </div>
      </section>
    </SliderScope>
  );
}

export function ProductView({ id, related, similar }: { id: string; related: string[]; similar: string[] }) {
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
    else { copyText(url); ui.toast({ title: 'Ссылка скопирована', icon: 'share' }); }
  };

  return (
    <>
      <section className="container pp">
        <nav className="crumbs pp__crumbs" aria-label="breadcrumbs">
          <Link href={'/'}>Главная</Link><span aria-hidden="true">/</span>
          <Link href={'/catalog'}>Каталог</Link><span aria-hidden="true">/</span>
          <Link href={`/catalog?cat=${cat.id}`}>{cat.name}</Link><span aria-hidden="true">/</span>
          <Link href={`/catalog?type=${p.type}`}>{TYPES[p.type].many}</Link>
        </nav>
        <div className="pp__grid">
          <Gallery p={p} v={v} />
          <div className="pp__info">
            <div className="pp__meta">
              <div className="pp__rating"><Icon name="star" className="i--fill" /><b>{p.rating}</b><span className="muted">·</span><a href="#reviews">{count(p.reviews, 'отзыв', 'отзыва', 'отзывов')}</a></div>
              <button className="pp__share" type="button" onClick={share}>Поделиться<Icon name="share" /></button>
            </div>
            <div className="pp__type">{typeLabel(p)}</div>
            <h1 className="pp__title">{titleOf(p)}</h1>
            <p className="pp__short">{firstSentence(p.desc)}</p>
            <BuyCard p={p} v={v} setV={setV} />
            <div className="perks">
              {[['shield', 'Оригинал из Кореи', 'Сертификаты на каждую партию'], ['truck', 'Доставка по Душанбе', `Бесплатно от ${price(CONFIG.freeShipping)}`], ['return', 'Возврат 14 дней', 'Если упаковка не вскрыта']].map(([ic, a, b]) => (
                <div key={a} className="perk"><Icon name={ic} /><b>{a}</b><span>{b}</span></div>
              ))}
            </div>
          </div>
        </div>
        <About p={p} />
      </section>
      <Reviews p={p} />
      <CarouselSection title="С этим покупают" ids={related} />
      <CarouselSection title="Похожие товары" ids={similar} />
      <CarouselSection title="Вы смотрели" ids={recentShown} />
    </>
  );
}

export const REVIEW_COUNT = REVIEW_POOL.length;
