import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { ProductView } from '@/components/product/ProductView';
import { PRODUCTS } from '@/lib/data';
import { asset } from '@/lib/asset';
import { brandOf, getProduct, sku, titleOf } from '@/lib/shop';
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
  const photo = p.images?.[0];
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Product',
    name: titleOf(p),
    brand: { '@type': 'Brand', name: brandOf(p.brand).name },
    description: p.desc,
    sku: sku(p),
    image: photo ? (photo.startsWith('/') ? new URL(SITE_URL).origin + asset(photo) : asset(photo)) : `${SITE_URL}/ks-logo.png`,
    aggregateRating: { '@type': 'AggregateRating', ratingValue: p.rating, reviewCount: p.reviews },
    offers: { '@type': 'Offer', priceCurrency: 'TJS', price: p.price, availability: p.stock > 0 ? 'https://schema.org/InStock' : 'https://schema.org/OutOfStock', url: `${SITE_URL}/product/${p.id}/` }
  };
  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd).replace(/</g, '\\u003c') }} />
      <ProductView id={p.id} />
    </>
  );
}
