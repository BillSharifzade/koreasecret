'use client';
import { Art } from '../Art';
import { useUI } from '../providers';
import { ProductCard } from '../ui/ProductCard';
import { ARTICLES, PRODUCTS } from '@/lib/data';
import { count } from '@/lib/format';
import { catOf } from '@/lib/shop';
import type { Article } from '@/lib/types';

const RELATED: Record<Article['theme'], (p: (typeof PRODUCTS)[number]) => boolean> = {
  routine: (p) => ['toner', 'serum', 'cream', 'sunscreen'].includes(p.type) && p.tags.includes('hit'),
  pdrn: (p) => p.brand === 'medicube',
  spf: (p) => p.type === 'sunscreen',
  oil: (p) => ['cleansing_oil', 'cleansing_balm', 'cleanser'].includes(p.type),
  store: (p) => catOf(p) === 'sets'
};

function ArticleView({ a }: { a: Article }) {
  const products = PRODUCTS.filter(RELATED[a.theme]).slice(0, 4);
  return (
    <>
      <article className="article">
        <div className="article__tag">{a.tag} · {count(a.mins, 'минута', 'минуты', 'минут')}</div>
        <h2 className="modal__title">{a.title}</h2>
        <Art className="article__art" as="div" spec={{ kind: 'journal', theme: a.theme, w: 1100, h: 500 }} />
        {a.body.map((p, i) => <p key={i}>{p}</p>)}
      </article>
      {products.length > 0 && (
        <>
          <h3 className="h3" style={{ margin: '30px 0 20px' }}>Товары из статьи</h3>
          <div className="product-grid">{products.map((p) => <ProductCard key={p.id} id={p.id} />)}</div>
        </>
      )}
    </>
  );
}

export function Journal() {
  const ui = useUI();
  const [first, ...rest] = ARTICLES;
  const open = (a: Article) => (e: React.MouseEvent) => { e.preventDefault(); ui.openModal(<ArticleView a={a} />, { wide: true, label: a.title }); };
  return (
    <section className="section" id="journal">
      <div className="container reveal">
        <div className="section__head"><h2 className="section__title">Журнал <em>Korea Secret</em></h2></div>
        <a className="journal-hero" href="#journal" onClick={open(first)} data-surface="dark">
          <Art className="journal-hero__art" as="div" spec={{ kind: 'journal', theme: first.theme }} />
          <div className="journal-hero__content"><div className="journal-hero__tag">{first.tag}</div><h3 className="journal-hero__title">{first.title}</h3></div>
          <div className="journal-hero__hline" /><div className="journal-hero__vline" />
          <div className="journal-hero__btn"><span className="btn btn--white">Читать<span className="muted">~ {count(first.mins, 'минута', 'минуты', 'минут')}</span></span></div>
        </a>
        <div className="journal-grid">
          {rest.map((a) => (
            <a key={a.id} className="article-card" href="#journal" onClick={open(a)}>
              <Art className="article-card__art" as="div" spec={{ kind: 'journal', theme: a.theme, w: 600, h: 545 }} />
              <div className="article-card__tag">{a.tag}</div>
              <h3 className="article-card__title">{a.title}</h3>
            </a>
          ))}
        </div>
      </div>
    </section>
  );
}
