import type { Metadata } from 'next';
import { Suspense } from 'react';
import { CatalogFromUrl, CatalogView } from '@/components/catalog/CatalogView';
import { isLang, translator } from '@/lib/i18n';

export async function generateMetadata({ params }: { params: Promise<{ lang: string }> }): Promise<Metadata> {
  const { lang } = await params;
  const tr = translator(isLang(lang) ? lang : 'ru');
  return { title: tr.t('c.title'), description: tr.t('c.sub') };
}

/* Statically exported: filters live in the query string and are applied on the client. */
export default function CatalogPage() {
  return (
    <Suspense fallback={<CatalogView query="" />}>
      <CatalogFromUrl />
    </Suspense>
  );
}
