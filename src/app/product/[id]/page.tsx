import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { ProductView } from '@/components/product/ProductView';
import { PRODUCTS } from '@/lib/data';
import { brandOf, catOf, getProduct, score, titleOf } from '@/lib/shop';
import { SITE_URL } from '@/lib/site';

export const dynamicParams = false;
export function generateStaticParams() {
  return PRODUCTS.map((p) => ({ id: p.id }));
}

type Params = Promise<{ id: string }>;

export async function generateMetadata({ params }: { params: Params }): Promise<Metadata> {
  const { id } = await params;
  const p = getProduct(id);
  if (!p) return {};
  return { title: titleOf(p), description: p.desc, openGraph: { title: titleOf(p), description: p.desc } };
}

export default async function ProductPage({ params }: { params: Params }) {
  const { id } = await params;
  const p = getProduct(id);
  if (!p) notFound();
  const related = PRODUCTS.filter((x) => x.id !== p.id && x.type !== p.type && x.type !== 'giftcard' && (catOf(x) === catOf(p) || x.type === 'sunscreen')).sort((a, b) => score(b) - score(a)).slice(0, 10).map((x) => x.id);
  const similar = PRODUCTS.filter((x) => x.id !== p.id && catOf(x) === catOf(p)).sort((a, b) => Number(b.type === p.type) - Number(a.type === p.type) || score(b) - score(a)).slice(0, 10).map((x) => x.id);
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Product',
    name: titleOf(p),
    brand: { '@type': 'Brand', name: brandOf(p.brand).name },
    description: p.desc,
    sku: p.id,
    image: `${SITE_URL}/ks-logo.png`,
    aggregateRating: { '@type': 'AggregateRating', ratingValue: p.rating, reviewCount: p.reviews },
    offers: { '@type': 'Offer', priceCurrency: 'TJS', price: p.price, availability: p.stock > 0 ? 'https://schema.org/InStock' : 'https://schema.org/OutOfStock', url: `${SITE_URL}/product/${p.id}/` }
  };
  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd).replace(/</g, '\\u003c') }} />
      <ProductView id={p.id} related={related} similar={similar} />
    </>
  );
}
