import Link from 'next/link';
import type { CSSProperties } from 'react';
import { Art } from '../Art';
import { Icon } from '../Icon';
import GlassSurface, { GLASS } from '../ui/GlassSurface';
import { ProductCard } from '../ui/ProductCard';
import { Slider, SliderArrows, SliderScope } from '../ui/Slider';
import { SectionHead, Stars } from '../ui/bits';
import { GiftCardButton } from './ClientBits';
import { StoreCard } from './StoreCard';
import { BLOGGERS, BRANDS, COLLECTIONS, HOME_CATS, PHOTO_CREDITS, PRODUCTS, PROMOS, SPOTLIGHT, STORES } from '@/lib/data';
import { count } from '@/lib/format';
import { brandOf, productPath, reviewsFor, score } from '@/lib/shop';
import type { Blogger, Product } from '@/lib/types';

const items = (n: number) => count(n, 'товар', 'товара', 'товаров');

export function CategoryTiles() {
  return (
    <section className="cats" aria-label="Категории">
      <div className="container">
        <div className="cats__card">
          <nav className="cats__list" aria-label="Категории">
            {HOME_CATS.map((c) => (
              <Link key={c.icon} className="cat-tile" href={c.href}>
                <Art className="cat-tile__icon" spec={{ kind: 'icon', name: c.icon }} />
                <span className="cat-tile__label">{c.name}</span>
              </Link>
            ))}
          </nav>
        </div>
      </div>
    </section>
  );
}

/** A finite row of product cards (Новинки, Скидки, Хиты…). */
export function ProductSection({ id, title, link, list }: { id: string; title: string; link?: string; list: Product[] }) {
  return (
    <SliderScope>
      <section className="section" id={id}>
        <div className="container reveal">
          <SectionHead title={title} link={link} nav />
          <Slider label={title.replace(/<[^>]+>/g, '')}>{list.map((p) => <ProductCard key={p.id} id={p.id} />)}</Slider>
        </div>
      </section>
    </SliderScope>
  );
}

/** Акции: an endless, centred strip that plays by itself and stops under the pointer. */
export function Promos() {
  return (
    <SliderScope>
      <section className="section" id="promos">
        <div className="container reveal"><SectionHead title="Акции" link="/catalog?offer=sale" nav /></div>
        <div className="bleed reveal">
          <Slider kind="loop" className="promos" autoplay={5200} label="Акции">
            {PROMOS.map((p) => (
              <Link key={p.id} className={`promo-card${p.dark ? ' is-dark' : ''}`} href={p.link} draggable={false} data-surface={p.dark ? 'light' : 'dark'}>
                <Art className="promo-card__bg" as="div" spec={{ kind: 'promo', id: p.id }} />
                <div className="promo-card__content"><div className="promo-card__title">{p.title}</div><div className="promo-card__date">{p.date}</div></div>
                <div className="promo-card__hline" /><div className="promo-card__vline" /><div className="promo-card__vline promo-card__vline--sm" />
                <div className="promo-card__btn"><span className="btn btn--primary">Подробнее</span></div>
              </Link>
            ))}
          </Slider>
        </div>
      </section>
    </SliderScope>
  );
}

function BloggerPanel({ b }: { b: Blogger }) {
  return (
    <article className="blogger" style={{ '--tint': b.tint } as CSSProperties}>
      <div className="blogger__profile">
        <svg className="blogger__avatar" viewBox="0 0 150 150" aria-hidden="true">
          <circle cx="75" cy="75" r="75" fill="#dbdbdb" />
          <circle cx="75" cy="58" r="27" fill="#fff" />
          <path d="M75 94c-26 0-47 12-56 32a75 75 0 0 0 112 0c-9-20-30-32-56-32Z" fill="#fff" />
        </svg>
        <b className="blogger__name">{b.name}</b>
        <span className="blogger__about">{b.about}</span>
      </div>
      <div className="blogger__main">
        <SliderScope>
          <div className="blogger__head">
            <h3 className="blogger__title">Фавориты в уходе <em>{b.nameGen}</em></h3>
            <SliderArrows className="blogger__nav" small />
          </div>
          <Slider nested className="blogger__products" label={`Фавориты ${b.nameGen}`}>{b.products.map((id) => <ProductCard key={id} id={id} />)}</Slider>
        </SliderScope>
        <Link className="blogger__foot" href={`/catalog?edit=${b.id}`}>{items(b.products.length)} в подборке<Icon name="chev-right" /></Link>
      </div>
    </article>
  );
}

/** Выбор блогеров: one big panel per blogger; the section arrows switch bloggers, the small ones scroll their picks. */
export function Bloggers() {
  return (
    <SliderScope>
      <section className="section" id="bloggers">
        <div className="container reveal"><SectionHead title="Выбор блогеров" nav /></div>
        <div className="bleed reveal">
          <Slider kind="loop" className="bloggers" wheel={false} label="Выбор блогеров">
            {BLOGGERS.map((b) => <BloggerPanel key={b.id} b={b} />)}
          </Slider>
        </div>
      </section>
    </SliderScope>
  );
}

export function Strip() {
  return (
    <section className="section section--tight" id="strip">
      <div className="container reveal">
        <Link className="strip" href="/catalog?brand=medicube">
          <div className="strip__title">PDRN-уход medicube: розовое сияние кожи</div>
          <Art className="strip__art" as="div" spec={{ kind: 'strip' }} />
          <span className="btn btn--primary">Перейти в каталог</span>
        </Link>
      </div>
    </section>
  );
}

export function ReviewsShowcase() {
  const list = PRODUCTS.filter((p) => p.reviews > 400 && p.type !== 'giftcard').sort((a, b) => b.reviews - a.reviews).slice(0, 6);
  return (
    <SliderScope>
      <section className="section" id="reviews">
        <div className="container reveal"><SectionHead title="Ваши отзывы" nav /></div>
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

export function Spotlight() {
  const b = brandOf(SPOTLIGHT.brand);
  const list = PRODUCTS.filter((p) => p.brand === SPOTLIGHT.brand);
  return (
    <section className="section" id="spotlight">
      <div className="container reveal">
        <div className="spotlight">
          <div className="spotlight__top">
            <div className="spotlight__info">
              <h2 className="spotlight__brand">{b.name}</h2>
              <p className="spotlight__text">{SPOTLIGHT.text}</p>
              <Link className="btn btn--white" href={`/catalog?brand=${b.id}`}>{SPOTLIGHT.cta}</Link>
            </div>
            <div className="spotlight__art"><Art className="spotlight__art-inner" as="div" spec={{ kind: 'spotlight' }} /></div>
          </div>
          <SliderScope>
            <div className="spotlight__products">
              <SliderArrows className="spotlight__nav" />
              <Slider label={b.name}>{list.map((p) => <ProductCard key={p.id} id={p.id} />)}</Slider>
            </div>
          </SliderScope>
        </div>
      </div>
    </section>
  );
}

/** Подборки: big themed cards in an endless centred strip, the neighbours peeking in. */
export function Collections() {
  return (
    <SliderScope>
      <section className="section" id="collections">
        <div className="container reveal"><SectionHead title="Подборки" nav /></div>
        <div className="bleed reveal">
          <Slider kind="loop" className="collections" label="Подборки">
            {COLLECTIONS.map((c) => (
              <Link key={c.id} className="collection-card" href={c.href} draggable={false}>
                <Art className="collection-card__art" as="div" spec={{ kind: 'collection', id: c.id }} />
                <h3 className="collection-card__title">{c.title}</h3>
                <GlassSurface {...GLASS} as="span" className="collection-card__count" width="auto" height={50} tone="light">{items(PRODUCTS.filter(c.filter).length)}<Icon name="arrow-right" /></GlassSurface>
              </Link>
            ))}
          </Slider>
        </div>
      </section>
    </SliderScope>
  );
}

export function Stores() {
  return (
    <SliderScope>
      <section className="section" id="stores">
        <div className="container reveal">
          <SectionHead title="Ждём в гости" nav />
          <Slider className="stores" label="Магазины Korea Secret">{STORES.map((s) => <StoreCard key={s.id} s={s} />)}</Slider>
          <p className="stores__credit">
            Фото: Wikimedia Commons —{' '}
            {PHOTO_CREDITS.map((c, i) => (
              <span key={c.url}>{i > 0 && ', '}<a href={c.url} target="_blank" rel="noopener noreferrer">{c.author}</a> ({c.license})</span>
            ))}
            ; кадрированы. Карты: © участники OpenStreetMap.
          </p>
        </div>
      </section>
    </SliderScope>
  );
}

export function GiftCards() {
  return (
    <section className="section" id="giftcards">
      <div className="container reveal">
        <div className="giftcards" data-surface="dark">
          <div className="giftcards__info">
            <h2 className="giftcards__title">Подарочные <br />карты</h2>
            <p className="giftcards__text">Идеальный подарок для близких. В физическом или электронном формате, на любой номинал.</p>
            <div className="giftcards__hline" /><div className="giftcards__vline" />
            <div className="giftcards__btn"><GiftCardButton /></div>
          </div>
          <Art className="giftcards__art" as="div" spec={{ kind: 'giftcards' }} />
        </div>
      </div>
    </section>
  );
}

export function Brands() {
  const total: Record<string, number> = {};
  PRODUCTS.forEach((p) => { total[p.brand] = (total[p.brand] || 0) + p.reviews; });
  const list = BRANDS.filter((b) => b.id !== 'korea-secret' && total[b.id]).sort((a, b) => total[b.id] - total[a.id]).slice(0, 16);
  return (
    <SliderScope>
      <section className="section" id="brands">
        <div className="container reveal">
          <SectionHead title="Топ-бренды" link="/catalog" nav />
          <Slider className="brands" label="Бренды">
            {list.map((b) => (
              <Link key={b.id} className={`brand-tile brand-tile--${b.style}`} href={`/catalog?brand=${b.id}`} draggable={false}>
                <span className="brand-tile__name">{b.name}</span>
                <span className="brand-tile__count">{count(PRODUCTS.filter((p) => p.brand === b.id).length, 'продукт', 'продукта', 'продуктов')}</span>
              </Link>
            ))}
          </Slider>
        </div>
      </section>
    </SliderScope>
  );
}

export function Recommend() {
  const list = PRODUCTS.filter((p) => p.type !== 'giftcard').sort((a, b) => score(b) - score(a)).slice(8, 16);
  return (
    <section className="section" id="recommend">
      <div className="container reveal">
        <SectionHead title="Рекомендуем" link="/catalog?sort=rating" />
        <div className="product-grid">{list.map((p) => <ProductCard key={p.id} id={p.id} />)}</div>
      </div>
    </section>
  );
}
