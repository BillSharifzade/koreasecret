import type { Metadata } from 'next';
import Link from 'next/link';
import { Butterfly } from '@/components/Brand';

export const metadata: Metadata = { title: 'Страница не найдена', robots: { index: false } };

/* The site used to live under /ru/ and /en/ — send those old links to the same page without the prefix. */
const LEGACY = `(function(){var p=location.pathname,n=p.replace(/\\/(ru|en)(?=\\/|$)/,'');if(n!==p)location.replace((n||'/')+location.search+location.hash);})();`;

export default function NotFound() {
  return (
    <section className="nf">
      <script dangerouslySetInnerHTML={{ __html: LEGACY }} />
      <div className="nf__inner">
        <div className="nf__art"><Butterfly /></div>
        <div className="nf__code">404</div>
        <h1>Страница не найдена</h1>
        <p>Кажется, эта бабочка улетела. Загляните в каталог — там точно найдётся что-то красивое.</p>
        <div className="nf__actions">
          <Link className="btn btn--primary" href="/">На главную</Link>
          <Link className="btn btn--gray" href="/catalog">В каталог</Link>
        </div>
      </div>
    </section>
  );
}
