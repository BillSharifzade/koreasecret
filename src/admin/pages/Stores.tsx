'use client';
import { useState, type ReactNode } from 'react';
import { StoreCard } from '@/components/home/StoreCard';
import { asset } from '@/lib/asset';
import type { PhotoCredit, Store } from '@/lib/types';
import { geocode, renderMap, type GeoResult } from '../lib/osm';
import { uploadImage } from '../state/media';
import { uid } from '../state/schema';
import { edit, useAdmin } from '../state/store';
import { CollectionEditor, useSelected } from '../ui/collection';
import { I } from '../ui/icons';
import { Badge, Btn, Card, Empty, Field, IconBtn, Input, Note, NumInput, PageHead, Select, Tabs } from '../ui/kit';
import { toast } from '../ui/overlay';
import { ImageField } from '../ui/pickers';
import { moveItem, SortableList } from '../ui/Sortable';
import '../styles/system.css';

const TABS = [{ value: 'stores', label: 'Магазины' }, { value: 'credits', label: 'Авторы фото' }] as const;

function newStore(city: string): Store {
  return { id: uid('st-'), city, addr: 'Новый адрес', area: '', hours: '10:00–20:00', lat: 38.5598, lon: 68.787, photo: '/stores/store-1.webp' };
}

/** Address search, pin coordinates and the small static map of one shop. */
function Location({ s, set }: { s: Store; set: (patch: Partial<Store>, label: string) => void }) {
  const [q, setQ] = useState('');
  const [found, setFound] = useState<GeoResult[] | null>(null);
  const [busy, setBusy] = useState<'' | 'geo' | 'map'>('');
  const query = q || [s.city, s.addr].filter(Boolean).join(', ');

  const search = async () => {
    setBusy('geo');
    try {
      const list = await geocode(query);
      setFound(list);
      if (!list.length) toast({ title: 'Ничего не нашлось', text: 'Попробуйте короче: улица и дом', kind: 'error' });
    } catch (e) { toast({ title: 'Поиск не удался', text: e instanceof Error ? e.message : String(e), kind: 'error' }); }
    finally { setBusy(''); }
  };
  const draw = async () => {
    setBusy('map');
    try {
      const blob = await renderMap(s.lat, s.lon);
      const path = await uploadImage(blob, `map-${s.id}`, { folder: 'stores', max: 720 });
      set({ map: path }, 'Магазин: новая карта');
      toast({ title: 'Карта готова', text: 'Она опубликуется вместе с изменениями', kind: 'ok' });
    } catch (e) { toast({ title: 'Не удалось нарисовать карту', text: e instanceof Error ? e.message : String(e), kind: 'error' }); }
    finally { setBusy(''); }
  };

  return (
    <div className="a-stack">
      <Field label="Найти точку по адресу" hint="Поиск OpenStreetMap по Таджикистану — выберите подходящий вариант, координаты подставятся сами">
        <div className="adm-row" style={{ gap: 6 }}>
          <input className="a-input adm-grow" value={query} onChange={(e) => setQ(e.target.value)} onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); search(); } }} />
          <Btn icon="search" loading={busy === 'geo'} onClick={search}>Найти</Btn>
        </div>
      </Field>
      {found && found.length > 0 && (
        <div className="a-changes a-sys-geo">
          {found.map((r, i) => (
            <button key={i} type="button" className="a-change" onClick={() => { set({ lat: Math.round(r.lat * 1e5) / 1e5, lon: Math.round(r.lon * 1e5) / 1e5 }, 'Магазин: координаты'); setFound(null); toast({ title: 'Координаты обновлены', text: 'Нарисуйте карту заново, чтобы она совпала', kind: 'ok' }); }}>
              <I name="pin" className="i--sm adm-accent" />
              <span className="adm-grow" style={{ minWidth: 0, textAlign: 'left' }}><span className="adm-clamp2">{r.label}</span><span className="a-change__fields">{r.lat.toFixed(5)}, {r.lon.toFixed(5)}{r.type ? ` · ${r.type}` : ''}</span></span>
            </button>
          ))}
        </div>
      )}
      <div className="a-form-row a-form-row--2">
        <Field label="Широта"><NumInput value={s.lat} step={0.00001} min={-90} max={90} onValue={(v) => set({ lat: v ?? 0 }, 'Магазин: координаты')} /></Field>
        <Field label="Долгота"><NumInput value={s.lon} step={0.00001} min={-180} max={180} onValue={(v) => set({ lon: v ?? 0 }, 'Магазин: координаты')} /></Field>
      </div>
      <a className="a-link" style={{ fontSize: 13, justifySelf: 'start' }} href={`https://www.openstreetmap.org/?mlat=${s.lat}&mlon=${s.lon}#map=17/${s.lat}/${s.lon}`} target="_blank" rel="noopener noreferrer">Проверить точку на openstreetmap.org <I name="external" className="i--xs" /></a>
      <div className="a-sys-map">
        <div className="a-sys-map__view">
          {s.map
            // eslint-disable-next-line @next/next/no-img-element
            ? <img src={asset(s.map)} alt="" />
            : <div className="a-sys-map__empty"><I name="map" /><span>Карты пока нет</span></div>}
          <span className="a-sys-map__pin"><I name="pin" /></span>
        </div>
        <div className="a-stack a-stack--sm">
          <b>Карта при наведении на фото</b>
          <span className="adm-muted" style={{ fontSize: 13 }}>
            {s.map
              ? 'Небольшая картинка с улицами вокруг магазина — покупатель не загружает сторонних карт.'
              : 'Без картинки сайт по кнопке «На карте» покажет встроенную карту OpenStreetMap (iframe). Нарисуйте свою — она быстрее и в цветах сайта.'}
          </span>
          <div className="adm-row adm-row--wrap" style={{ gap: 6 }}>
            <Btn size="sm" variant="primary" icon="wand" loading={busy === 'map'} onClick={draw}>{s.map ? 'Нарисовать заново' : 'Нарисовать карту'}</Btn>
            {s.map && <Btn size="sm" icon="trash" onClick={() => set({ map: undefined }, 'Магазин: карта убрана')}>Убрать</Btn>}
          </div>
          <span className="a-field__hint">Фрагменты загружаются с tile.openstreetmap.org только по нажатию. © участники OpenStreetMap.</span>
        </div>
      </div>
    </div>
  );
}

function StoreForm({ s }: { s: Store }) {
  const cities = useAdmin((st) => st.draft.settings.cities);
  const set = (patch: Partial<Store>, label: string) => edit((d) => { const x = d.stores.find((y) => y.id === s.id); if (x) Object.assign(x, patch); }, { label, key: `st:${s.id}:${Object.keys(patch).join(',')}` });
  const opts = (cities.includes(s.city) ? cities : [s.city, ...cities]).map((c) => [c, c] as const);
  return (
    <div className="adm-grid a-sys-store">
      <div className="adm-stack adm-stack--lg" style={{ minWidth: 0 }}>
        <Card title="Адрес и часы">
          <div className="a-form">
            <div className="a-form-row a-form-row--2">
              <Field label="Город"><Select value={s.city} onValue={(v) => set({ city: v }, 'Магазин: город')} options={opts} /></Field>
              <Field label="Район"><Input value={s.area} onValue={(v) => set({ area: v }, 'Магазин: район')} placeholder="р-н Исмоили Сомони" /></Field>
            </div>
            <Field label="Адрес"><Input size="lg" value={s.addr} onValue={(v) => set({ addr: v }, 'Магазин: адрес')} placeholder="пр. Рудаки, 92" /></Field>
            <div className="a-form-row a-form-row--3">
              <Field label="Часы работы" hint="Покажется как «Ежедневно …»"><Input value={s.hours} onValue={(v) => set({ hours: v }, 'Магазин: часы')} placeholder="09:00–21:00" /></Field>
              <Field label="Телефон"><Input value={s.phone || ''} onValue={(v) => set({ phone: v || undefined }, 'Магазин: телефон')} placeholder="+992 …" /></Field>
              <Field label="Пометка на фото"><Input value={s.note || ''} onValue={(v) => set({ note: v || undefined }, 'Магазин: пометка')} placeholder="Флагманский шоурум" /></Field>
            </div>
          </div>
        </Card>
        <Card title="Фото">
          <ImageField value={s.photo} onChange={(v) => set({ photo: v || '' }, 'Магазин: фото')} folder="stores" aspect="1.3" allowRemove={false} opts={{ max: 1200 }} hint="Горизонтальное фото витрины или зала, лучше 1200×920" />
        </Card>
        <Card title="Точка на карте">
          <Location s={s} set={set} />
        </Card>
      </div>
      <div className="adm-stack adm-sticky">
        <div className="a-preview a-preview--card">
          <span className="a-preview__label"><I name="eye" />Карточка на главной</span>
          <div className="a-sys-storecard"><StoreCard s={s} /></div>
        </div>
        <Note>Наведите на фото в предпросмотре или нажмите «На карте» — так покупатель видит карту. Кнопка «Маршрут» открывает Яндекс Карты по координатам.</Note>
      </div>
    </div>
  );
}

function Credits({ tabs }: { tabs: ReactNode }) {
  const credits = useAdmin((s) => s.draft.photoCredits);
  const setC = (i: number, k: keyof PhotoCredit, v: string) => edit((d) => { d.photoCredits[i][k] = v; }, { label: 'Авторы фото', key: `cr:${i}:${k}` });
  return (
    <div className="adm-page">
      <PageHead title={<>Магазины <em>и адреса</em></>} sub="Подпись под блоком магазинов на главной: чьи фотографии использованы. Уберите строки, когда замените фото своими." actions={<Btn variant="primary" icon="plus" onClick={() => edit((d) => { d.photoCredits.push({ author: '', license: 'CC BY-SA 4.0', url: 'https://' }); }, { label: 'Авторы фото: добавлен' })}>Добавить автора</Btn>} />
      {tabs}
      <Card>
        {credits.length ? (
          <SortableList items={credits} getKey={(_, i) => String(i)} onMove={(a, b) => edit((d) => moveItem(d.photoCredits, a, b), { label: 'Авторы фото: порядок' })}
            render={(c, i, handle) => (
              <div className="a-item a-sys-credit">
                <span className="a-item__handle" {...handle}><I name="drag" /></span>
                <div className="a-sys-credit__fields">
                  <Field label="Автор"><Input value={c.author} onValue={(v) => setC(i, 'author', v)} /></Field>
                  <Field label="Лицензия"><Input value={c.license} onValue={(v) => setC(i, 'license', v)} placeholder="CC BY-SA 4.0" /></Field>
                  <Field label="Ссылка на источник"><Input value={c.url} onValue={(v) => setC(i, 'url', v)} /></Field>
                </div>
                <IconBtn icon="trash" label="Удалить" danger onClick={() => edit((d) => { d.photoCredits.splice(i, 1); }, { label: 'Авторы фото: удалён' })} />
              </div>
            )} />
        ) : <Empty title="Авторов нет" text="Подпись «Фото: …» под магазинами не покажется" icon="images" />}
      </Card>
      <Note>На сайте: «Фото: Wikimedia Commons — <i>автор</i> (лицензия), …; кадрированы. Карты: © участники OpenStreetMap.» Ссылки открываются в новой вкладке.</Note>
    </div>
  );
}

export function Stores() {
  const [tab, setTab] = useSelected('tab');
  const cities = useAdmin((s) => s.draft.settings.cities);
  const tabs = <Tabs value={tab === 'credits' ? 'credits' : 'stores'} onChange={(v) => setTab(v === 'stores' ? null : v)} items={TABS.map((t) => ({ value: t.value, label: t.label }))} />;
  if (tab === 'credits') return <Credits tabs={tabs} />;
  return (
    <CollectionEditor<Store>
      area="Магазины"
      list={(d) => d.stores}
      title={<>Магазины <em>и адреса</em></>}
      sub="Блок «Ждём в гости» на главной, список адресов в подвале и наличие по магазинам на странице товара. Порядок — как в списке."
      noun={{ one: 'магазин', add: 'Новый магазин', gen: 'магазина' }}
      label={(s) => s.addr}
      caption={(s) => [s.city, s.area, s.hours && `ежедневно ${s.hours}`].filter(Boolean).join(' · ')}
      // eslint-disable-next-line @next/next/no-img-element
      media={(s) => (s.photo ? <img src={asset(s.photo)} alt="" /> : <I name="store" />)}
      extra={(s) => <>{s.note && <Badge tone="brand">{s.note}</Badge>}{!s.map && <Badge tone="amber" icon="map">без карты</Badge>}</>}
      create={() => newStore(cities[0] || 'Душанбе')}
      wide
      before={tabs}
      sheetTitle={(s) => s.addr}
      editor={(s) => <StoreForm s={s} />}
    />
  );
}
