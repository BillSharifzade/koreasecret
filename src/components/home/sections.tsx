'use client';
import Link from 'next/link';
import type { CSSProperties } from 'react';
import { Art } from '../Art';
import { Icon } from '../Icon';
import GlassSurface, { GLASS } from '../ui/GlassSurface';
import { ProductCard } from '../ui/ProductCard';
import { Slider, SliderArrows, SliderScope } from '../ui/Slider';
import { SmartLink } from '../ui/SmartLink';
import { Rich, SectionHead, Stars } from '../ui/bits';
import { GiftCardButton } from './ClientBits';
import { StoreCard } from './StoreCard';
import { asset } from '@/lib/asset';
import { linkQuery, queryResults } from '@/lib/catalog';
import { BLOGGERS, BRANDS, COLLECTIONS, HOME_CATS, PHOTO_CREDITS, PRODUCTS, PROMOS, STORES } from '@/lib/data';
import { count } from '@/lib/format';
import { mdText } from '@/lib/md';
import { brandOf, getProduct, productPath, reviewsFor } from '@/lib/shop';
import type { Blogger, HomeSection, Product } from '@/lib/types';

const items = (n: number) => count(n, 'товар', 'товара', 'товаров');
type Of<T extends HomeSection['type']> = Extract<HomeSection, { type: T }>;

export function CategoryTiles({ id }: { id?: string }) {
  if (!HOME_CATS.length) return null;
  return (
    <section className="cats" id={id} aria-label="Категории">
      <div className="container">
        <div className="cats__card">
          <nav className="cats__list" aria-label="Категории">
            {HOME_CATS.map((c) => (
              <SmartLink key={c.id} className="cat-tile" href={c.href}>
                {c.image
                  // eslint-disable-next-line @next/next/no-img-element
                  ? <span className="art cat-tile__icon"><img src={asset(c.image)} alt="" draggable={false} /></span>
                  : <Art className="cat-tile__icon" spec={{ kind: 'icon', name: c.icon }} />}
                <span className="cat-tile__label">{c.name}</span>
              </SmartLink>
            ))}
          </nav>
        </div>
      </div>
    </section>
  );
}

/** The products a «products» section shows: pinned first, then what its catalogue query finds. */
export function sectionProducts(s: Of<'products'>): Product[] {
  const pinned = s.pinned.map((id) => getProduct(id)).filter((p): p is Product => !!p);
  const seen = new Set(pinned.map((p) => p.id));
  const list = [...pinned, ...queryResults(s.query, s.sort).filter((p) => !seen.has(p.id))];
  const from = s.offset || 0;
  if (s.fill && list.length < from + s.limit) {
    const have = new Set(list.map((p) => p.id));
    list.push(...queryResults('', s.sort).filter((p) => !have.has(p.id) && p.type !== 'giftcard'));
  }
  return list.slice(from, from + s.limit);
}

/** A row (or grid) of product cards: Новинки, Скидки, Хиты, Рекомендуем… */
export function ProductSection({ s }: { s: Of<'products'> }) {
  const list = sectionProducts(s);
  if (!list.length) return null;
  if (s.layout === 'grid') {
    return (
      <section className="section" id={s.id}>
        <div className="container reveal">
          <SectionHead title={s.title} link={s.link} />
          <div className="product-grid">{list.map((p) => <ProductCard key={p.id} id={p.id} />)}</div>
        </div>
      </section>
    );
  }
  return (
    <SliderScope>
      <section className="section" id={s.id}>
        <div className="container reveal">
          <SectionHead title={s.title} link={s.link} nav />
          <Slider label={mdText(s.title)}>{list.map((p) => <ProductCard key={p.id} id={p.id} />)}</Slider>
        </div>
      </section>
    </SliderScope>
  );
}

/** Акции: an endless, centred strip that plays by itself and stops under the pointer. */
export function Promos({ s }: { s: Of<'promos'> }) {
  if (!PROMOS.length) return null;
  return (
    <SliderScope>
      <section className="section" id={s.id}>
        <div className="container reveal"><SectionHead title={s.title} link={s.link} nav /></div>
        <div className="bleed reveal">
          <Slider kind="loop" className="promos" autoplay={5200} label={mdText(s.title)}>
            {PROMOS.map((p) => (
              <SmartLink key={p.id} className={`promo-card${p.dark ? ' is-dark' : ''}`} href={p.link} draggable={false} data-surface={p.dark ? 'light' : 'dark'}>
                <Art className="promo-card__bg" as="div" spec={{ kind: 'promo', id: p.id }} />
                <div className="promo-card__content"><div className="promo-card__title">{p.title}</div><div className="promo-card__date">{p.date}</div></div>
                <div className="promo-card__hline" /><div className="promo-card__vline" /><div className="promo-card__vline promo-card__vline--sm" />
                <div className="promo-card__btn"><span className="btn btn--primary">Подробнее</span></div>
              </SmartLink>
            ))}
          </Slider>
        </div>
      </section>
    </SliderScope>
  );
}

export function BloggerPanel({ b }: { b: Blogger }) {
  return (
    <article className="blogger" style={{ '--tint': b.tint } as CSSProperties}>
      <div className="blogger__profile">
        {b.avatar
          // eslint-disable-next-line @next/next/no-img-element
          ? <img className="blogger__avatar" src={asset(b.avatar)} alt={b.name} draggable={false} style={{ borderRadius: '50%', objectFit: 'cover' }} />
          : (
            <svg className="blogger__avatar" viewBox="0 0 150 150" aria-hidden="true">
              <circle cx="75" cy="75" r="75" fill="#dbdbdb" />
              <circle cx="75" cy="58" r="27" fill="#fff" />
              <path d="M75 94c-26 0-47 12-56 32a75 75 0 0 0 112 0c-9-20-30-32-56-32Z" fill="#fff" />
            </svg>
          )}
        <b className="blogger__name">{b.name}</b>
        <span className="blogger__about">{b.about}</span>
      </div>
      <div className="blogger__main">
        <SliderScope>
          <div className="blogger__head">
            <h3 className="blogger__title">Фавориты в уходе <em>{b.nameGen}</em></h3>
            <SliderArrows className="blogger__nav" small />
          </div>
          <Slider nested className="blogger__products" label={`Фавориты ${b.nameGen}`}>{b.products.filter((id) => getProduct(id)).map((id) => <ProductCard key={id} id={id} />)}</Slider>
        </SliderScope>
        <Link className="blogger__foot" href={`/catalog?edit=${b.id}`}>{items(b.products.filter((id) => getProduct(id)).length)} в подборке<Icon name="chev-right" /></Link>
      </div>
    </article>
  );
}

/** Выбор блогеров: one big panel per blogger; the section arrows switch bloggers, the small ones scroll their picks. */
export function Bloggers({ s }: { s: Of<'bloggers'> }) {
  if (!BLOGGERS.length) return null;
  return (
    <SliderScope>
      <section className="section" id={s.id}>
        <div className="container reveal"><SectionHead title={s.title} nav /></div>
        <div className="bleed reveal">
          <Slider kind="loop" className="bloggers" wheel={false} label={mdText(s.title)}>
            {BLOGGERS.map((b) => <BloggerPanel key={b.id} b={b} />)}
          </Slider>
        </div>
      </section>
    </SliderScope>
  );
}

export function Strip({ s }: { s: Of<'strip'> }) {
  return (
    <section className="section section--tight" id={s.id}>
      <div className="container reveal">
        <SmartLink className="strip" href={s.link}>
          <Rich className="strip__title" as="div" text={s.title} />
          <Art className="strip__art" as="div" spec={{ kind: 'strip', ids: s.products, image: s.image }} />
          <span className="btn btn--primary">{s.cta}</span>
        </SmartLink>
      </div>
    </section>
  );
}

export function ReviewsShowcase({ s }: { s: Of<'reviews'> }) {
  const list = PRODUCTS.filter((p) => p.reviews >= s.minReviews && p.type !== 'giftcard').sort((a, b) => b.reviews - a.reviews).slice(0, s.limit);
  if (!list.length) return null;
  return (
    <SliderScope>
      <section className="section" id={s.id}>
        <div className="container reveal"><SectionHead title={s.title} nav /></div>
        <div className="bleed reveal">
          <Slider kind="loop" className="reviews" label="Отзывы покупателей">
            {list.map((p) => (
              <div key={p.id} className="review-card">
                <div className="review-card__product"><ProductCard id={p.id} /></div>
                <div className="review-card__main">
                  <div className="review-card__inner">
                    <div className="review-card__head">
                      <div className="review-card__count">{count(p.reviews, 'отзыв', 'отзыва', 'отзывов')}</div>
                      <div className="review-card__score"><Icon name="star" className="i--fill" />{p.rating}<small>/5</small></div>
                    </div>
                    {reviewsFor(p, 3).map((r) => (
                      <div key={r.name} className="review">
                        <div className="review__head"><div className="review__name">{r.name}</div><Stars rating={r.rating} /></div>
                        <p className="review__text">{r.text}</p>
                      </div>
                    ))}
                  </div>
                  <Link className="review-card__foot" href={`${productPath(p)}#reviews`}>Все отзывы <Icon name="chev-right" /></Link>
                </div>
              </div>
            ))}
          </Slider>
        </div>
      </section>
    </SliderScope>
  );
}

export function Spotlight({ s }: { s: Of<'spotlight'> }) {
  const b = brandOf(s.brand);
  const list = PRODUCTS.filter((p) => p.brand === s.brand);
  return (
    <section className="section" id={s.id}>
      <div className="container reveal">
        <div className="spotlight">
          <div className="spotlight__top">
            <div className="spotlight__info">
              <h2 className="spotlight__brand">{b.name}</h2>
              <p className="spotlight__text">{s.text}</p>
              <Link className="btn btn--white" href={`/catalog?brand=${b.id}`}>{s.cta}</Link>
            </div>
            <div className="spotlight__art"><Art className="spotlight__art-inner" as="div" spec={{ kind: 'spotlight', ids: s.art, image: s.image }} /></div>
          </div>
          {list.length > 0 && (
            <SliderScope>
              <div className="spotlight__products">
                <SliderArrows className="spotlight__nav" />
                <Slider label={b.name}>{list.map((p) => <ProductCard key={p.id} id={p.id} />)}</Slider>
              </div>
            </SliderScope>
          )}
        </div>
      </div>
    </section>
  );
}

/** Подборки: big themed cards in an endless centred strip, the neighbours peeking in. */
export function Collections({ s }: { s: Of<'collections'> }) {
  if (!COLLECTIONS.length) return null;
  return (
    <SliderScope>
      <section className="section" id={s.id}>
        <div className="container reveal"><SectionHead title={s.title} nav /></div>
        <div className="bleed reveal">
          <Slider kind="loop" className="collections" label={mdText(s.title)}>
            {COLLECTIONS.map((c) => {
              const q = linkQuery(c.href);
              return (
                <SmartLink key={c.id} className="collection-card" href={c.href} draggable={false}>
                  <Art className="collection-card__art" as="div" spec={{ kind: 'collection', id: c.id }} />
                  <h3 className="collection-card__title">{c.title}</h3>
                  <GlassSurface {...GLASS} as="span" className="collection-card__count" width="auto" height={50} tone="light">{q ? items(queryResults(q).length) : 'Смотреть'}<Icon name="arrow-right" /></GlassSurface>
                </SmartLink>
              );
            })}
          </Slider>
        </div>
      </section>
    </SliderScope>
  );
}

export function Stores({ s }: { s: Of<'stores'> }) {
  if (!STORES.length) return null;
  const credits = PHOTO_CREDITS;
  return (
    <SliderScope>
      <section className="section" id={s.id}>
        <div className="container reveal">
          <SectionHead title={s.title} nav />
          <Slider className="stores" label="Магазины">{STORES.map((st) => <StoreCard key={st.id} s={st} />)}</Slider>
          {credits.length > 0 && (
            <p className="stores__credit">
              Фото: Wikimedia Commons —{' '}
              {credits.map((c, i) => (
                <span key={c.url}>{i > 0 && ', '}<a href={c.url} target="_blank" rel="noopener noreferrer">{c.author}</a> ({c.license})</span>
              ))}
              ; кадрированы. Карты: © участники OpenStreetMap.
            </p>
          )}
        </div>
      </section>
    </SliderScope>
  );
}

export function GiftCards({ s }: { s: Of<'giftcards'> }) {
  return (
    <section className="section" id={s.id}>
      <div className="container reveal">
        <div className="giftcards" data-surface="dark">
          <div className="giftcards__info">
            <Rich as="h2" className="giftcards__title" text={s.title} />
            <p className="giftcards__text">{s.text}</p>
            <div className="giftcards__hline" /><div className="giftcards__vline" />
            <div className="giftcards__btn"><GiftCardButton label={s.cta} /></div>
          </div>
          <Art className="giftcards__art" as="div" spec={{ kind: 'giftcards', amount: s.amount, image: s.image }} />
        </div>
      </div>
    </section>
  );
}

export function Brands({ s }: { s: Of<'brands'> }) {
  const total: Record<string, number> = {};
  PRODUCTS.forEach((p) => { total[p.brand] = (total[p.brand] || 0) + p.reviews; });
  const list = BRANDS.filter((b) => b.id !== 'korea-secret' && total[b.id]).sort((a, b) => total[b.id] - total[a.id]).slice(0, s.limit);
  if (!list.length) return null;
  return (
    <SliderScope>
      <section className="section" id={s.id}>
        <div className="container reveal">
          <SectionHead title={s.title} link={s.link} nav />
          <Slider className="brands" label="Бренды">
            {list.map((b) => (
              <Link key={b.id} className={`brand-tile brand-tile--${b.style}`} href={`/catalog?brand=${b.id}`} draggable={false}>
                {b.logo
                  // eslint-disable-next-line @next/next/no-img-element
                  ? <img className="brand-tile__logo" src={asset(b.logo)} alt={b.name} draggable={false} />
                  : <span className="brand-tile__name">{b.name}</span>}
                <span className="brand-tile__count">{count(PRODUCTS.filter((p) => p.brand === b.id).length, 'продукт', 'продукта', 'продуктов')}</span>
              </Link>
            ))}
          </Slider>
        </div>
      </section>
    </SliderScope>
  );
}
