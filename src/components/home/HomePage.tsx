'use client';
import { Hero } from './Hero';
import { Stories } from './Stories';
import { Journal } from './Journal';
import { SeoBlock } from './ClientBits';
import { Bloggers, Brands, CategoryTiles, Collections, GiftCards, ProductSection, Promos, ReviewsShowcase, Spotlight, Stores, Strip } from './sections';
import { HERO_SLIDES, HOME_SECTIONS } from '@/lib/data';
import type { HomeSection } from '@/lib/types';

/** One home page block, as configured in the admin's page builder. */
export function HomeSectionView({ s }: { s: HomeSection }) {
  switch (s.type) {
    case 'hero': return HERO_SLIDES.length ? <Hero id={s.id} /> : null;
    case 'categories': return <CategoryTiles id={s.id} />;
    case 'products': return <ProductSection s={s} />;
    case 'stories': return <Stories s={s} />;
    case 'promos': return <Promos s={s} />;
    case 'bloggers': return <Bloggers s={s} />;
    case 'strip': return <Strip s={s} />;
    case 'reviews': return <ReviewsShowcase s={s} />;
    case 'journal': return <Journal s={s} />;
    case 'spotlight': return <Spotlight s={s} />;
    case 'collections': return <Collections s={s} />;
    case 'stores': return <Stores s={s} />;
    case 'giftcards': return <GiftCards s={s} />;
    case 'brands': return <Brands s={s} />;
    case 'seo': return <SeoBlock s={s} />;
  }
}

export function HomePage() {
  return <>{HOME_SECTIONS.map((s) => <HomeSectionView key={s.id} s={s} />)}</>;
}
