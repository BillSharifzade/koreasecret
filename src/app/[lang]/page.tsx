import { notFound } from 'next/navigation';
import { Hero } from '@/components/home/Hero';
import { Stories } from '@/components/home/Stories';
import { Journal } from '@/components/home/Journal';
import { SeoBlock } from '@/components/home/ClientBits';
import { Brands, CategoryTiles, Collections, Expert, GiftCards, ProductSection, Promos, Recommend, ReviewsShowcase, Spotlight, Stores, Strip } from '@/components/home/sections';
import { PRODUCTS } from '@/lib/data';
import { isLang, translator } from '@/lib/i18n';
import { discountOf } from '@/lib/shop';

export default async function HomePage({ params }: { params: Promise<{ lang: string }> }) {
  const { lang } = await params;
  if (!isLang(lang)) notFound();
  const tr = translator(lang);
  const fresh = [...PRODUCTS.filter((p) => p.tags.includes('new')), ...PRODUCTS.slice().reverse().filter((p) => !p.tags.includes('new') && p.type !== 'giftcard')].slice(0, 10);
  const excl = PRODUCTS.filter((p) => p.tags.includes('excl') || p.brand === 'medicube');
  const sale = PRODUCTS.filter((p) => p.old).sort((a, b) => discountOf(b) - discountOf(a));
  const hits = PRODUCTS.filter((p) => p.tags.includes('hit')).sort((a, b) => b.reviews - a.reviews);

  return (
    <>
      <Hero />
      <CategoryTiles lang={lang} />
      <ProductSection lang={lang} id="new" title={tr.t('home.new')} link="/catalog?offer=new" list={fresh} />
      <ProductSection lang={lang} id="excl" title={tr.t('home.excl')} link="/catalog?offer=excl" list={excl} />
      <section className="section" id="stories" data-scope><Stories title={tr.t('home.stories')} /></section>
      <Promos lang={lang} />
      <ProductSection lang={lang} id="sale" title={tr.t('home.sale')} link="/catalog?offer=sale" list={sale} />
      <ProductSection lang={lang} id="hits" title={tr.t('home.hits')} link="/catalog?offer=hit" list={hits} />
      <Expert lang={lang} />
      <Strip lang={lang} />
      <ReviewsShowcase lang={lang} />
      <section className="section" id="journal"><Journal title={tr.t('home.journal')} /></section>
      <Spotlight lang={lang} />
      <Collections lang={lang} />
      <Stores lang={lang} />
      <GiftCards lang={lang} />
      <Brands lang={lang} />
      <Recommend lang={lang} />
      <section className="section" id="seo"><SeoBlock /></section>
    </>
  );
}
