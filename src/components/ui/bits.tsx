import Link from 'next/link';
import { Icon } from '../Icon';
import { href, translator } from '@/lib/i18n';
import type { Lang } from '@/lib/types';

export function Stars({ rating }: { rating: number }) {
  return (
    <span className="stars" aria-label={`${rating} / 5`}>
      {[1, 2, 3, 4, 5].map((i) => <Icon key={i} name="star" className={`i--fill${i <= Math.round(rating) ? '' : ' is-off'}`} />)}
    </span>
  );
}

/** Section title + optional "All" pill + carousel arrows (wired by the nearest [data-scope] carousel). */
export function SectionHead({ lang, title, link, nav, all = true }: { lang: Lang; title: string; link?: string; nav?: boolean; all?: boolean }) {
  const tr = translator(lang);
  const html = { __html: title };
  return (
    <div className="section__head">
      <h2 className="section__title">{link ? <Link href={href(lang, link)} dangerouslySetInnerHTML={html} /> : <span dangerouslySetInnerHTML={html} />}</h2>
      {link && all && <Link className="pill-link" href={href(lang, link)}>{tr.t('common.all')}<Icon name="chev-right" /></Link>}
      {nav && (
        <div className="section__nav">
          <button className="arrow-btn" type="button" data-dir="prev" aria-label={tr.t('common.prev')}><Icon name="arrow-left" /></button>
          <button className="arrow-btn" type="button" data-dir="next" aria-label={tr.t('common.next')}><Icon name="arrow-right" /></button>
        </div>
      )}
    </div>
  );
}
