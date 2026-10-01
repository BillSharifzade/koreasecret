'use client';
import { useState } from 'react';
import { Icon } from '../Icon';
import { BASE_PATH } from '@/lib/site';
import type { Store } from '@/lib/types';

/* The map is a small pre-rendered OpenStreetMap excerpt (public/stores/map-<id>.webp) centred on the shop,
   so hovering costs no third-party requests or API keys. */
export function StoreCard({ s }: { s: Store }) {
  const [map, setMap] = useState(false); // pinned open: touch screens and keyboard users
  const route = `https://yandex.ru/maps/?ll=${s.lon},${s.lat}&z=17&pt=${s.lon},${s.lat},pm2rdm`;
  return (
    <article className={`store-card${map ? ' is-map' : ''}`}>
      <div className="store-card__media">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img className="store-card__photo" src={`${BASE_PATH}${s.photo}`} alt={`Магазин Korea Secret, ${s.addr}`} loading="lazy" decoding="async" width={1200} height={923} draggable={false} />
        <div className="store-card__map" aria-hidden={!map}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img className="store-card__mapimg" src={`${BASE_PATH}/stores/map-${s.id}.webp`} alt={`Карта: ${s.addr}`} loading="lazy" decoding="async" width={720} height={560} draggable={false} />
          <span className="store-card__pin"><Icon name="pin" /></span>
          <span className="store-card__osm">© <a href="https://www.openstreetmap.org/copyright" target="_blank" rel="noopener noreferrer" tabIndex={map ? 0 : -1}>OpenStreetMap</a></span>
        </div>
        {s.note && <span className="store-card__note">{s.note}</span>}
        <button className="store-card__toggle" type="button" aria-pressed={map} onClick={() => setMap((m) => !m)}>
          <Icon name={map ? 'close' : 'map'} />{map ? 'Фото' : 'На карте'}
        </button>
      </div>
      <div className="store-card__city">{s.city}<span>{s.area}</span></div>
      <div className="store-card__addr">{s.addr}</div>
      <div className="store-card__row">
        <span className="store-card__hours"><i />Ежедневно {s.hours}</span>
        <a className="store-card__route" href={route} target="_blank" rel="noopener noreferrer">Маршрут<Icon name="arrow-right" /></a>
      </div>
    </article>
  );
}
