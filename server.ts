/* Tiny Bun static server for the exported site (used in Docker). */
import { existsSync, statSync } from 'node:fs';
import { join, normalize } from 'node:path';

const root = join(import.meta.dir, 'out');
const port = Number(process.env.PORT || 3000);

function resolve(pathname: string): string | null {
  const clean = normalize(decodeURIComponent(pathname)).replace(/^(\.\.[/\\])+/, '');
  const base = join(root, clean);
  if (!base.startsWith(root)) return null;
  for (const candidate of [base, join(base, 'index.html'), `${base}.html`]) {
    if (existsSync(candidate) && statSync(candidate).isFile()) return candidate;
  }
  return null;
}

Bun.serve({
  port,
  hostname: '0.0.0.0',
  fetch(req) {
    const url = new URL(req.url);
    // /ru/catalog → /ru/catalog/ (the export uses trailing slashes)
    if (!url.pathname.endsWith('/') && !/\.[a-z0-9]+$/i.test(url.pathname) && existsSync(join(root, url.pathname, 'index.html'))) {
      return Response.redirect(`${url.pathname}/${url.search}`, 308);
    }
    const file = resolve(url.pathname);
    if (!file) return new Response(Bun.file(join(root, '404.html')), { status: 404, headers: { 'content-type': 'text/html; charset=utf-8' } });
    const headers: Record<string, string> = {};
    if (url.pathname.startsWith('/_next/static/')) headers['cache-control'] = 'public, max-age=31536000, immutable';
    return new Response(Bun.file(file), { headers });
  }
});

console.log(`Korea Secret is running on http://localhost:${port}`);
