'use client';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import { Butterfly } from './Brand';
import { previewOn } from './ContentRoot';
import { ProductView } from './product/ProductView';
import { TEXTS } from '@/lib/data';
import { getProduct } from '@/lib/shop';
import { BASE_PATH } from '@/lib/site';

/* While previewing a draft, products added in the admin have no exported page yet: their URL lands here,
   and the page is rendered on the fly from the draft. */
export function NotFoundView() {
  const [pid, setPid] = useState<string | null>(null);
  useEffect(() => {
    const m = window.location.pathname.slice(BASE_PATH.length).match(/^\/product\/([^/]+)\/?$/);
    if (m && previewOn()) setPid(decodeURIComponent(m[1]));
  }, []);
  if (pid && getProduct(pid)) return <ProductView id={pid} />;
  return (
    <section className="nf">
      <div className="nf__inner">
        <div className="nf__art"><Butterfly /></div>
        <div className="nf__code">404</div>
        <h1>{TEXTS.notFound.title}</h1>
        <p>{TEXTS.notFound.text}</p>
        <div className="nf__actions">
          <Link className="btn btn--primary" href="/">На главную</Link>
          <Link className="btn btn--gray" href="/catalog">В каталог</Link>
        </div>
      </div>
    </section>
  );
}
