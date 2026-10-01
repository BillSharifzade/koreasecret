import Link from 'next/link';
import { Icon } from '../Icon';
import { SliderArrows } from './Slider';

export function Stars({ rating }: { rating: number }) {
  return (
    <span className="stars" aria-label={`${rating} / 5`}>
      {[1, 2, 3, 4, 5].map((i) => <Icon key={i} name="star" className={`i--fill${i <= Math.round(rating) ? '' : ' is-off'}`} />)}
    </span>
  );
}

/** Section title + optional «Все» pill + arrows for the slider in the surrounding <SliderScope>. */
export function SectionHead({ title, link, nav, all = true }: { title: string; link?: string; nav?: boolean; all?: boolean }) {
  const html = { __html: title };
  return (
    <div className="section__head">
      <h2 className="section__title">{link ? <Link href={link} dangerouslySetInnerHTML={html} /> : <span dangerouslySetInnerHTML={html} />}</h2>
      {link && all && <Link className="pill-link" href={link}><span>Все</span><Icon name="chev-right" /></Link>}
      {nav && <SliderArrows />}
    </div>
  );
}
