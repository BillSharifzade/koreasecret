import Link from 'next/link';
import { Art } from '../Art';
import { Icon } from '../Icon';
import { Carousel } from '../ui/Carousel';
import { ProductCard } from '../ui/ProductCard';
import { SectionHead, Stars } from '../ui/bits';
import { GiftCardButton } from './ClientBits';
import { BRANDS, COLLECTIONS, EXPERT, HOME_CATS, PRODUCTS, PROMOS, SPOTLIGHT, STORES } from '@/lib/data';
import { href, translator } from '@/lib/i18n';
import { brandOf, productPath, reviewsFor, score } from '@/lib/shop';
import type { Lang, Product } from '@/lib/types';

export function CategoryTiles({ lang }: { lang: Lang }) {
  const tr = translator(lang);
  return (
    <section className="cats" aria-label={tr.t('home.categories')}>
      <div className="container">
        <div className="cats__card">
          <nav className="cats__list" aria-label={tr.t('home.categories')}>
            {HOME_CATS.map((c) => (
              <Link key={c.icon} className="cat-tile" href={href(lang, c.href)}>
                <Art className="cat-tile__icon" spec={{ kind: 'icon', name: c.icon }} />
                <span className="cat-tile__label">{tr.L(c)}</span>
              </Link>
            ))}
          </nav>
        </div>
      </div>
    </section>
  );
}

export function ProductSection({ lang, id, title, link, list }: { lang: Lang; id: string; title: string; link?: string; list: Product[] }) {
  return (
    <section className="section" id={id} data-scope>
      <div className="container reveal">
        <SectionHead lang={lang} title={title} link={link} nav />
        <Carousel>{list.map((p) => <ProductCard key={p.id} id={p.id} />)}</Carousel>
      </div>
    </section>
  );
}

export function Promos({ lang }: { lang: Lang }) {
  const tr = translator(lang);
  return (
    <section className="section" id="promos" data-scope>
      <div className="container reveal"><SectionHead lang={lang} title={tr.t('home.promos')} link="/catalog?offer=sale" nav /></div>
      <div className="bleed reveal">
        <Carousel center start={1} className="promos">
          {PROMOS.map((p) => (
            <Link key={p.id} className={`promo-card${p.dark ? ' is-dark' : ''}`} href={href(lang, p.link)}>
              <Art className="promo-card__bg" as="div" spec={{ kind: 'promo', id: p.id }} />
              <div className="promo-card__content"><div className="promo-card__title">{tr.L(p.title)}</div><div className="promo-card__date">{tr.L(p.date)}</div></div>
              <div className="promo-card__hline" /><div className="promo-card__vline" /><div className="promo-card__vline promo-card__vline--sm" />
              <div className="promo-card__btn"><span className="btn btn--primary">{tr.t('common.more')}</span></div>
            </Link>
          ))}
        </Carousel>
      </div>
    </section>
  );
}

export function Expert({ lang }: { lang: Lang }) {
  const tr = translator(lang);
  const list = EXPERT.products;
  return (
    <section className="section" id="expert" data-scope>
      <div className="container reveal">
        <SectionHead lang={lang} title={tr.t('home.expert')} link="/catalog?edit=expert" nav />
        <div className="expert">
          <div className="expert__side">
            <div className="expert__portrait"><Art as="div" spec={{ kind: 'expert' }} /><p className="expert__quote">{tr.L(EXPERT.quote)}</p></div>
            <div className="expert__person">
              <div className="expert__avatar">{tr.L(EXPERT.initials)}</div>
              <div><div className="expert__name">{tr.L(EXPERT.name)}</div><div className="expert__role">{tr.L(EXPERT.role)}</div></div>
            </div>
          </div>
          <div className="expert__main">
            <div className="expert__products"><Carousel>{list.map((id) => <ProductCard key={id} id={id} />)}</Carousel></div>
            <Link className="expert__foot" href={href(lang, '/catalog?edit=expert')}>{tr.pl('pl.items', list.length)} {tr.t('home.inEdit')} <Icon name="chev-right" /></Link>
          </div>
        </div>
      </div>
    </section>
  );
}

export function Strip({ lang }: { lang: Lang }) {
  const tr = translator(lang);
  return (
    <section className="section section--tight" id="strip">
      <div className="container reveal">
        <Link className="strip" href={href(lang, '/catalog?brand=medicube')}>
          <div className="strip__title">{tr.t('home.strip')}</div>
          <Art className="strip__art" as="div" spec={{ kind: 'strip' }} />
          <span className="btn btn--primary">{tr.t('home.stripCta')}</span>
        </Link>
      </div>
    </section>
  );
}

export function ReviewsShowcase({ lang }: { lang: Lang }) {
  const tr = translator(lang);
  const list = PRODUCTS.filter((p) => p.reviews > 400 && p.type !== 'giftcard').sort((a, b) => b.reviews - a.reviews).slice(0, 6);
  return (
    <section className="section" id="reviews" data-scope>
      <div className="container reveal"><SectionHead lang={lang} title={tr.t('home.reviews')} nav /></div>
      <div className="bleed reveal">
        <Carousel center start={1} className="reviews">
          {list.map((p) => (
            <div key={p.id} className="review-card">
              <div className="review-card__product"><ProductCard id={p.id} /></div>
              <div className="review-card__main">
                <div className="review-card__inner">
                  <div className="review-card__head">
                    <div className="review-card__count">{tr.pl('pl.reviews', p.reviews)}</div>
                    <div className="review-card__score"><Icon name="star" className="i--fill" />{p.rating}<small>/5</small></div>
                  </div>
                  {reviewsFor(p, 3).map((r) => (
                    <div key={r.name.ru} className="review">
                      <div className="review__head"><div className="review__name">{tr.L(r.name)}</div><Stars rating={r.rating} /></div>
                      <p className="review__text">{tr.L(r.text)}</p>
                    </div>
                  ))}
                </div>
                <Link className="review-card__foot" href={`${href(lang, productPath(p))}#reviews`}>{tr.t('home.allReviews')} <Icon name="chev-right" /></Link>
              </div>
            </div>
          ))}
        </Carousel>
      </div>
    </section>
  );
}

export function Spotlight({ lang }: { lang: Lang }) {
  const tr = translator(lang);
  const b = brandOf(SPOTLIGHT.brand);
  const list = PRODUCTS.filter((p) => p.brand === SPOTLIGHT.brand);
  return (
    <section className="section" id="spotlight">
      <div className="container reveal">
        <div className="spotlight">
          <div className="spotlight__top">
            <div className="spotlight__info">
              <h2 className="spotlight__brand">{b.name}</h2>
              <p className="spotlight__text">{tr.L(SPOTLIGHT.text)}</p>
              <Link className="btn btn--white" href={href(lang, `/catalog?brand=${b.id}`)}>{tr.L(SPOTLIGHT.cta)}</Link>
            </div>
            <div className="spotlight__art"><Art className="spotlight__art-inner" as="div" spec={{ kind: 'spotlight' }} /></div>
          </div>
          <div className="spotlight__products" data-scope>
            <button className="arrow-btn arrow-btn--float" type="button" data-dir="prev" aria-label={tr.t('common.prev')}><Icon name="arrow-left" /></button>
            <button className="arrow-btn arrow-btn--float" type="button" data-dir="next" aria-label={tr.t('common.next')}><Icon name="arrow-right" /></button>
            <Carousel>{list.map((p) => <ProductCard key={p.id} id={p.id} />)}</Carousel>
          </div>
        </div>
      </div>
    </section>
  );
}

export function Collections({ lang }: { lang: Lang }) {
  const tr = translator(lang);
  return (
    <section className="section" id="collections">
      <div className="container reveal">
        <SectionHead lang={lang} title={tr.t('home.collections')} />
        <div className="collections">
          {COLLECTIONS.map((c) => (
            <Link key={c.id} className="collection-card" href={href(lang, c.href)}>
              <Art className="collection-card__art" as="div" spec={{ kind: 'collection', theme: c.theme }} />
              <h3 className="collection-card__title">{tr.L(c.title)}</h3>
              <span className="collection-card__count">{tr.pl('pl.items', PRODUCTS.filter(c.filter).length)} <Icon name="arrow-right" /></span>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}

export function Stores({ lang }: { lang: Lang }) {
  const tr = translator(lang);
  return (
    <section className="section" id="stores" data-scope>
      <div className="container reveal">
        <SectionHead lang={lang} title={tr.t('home.stores')} nav />
        <Carousel className="stores">
          {STORES.map((s, i) => (
            <a key={s.addr.ru} className="store-card" href={`https://yandex.ru/maps/?text=${encodeURIComponent(`${s.city.ru}, ${s.addr.ru}, Korea Secret`)}`} target="_blank" rel="noopener noreferrer" aria-label={`${tr.t('home.route')}: ${tr.L(s.city)}, ${tr.L(s.addr)}`}>
              <div className="store-card__map"><Art as="div" style={{ height: '100%' }} spec={{ kind: 'map', index: i }} /><span className="store-card__open"><i />{tr.t('home.open', { t: s.hours.split('–')[1] })}</span></div>
              <div className="store-card__city">{tr.L(s.city)}</div>
              <div className="store-card__addr">{tr.L(s.addr)}</div>
              <div className="store-card__metro"><span className="metro" style={{ background: s.metroColor }}>M</span>{tr.L(s.metro)}</div>
            </a>
          ))}
        </Carousel>
      </div>
    </section>
  );
}

export function GiftCards({ lang }: { lang: Lang }) {
  const tr = translator(lang);
  return (
    <section className="section" id="giftcards">
      <div className="container reveal">
        <div className="giftcards">
          <div className="giftcards__info">
            <h2 className="giftcards__title" dangerouslySetInnerHTML={{ __html: tr.t('home.gift.title') }} />
            <p className="giftcards__text">{tr.t('home.gift.text')}</p>
            <div className="giftcards__hline" /><div className="giftcards__vline" />
            <div className="giftcards__btn"><GiftCardButton /></div>
          </div>
          <Art className="giftcards__art" as="div" spec={{ kind: 'giftcards' }} />
        </div>
      </div>
    </section>
  );
}

export function Brands({ lang }: { lang: Lang }) {
  const tr = translator(lang);
  const total: Record<string, number> = {};
  PRODUCTS.forEach((p) => { total[p.brand] = (total[p.brand] || 0) + p.reviews; });
  const list = BRANDS.filter((b) => b.id !== 'korea-secret' && total[b.id]).sort((a, b) => total[b.id] - total[a.id]).slice(0, 16);
  return (
    <section className="section" id="brands" data-scope>
      <div className="container reveal">
        <SectionHead lang={lang} title={tr.t('home.brands')} link="/catalog" nav />
        <Carousel className="brands">
          {list.map((b) => (
            <Link key={b.id} className={`brand-tile brand-tile--${b.style}`} href={href(lang, `/catalog?brand=${b.id}`)}>
              <span className="brand-tile__name">{b.name}<span className="brand-tile__count">{tr.pl('pl.products', PRODUCTS.filter((p) => p.brand === b.id).length)}</span></span>
            </Link>
          ))}
        </Carousel>
      </div>
    </section>
  );
}

export function Recommend({ lang }: { lang: Lang }) {
  const tr = translator(lang);
  const list = PRODUCTS.filter((p) => p.type !== 'giftcard').sort((a, b) => score(b) - score(a)).slice(8, 16);
  return (
    <section className="section" id="recommend">
      <div className="container reveal">
        <SectionHead lang={lang} title={tr.t('home.recommend')} link="/catalog?sort=rating" />
        <div className="product-grid">{list.map((p) => <ProductCard key={p.id} id={p.id} />)}</div>
      </div>
    </section>
  );
}

export const productLink = (lang: Lang, p: Product) => href(lang, productPath(p));
