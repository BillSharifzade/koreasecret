import type { Metadata } from 'next';
import { Suspense } from 'react';
import { CatalogFromUrl, CatalogView } from '@/components/catalog/CatalogView';

export const metadata: Metadata = { title: 'Каталог', description: 'Оригинальная корейская косметика со свежими сроками годности — с доставкой по Душанбе и Таджикистану' };

/* Statically exported: filters live in the query string and are applied on the client. */
export default function CatalogPage() {
  return (
    <Suspense fallback={<CatalogView query="" />}>
      <CatalogFromUrl />
    </Suspense>
  );
}
