import { Hero } from '@/components/home/Hero';
import { Stories } from '@/components/home/Stories';
import { Journal } from '@/components/home/Journal';
import { SeoBlock } from '@/components/home/ClientBits';
import { Bloggers, Brands, CategoryTiles, Collections, GiftCards, ProductSection, Promos, Recommend, ReviewsShowcase, Spotlight, Stores, Strip } from '@/components/home/sections';
import { PRODUCTS } from '@/lib/data';
import { discountOf } from '@/lib/shop';

export default function HomePage() {
  const fresh = [...PRODUCTS.filter((p) => p.tags.includes('new')), ...PRODUCTS.slice().reverse().filter((p) => !p.tags.includes('new') && p.type !== 'giftcard')].slice(0, 10);
  const excl = PRODUCTS.filter((p) => p.tags.includes('excl') || p.brand === 'medicube');
  const sale = PRODUCTS.filter((p) => p.old).sort((a, b) => discountOf(b) - discountOf(a));
  const hits = PRODUCTS.filter((p) => p.tags.includes('hit')).sort((a, b) => b.reviews - a.reviews);

  return (
    <>
      <Hero />
      <CategoryTiles />
      <ProductSection id="new" title="Новинки" link="/catalog?offer=new" list={fresh} />
      <ProductSection id="excl" title="Только в <em>Korea Secret</em>" link="/catalog?offer=excl" list={excl} />
      <Stories />
      <Promos />
      <ProductSection id="sale" title="Скидки" link="/catalog?offer=sale" list={sale} />
      <ProductSection id="hits" title="Хиты" link="/catalog?offer=hit" list={hits} />
      <Bloggers />
      <Strip />
      <ReviewsShowcase />
      <Journal />
      <Spotlight />
      <Collections />
      <Stores />
      <GiftCards />
      <Brands />
      <Recommend />
      <SeoBlock />
    </>
  );
}
