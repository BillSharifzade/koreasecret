'use client';
import { useState } from 'react';
import { Icon } from '../Icon';
import GlassSurface, { GLASS } from '../ui/GlassSurface';
import { asset } from '@/lib/asset';
import type { Store } from '@/lib/types';

/* The map is a small pre-rendered OpenStreetMap excerpt (public/stores/map-<id>.webp, or one rendered in the admin)
   centred on the shop, so hovering costs no third-party requests or API keys. A shop without one falls back to the
   OpenStreetMap embed, loaded only once the map is opened. */
export function StoreCard({ s }: { s: Store }) {
  const [map, setMap] = useState(false); // pinned open: touch screens and keyboard users
  const route = `https://yandex.ru/maps/?ll=${s.lon},${s.lat}&z=17&pt=${s.lon},${s.lat},pm2rdm`;
  return (
    <article className={`store-card${map ? ' is-map' : ''}${s.map ? '' : ' no-map'}`}>
      <div className="store-card__media">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img className="store-card__photo" src={asset(s.photo)} alt={`Магазин Korea Secret, ${s.addr}`} loading="lazy" decoding="async" width={1200} height={923} draggable={false} />
        <div className="store-card__map" aria-hidden={!map}>
          {s.map
            // eslint-disable-next-line @next/next/no-img-element
            ? <img className="store-card__mapimg" src={asset(s.map)} alt={`Карта: ${s.addr}`} loading="lazy" decoding="async" width={720} height={560} draggable={false} />
            : map && <iframe className="store-card__mapimg" title={`Карта: ${s.addr}`} loading="lazy" src={`https://www.openstreetmap.org/export/embed.html?bbox=${s.lon - 0.006},${s.lat - 0.004},${s.lon + 0.006},${s.lat + 0.004}&layer=mapnik&marker=${s.lat},${s.lon}`} style={{ border: 0, width: '100%', height: '100%' }} />}
          <span className="store-card__pin"><Icon name="pin" /></span>
          <span className="store-card__osm">© <a href="https://www.openstreetmap.org/copyright" target="_blank" rel="noopener noreferrer" tabIndex={map ? 0 : -1}>OpenStreetMap</a></span>
        </div>
        {s.note && <span className="store-card__note">{s.note}</span>}
        <button className="store-card__toggle" type="button" aria-pressed={map} onClick={() => setMap((m) => !m)}>
          <GlassSurface {...GLASS} as="span" width="auto" height={36} tone="dark"><Icon name={map ? 'close' : 'map'} />{map ? 'Фото' : 'На карте'}</GlassSurface>
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
