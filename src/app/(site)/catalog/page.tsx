import type { Metadata } from 'next';
import { Suspense } from 'react';
import { CatalogFromUrl, CatalogView } from '@/components/catalog/CatalogView';
import { SEO } from '@/lib/data';

export const metadata: Metadata = { title: SEO.catalogTitle, description: SEO.catalogDescription };

/* Statically exported: filters live in the query string and are applied on the client. */
export default function CatalogPage() {
  return (
    <Suspense fallback={<CatalogView query="" />}>
      <CatalogFromUrl />
    </Suspense>
  );
}
