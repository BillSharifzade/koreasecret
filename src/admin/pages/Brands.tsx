'use client';
import Link from 'next/link';
import { useMemo, useState } from 'react';
import { Art } from '@/components/Art';
import { asset } from '@/lib/asset';
import { BASE_PATH } from '@/lib/site';
import type { Brand, BrandStyle } from '@/lib/types';
import { brandUsages, mapLinks, renameBrand, rewriteParam } from '../state/refs';
import { ID_RE, uniqueId } from '../state/schema';
import { edit, undo, useAdmin } from '../state/store';
import { useSelected } from '../ui/collection';
import { I } from '../ui/icons';
import { Badge, Btn, Card, cx, Empty, Field, Input, LazyInput, Menu, Note, PageHead, Seg, TextArea } from '../ui/kit';
import { confirmDialog, promptDialog, Sheet, toast } from '../ui/overlay';
import { ImageField } from '../ui/pickers';
import { products, ReassignDialog } from '../ui/tax-helpers';
import '../styles/taxonomy.css';

const STYLES: [BrandStyle, string][] = [['caps', 'Капс'], ['stack', 'Столбик'], ['light', 'Тонкий'], ['wide', 'Разрядка'], ['serif', 'С засечками'], ['bold', 'Жирный'], ['italic', 'Курсив']];

/** The storefront's typographic brand tile (globals.css), as it appears in «Топ-бренды». */
export function BrandTile({ b, count, className }: { b: Brand; count?: string; className?: string }) {
  return (
    <span className={cx('brand-tile', `brand-tile--${b.style}`, className)}>
      {b.logo
        // eslint-disable-next-line @next/next/no-img-element
        ? <img className="brand-tile__logo" src={asset(b.logo)} alt={b.name} draggable={false} />
        : <span className="brand-tile__name">{b.name || 'Без названия'}</span>}
      {count !== undefined && <span className="brand-tile__count">{count}</span>}
    </span>
  );
}

export function Brands() {
  const draft = useAdmin((s) => s.draft);
  const [sel, select] = useSelected();
  const [q, setQ] = useState('');
  const [sort, setSort] = useState<'name' | 'products' | 'reviews'>('products');
  const [reassign, setReassign] = useState<Brand | null>(null);

  const stats = useMemo(() => {
    const m = new Map<string, { n: number; reviews: number; hidden: number }>();
    draft.products.forEach((p) => {
      const s = m.get(p.brand) || { n: 0, reviews: 0, hidden: 0 };
      s.n++; s.reviews += p.reviews; if (p.hidden) s.hidden++;
      m.set(p.brand, s);
    });
    return m;
  }, [draft.products]);
  const st = (id: string) => stats.get(id) || { n: 0, reviews: 0, hidden: 0 };

  const list = useMemo(() => {
    const ql = q.trim().toLowerCase();
    const l = draft.brands.filter((b) => !ql || `${b.name} ${b.id}`.toLowerCase().includes(ql));
    return l.slice().sort((a, b) => sort === 'name' ? a.name.localeCompare(b.name) : sort === 'products' ? st(b.id).n - st(a.id).n || a.name.localeCompare(b.name) : st(b.id).reviews - st(a.id).reviews);
  }, [draft.brands, q, sort, stats]); // eslint-disable-line react-hooks/exhaustive-deps

  const current = draft.brands.find((b) => b.id === sel);
  const set = <K extends keyof Brand>(id: string, k: K, v: Brand[K], label: string) => edit((d) => { const b = d.brands.find((x) => x.id === id); if (b) (b as Brand)[k] = v; }, { label, key: `brand:${id}:${String(k)}` });

  const create = async () => {
    const name = (await promptDialog({ title: 'Новый бренд', label: 'Название', placeholder: 'Например, Beauty of Joseon', confirm: 'Создать', icon: 'tag' }))?.trim();
    if (!name) return;
    const id = uniqueId(name, (x) => draft.brands.some((b) => b.id === x));
    edit((d) => { d.brands.push({ id, name, style: 'caps' }); }, { label: `Новый бренд: ${name}` });
    select(id);
    toast({ title: 'Бренд создан', text: 'Добавьте ему товары в карточке товара', kind: 'ok' });
  };

  const removeNow = (b: Brand, target?: string) => {
    if (sel === b.id) select(null);
    edit((d) => {
      if (target) renameBrand(d, b.id, target);
      else mapLinks(d, (v) => rewriteParam(v, 'brand', b.id, null));
      d.brands = d.brands.filter((x) => x.id !== b.id);
    }, { label: `Удалён бренд: ${b.name}` });
    toast({ title: 'Бренд удалён', text: target ? `Товары перенесены в «${draft.brands.find((x) => x.id === target)?.name}»` : b.name, icon: 'trash', action: { label: 'Вернуть', fn: () => undo() } });
  };
  const remove = async (b: Brand) => {
    if (brandUsages(draft, b.id).length) { setReassign(b); return; }
    if (await confirmDialog({ title: `Удалить бренд «${b.name}»?`, text: 'Товаров у бренда нет. Ссылки на каталог с этим брендом станут общими.', confirm: 'Удалить', danger: true })) removeNow(b);
  };

  const totalProducts = draft.products.length;
  const withoutProducts = draft.brands.filter((b) => !st(b.id).n).length;

  return (
    <div className="adm-page">
      <PageHead title={<>Бренды <em>и марки</em></>} sub="Плитки брендов на главной, фильтр каталога и меню «Бренды». Стиль плитки — чисто типографский, логотип можно загрузить."
        actions={<Btn variant="primary" icon="plus" onClick={create}>Новый бренд</Btn>} />
      <div className="a-minis tax-minis">
        <div className="a-mini"><span className="a-mini__icon"><I name="tag" /></span><span><b>{draft.brands.length}</b><small>брендов</small></span></div>
        <div className="a-mini"><span className="a-mini__icon is-green"><I name="box" /></span><span><b>{totalProducts}</b><small>товаров у брендов</small></span></div>
        <div className="a-mini"><span className={cx('a-mini__icon', withoutProducts ? 'is-amber' : 'is-gray')}><I name="alert" /></span><span><b>{withoutProducts}</b><small>без товаров</small></span></div>
      </div>
      <Card flush>
        <div className="a-toolbar">
          <div className="a-affix a-affix--prefix a-search-input"><span className="a-affix__prefix"><I name="search" className="i--sm" /></span><input className="a-input" placeholder="Название или ID бренда" value={q} onChange={(e) => setQ(e.target.value)} /></div>
          <span className="adm-grow" />
          <span className="adm-muted">{list.length} из {draft.brands.length}</span>
          <Seg size="sm" value={sort} onChange={setSort} options={[{ value: 'products', label: 'По товарам' }, { value: 'reviews', label: 'По отзывам' }, { value: 'name', label: 'А–Я' }]} />
        </div>
        {list.length ? (
          <div className="tax-brands">
            {list.map((b) => {
              const s = st(b.id);
              return (
                <button key={b.id} type="button" className={cx('tax-brand', sel === b.id && 'is-active')} onClick={() => select(b.id)}>
                  <BrandTile b={b} count={products(s.n)} />
                  <span className="tax-brand__meta">
                    <span className="adm-ellipsis"><b>{b.name}</b></span>
                    <span className="adm-mono adm-muted adm-ellipsis">{b.id}</span>
                  </span>
                  <span className="tax-brand__stats">
                    {s.n ? <Badge>{products(s.n)}</Badge> : <Badge tone="amber">нет товаров</Badge>}
                    {s.reviews > 0 && <span className="adm-muted"><I name="star" className="i--xs adm-accent" /> {s.reviews.toLocaleString('ru-RU')}</span>}
                  </span>
                </button>
              );
            })}
          </div>
        ) : <Empty title="Ничего не нашлось" text="Измените запрос" />}
      </Card>

      <Sheet open={!!current} onClose={() => select(null)} title={current?.name || ''} sub={current ? `${products(st(current.id).n)} · ${st(current.id).reviews.toLocaleString('ru-RU')} отзывов` : undefined}
        actions={current && <Menu items={[{ label: 'Товары бренда в каталоге', icon: 'external', onClick: () => window.open(`${BASE_PATH}/catalog/?brand=${current.id}&preview=1`, '_blank') }, { sep: true }, { label: 'Удалить бренд', icon: 'trash', danger: true, onClick: () => remove(current) }]} />}
        foot={<><span className="adm-muted adm-grow" style={{ fontSize: 12.5 }}><I name="check" className="i--xs" /> Изменения сохраняются в черновик сразу</span><Btn variant="dark" onClick={() => select(null)}>Готово</Btn></>}>
        {current && <BrandForm b={current} count={st(current.id).n} set={set} onRemove={() => remove(current)} onRenamed={(id) => select(id)} />}
      </Sheet>

      {reassign && (
        <ReassignDialog open onClose={() => setReassign(null)} title={`Удалить «${reassign.name}»?`}
          text={<>У бренда {products(st(reassign.id).n)}{brandUsages(draft, reassign.id).some((u) => u.where === 'Главная') ? ' и блок «Бренд в фокусе» на главной' : ''}. Выберите бренд, к которому они перейдут, — ссылки каталога тоже обновятся.</>}
          label="Перенести товары в бренд" confirm="Перенести и удалить"
          options={draft.brands.filter((b) => b.id !== reassign.id).sort((a, b) => a.name.localeCompare(b.name)).map((b) => [b.id, b.name])}
          onConfirm={(target) => removeNow(reassign, target)} />
      )}
    </div>
  );
}

function BrandForm({ b, count, set, onRemove, onRenamed }: { b: Brand; count: number; set: <K extends keyof Brand>(id: string, k: K, v: Brand[K], label: string) => void; onRemove: () => void; onRenamed: (id: string) => void }) {
  const draft = useAdmin((s) => s.draft);
  const usages = brandUsages(draft, b.id);
  const items = draft.products.filter((p) => p.brand === b.id);
  const spotlight = usages.filter((u) => u.where === 'Главная');
  const rename = (v: string) => {
    const to = v.trim();
    edit((d) => { const x = d.brands.find((y) => y.id === b.id); if (x) x.id = to; renameBrand(d, b.id, to); }, { label: 'Бренд: новый ID' });
    onRenamed(to);
    toast({ title: 'ID бренда изменён', text: 'Товары и ссылки каталога обновлены', kind: 'ok' });
  };
  return (
    <div className="adm-stack adm-stack--lg">
      <div className="tax-tile-preview">
        <span className="a-preview__label"><I name="eye" />Плитка в «Топ-брендах»</span>
        <BrandTile b={b} count={products(count)} />
      </div>
      <div className="a-form">
        <Field label="Название" error={!b.name.trim() ? 'Нужно название' : undefined}><Input size="title" value={b.name} onValue={(v) => set(b.id, 'name', v, 'Бренд: название')} /></Field>
        <Field label="Стиль плитки" hint="Шрифт, которым набрано название — ближе всего к настоящему логотипу">
          <div className="tax-styles">
            {STYLES.map(([s, label]) => (
              <button key={s} type="button" className={cx('tax-style', b.style === s && 'is-active')} onClick={() => set(b.id, 'style', s, 'Бренд: стиль')}>
                <BrandTile b={{ ...b, style: s, logo: undefined }} />
                <span>{label}</span>
              </button>
            ))}
          </div>
        </Field>
        <Field label="Логотип" hint="Необязательно. Если загрузить — плитка покажет логотип вместо надписи. Лучше PNG или SVG с прозрачным фоном.">
          <ImageField value={b.logo} onChange={(v) => set(b.id, 'logo', v, 'Бренд: логотип')} folder="brands" opts={{ max: 600, removeWhite: false }} />
        </Field>
        <Field label="О бренде" hint="Короткая справка для команды и будущей страницы бренда"><TextArea value={b.about || ''} onValue={(v) => set(b.id, 'about', v || undefined, 'Бренд: описание')} rows={3} /></Field>
        <Field label="ID бренда" hint={<>Используется в ссылках каталога: <span className="adm-mono">/catalog?brand={b.id}</span>. При смене обновятся товары и ссылки.</>}>
          <LazyInput value={b.id} onCommit={rename} validate={(v) => (!ID_RE.test(v.trim()) ? 'Только латиница, цифры и дефис' : draft.brands.some((x) => x.id === v.trim() && x.id !== b.id) ? 'Такой ID уже есть' : null)} />
        </Field>
      </div>
      <Card soft title={`Товары бренда · ${items.length}`}>
        {items.length ? (
          <div className="a-changes">
            {items.slice(0, 12).map((p) => (
              <Link key={p.id} className="a-change" href={`/admin/products/edit/?id=${encodeURIComponent(p.id)}`}>
                <span className="a-cell__art" style={{ width: 34, height: 34, borderRadius: 9 }}><Art spec={{ kind: 'product', id: p.id }} /></span>
                <span className="adm-grow adm-ellipsis" style={{ fontWeight: 500 }}>{p.name}</span>
                {p.hidden && <Badge icon="eye-off">скрыт</Badge>}
                <I name="chev-right" className="i--sm adm-muted" />
              </Link>
            ))}
            {items.length > 12 && <div className="adm-muted" style={{ padding: '6px 10px', fontSize: 13 }}>и ещё {items.length - 12}…</div>}
          </div>
        ) : <Note>У бренда пока нет товаров. Бренд выбирается в карточке товара.</Note>}
      </Card>
      {spotlight.length > 0 && <Note kind="brand" icon="star-o">Бренд показан в блоке «Бренд в фокусе» на главной. <Link className="a-link" href={spotlight[0].href}>Открыть блок</Link></Note>}
      <div><Btn variant="danger" icon="trash" onClick={onRemove}>Удалить бренд</Btn></div>
    </div>
  );
}
