'use client';
import { Art } from '../Art';
import { useUI } from '../providers';
import { ProductCard } from '../ui/ProductCard';
import { SectionHead } from '../ui/bits';
import { queryResults } from '@/lib/catalog';
import { ARTICLES } from '@/lib/data';
import { count } from '@/lib/format';
import { mdBlocks } from '@/lib/md';
import { getProduct } from '@/lib/shop';
import type { Article, HomeSection, Product } from '@/lib/types';

/** «Товары из статьи»: the hand-picked list, otherwise the first products of the article's catalogue query. */
const articleProducts = (a: Article): Product[] => (a.products.length ? a.products.map((id) => getProduct(id)).filter((p): p is Product => !!p) : a.query ? queryResults(a.query) : []).slice(0, 4);

function ArticleView({ a }: { a: Article }) {
  const products = articleProducts(a);
  return (
    <>
      <article className="article">
        <div className="article__tag">{a.tag} · {count(a.mins, 'минута', 'минуты', 'минут')}</div>
        <h2 className="modal__title">{a.title}</h2>
        <Art className="article__art" as="div" spec={{ kind: 'journal', id: a.id, w: 1100, h: 500 }} />
        <div className="article__body" dangerouslySetInnerHTML={{ __html: mdBlocks(a.body) }} />
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

export function Journal({ s }: { s: Extract<HomeSection, { type: 'journal' }> }) {
  const ui = useUI();
  const [first, ...rest] = ARTICLES;
  if (!first) return null;
  const open = (a: Article) => (e: React.MouseEvent) => { e.preventDefault(); ui.openModal(<ArticleView a={a} />, { wide: true, label: a.title }); };
  return (
    <section className="section" id={s.id}>
      <div className="container reveal">
        <SectionHead title={s.title} />
        <a className="journal-hero" href={`#${s.id}`} onClick={open(first)} data-surface="dark">
          <Art className="journal-hero__art" as="div" spec={{ kind: 'journal', id: first.id }} />
          <div className="journal-hero__content"><div className="journal-hero__tag">{first.tag}</div><h3 className="journal-hero__title">{first.title}</h3></div>
          <div className="journal-hero__hline" /><div className="journal-hero__vline" />
          <div className="journal-hero__btn"><span className="btn btn--white">Читать<span className="muted">~ {count(first.mins, 'минута', 'минуты', 'минут')}</span></span></div>
        </a>
        <div className="journal-grid">
          {rest.map((a) => (
            <a key={a.id} className="article-card" href={`#${s.id}`} onClick={open(a)}>
              <Art className="article-card__art" as="div" spec={{ kind: 'journal', id: a.id, w: 600, h: 545 }} />
              <div className="article-card__tag">{a.tag}</div>
              <h3 className="article-card__title">{a.title}</h3>
            </a>
          ))}
        </div>
      </div>
    </section>
  );
}
