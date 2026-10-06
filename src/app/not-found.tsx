import type { Metadata } from 'next';
import { NotFoundView } from '@/components/NotFoundView';
import { SiteShell } from '@/components/SiteShell';
import { TEXTS } from '@/lib/data';

export const metadata: Metadata = { title: TEXTS.notFound.title, robots: { index: false } };

/* The site used to live under /ru/ and /en/ — send those old links to the same page without the prefix. */
const LEGACY = `(function(){var p=location.pathname,n=p.replace(/\\/(ru|en)(?=\\/|$)/,'');if(n!==p)location.replace((n||'/')+location.search+location.hash);})();`;

export default function NotFound() {
  return (
    <SiteShell>
      <script dangerouslySetInnerHTML={{ __html: LEGACY }} />
      <NotFoundView />
    </SiteShell>
  );
}
