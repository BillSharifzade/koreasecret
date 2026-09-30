import type { Metadata } from 'next';
import Link from 'next/link';
import { Onest, Playfair_Display } from 'next/font/google';
import './globals.css';
import { Butterfly } from '@/components/Brand';

const onest = Onest({ subsets: ['latin', 'cyrillic'], variable: '--font-onest', display: 'swap' });
const playfair = Playfair_Display({ subsets: ['latin', 'cyrillic'], style: ['normal', 'italic'], variable: '--font-playfair', display: 'swap' });

export const metadata: Metadata = { title: '404 — Korea Secret', description: 'Страница не найдена · Page not found' };

export default function GlobalNotFound() {
  return (
    <html lang="ru" className={`${onest.variable} ${playfair.variable}`}>
      <body>
        <main className="nf">
          <div className="nf__inner">
            <div className="nf__art"><Butterfly /></div>
            <div className="nf__code">404</div>
            <h1>Страница не найдена</h1>
            <p>Кажется, эта бабочка улетела. Page not found — this butterfly flew away.</p>
            <div className="nf__actions">
              <Link className="btn btn--primary" href="/ru/">На главную</Link>
              <Link className="btn btn--gray" href="/en/">English version</Link>
            </div>
          </div>
        </main>
      </body>
    </html>
  );
}
