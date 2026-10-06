'use client';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { useEffect, useMemo, useState } from 'react';
import { Art } from '@/components/Art';
import { ProductCard } from '@/components/ui/ProductCard';
import type { GalleryView } from '@/lib/art';
import { BASE_PATH } from '@/lib/site';
import { discountOf, firstSentence, sku as autoSku } from '@/lib/shop';
import type { ArtSpec, Product, Shape, Tag, Variant } from '@/lib/types';
import { issuesOf } from '../shell/Publish';
import { productUsages, removeProductRefs, renameProductRefs } from '../state/refs';
import { ID_RE, slugify, uniqueId } from '../state/schema';
import { edit, undo, useAdmin } from '../state/store';
import { I } from '../ui/icons';
import { Badge, Btn, Card, Chips, ColorInput, cx, Empty, Field, IconBtn, Input, LazyInput, LinkBtn, Menu, money, Note, NumInput, PageHead, Select, Switch, TextArea, BRIGHTS } from '../ui/kit';
import { confirmDialog, toast } from '../ui/overlay';
import { ImagesField } from '../ui/pickers';
import { moveItem, SortableList } from '../ui/Sortable';
import { newProduct, stockState } from './Products';

const SHAPES: [Shape, string][] = [['dropper', 'Пипетка'], ['toner', 'Флакон'], ['pump', 'Помпа'], ['tube', 'Туба'], ['jar', 'Баночка'], ['minijar', 'Мини-банка'], ['cushion', 'Кушон'], ['lip', 'Тинт'], ['pads', 'Пэды'], ['mask', 'Маска'], ['box', 'Набор'], ['giftcard', 'Карта']];
const TAGS: [Tag, string][] = [['hit', 'Хит продаж'], ['new', 'Новинка'], ['excl', 'Только в Korea Secret']];

function ShapePicker({ p, onPick }: { p: Product; onPick: (s: Shape) => void }) {
  return (
    <div className="a-shapes">
      {SHAPES.map(([s, label]) => (
        <button key={s} type="button" className={cx('a-shape', p.art.shape === s && 'is-active')} onClick={() => onPick(s)} title={label}>
          <span className="a-shape__art"><Art spec={{ kind: 'productData', p: { ...p, images: undefined, art: { ...p.art, shape: s } } }} /></span>
          <span>{label}</span>
        </button>
      ))}
    </div>
  );
}

export function ProductEditor() {
  const sp = useSearchParams();
  const router = useRouter();
  const draft = useAdmin((s) => s.draft);
  const base = useAdmin((s) => s.base);
  const id = sp.get('id') || '';
  const p = draft.products.find((x) => x.id === id);
  const [view, setView] = useState<GalleryView>('front');

  // ?new=1 — create a product and open it
  useEffect(() => {
    if (sp.get('new') !== '1') return;
    const np = newProduct(draft);
    edit((d) => { d.products.unshift(np); }, { label: 'Новый товар' });
    router.replace(`/admin/products/edit/?id=${encodeURIComponent(np.id)}`);
  }, [sp]); // eslint-disable-line react-hooks/exhaustive-deps

  const index = draft.products.findIndex((x) => x.id === id);
  const usages = useMemo(() => (p ? productUsages(draft, p.id) : []), [draft, p]);
  const issues = useMemo(() => issuesOf(draft).filter((i) => i.id === id && i.area === 'Товары'), [draft, id]);
  const isNew = p && !base.products.some((x) => x.id === p.id);

  if (!p) {
    if (sp.get('new') === '1') return null;
    return <div className="adm-page"><Card><Empty title="Товар не найден" text="Возможно, его удалили или переименовали" action={<LinkBtn href="/admin/products/" icon="arrow-left">К списку товаров</LinkBtn>} /></Card></div>;
  }

  const set = <K extends keyof Product>(k: K, v: Product[K], label = `Товар: ${k}`) => edit((d) => { const x = d.products.find((y) => y.id === id); if (x) (x as Product)[k] = v; }, { label, key: `p:${id}:${String(k)}` });
  const setArt = <K extends keyof ArtSpec>(k: K, v: ArtSpec[K]) => edit((d) => { const x = d.products.find((y) => y.id === id); if (x) (x.art as ArtSpec)[k] = v; }, { label: 'Товар: упаковка', key: `p:${id}:art:${String(k)}` });
  const upd = (fn: (x: Product) => void, label: string, key?: string) => edit((d) => { const x = d.products.find((y) => y.id === id); if (x) fn(x as Product); }, { label, key });

  const rename = (next: string) => {
    const nid = next.trim();
    edit((d) => { const x = d.products.find((y) => y.id === id); if (x) x.id = nid; renameProductRefs(d, id, nid); }, { label: 'Товар: новый адрес' });
    router.replace(`/admin/products/edit/?id=${encodeURIComponent(nid)}`);
    toast({ title: 'Адрес страницы изменён', text: `Ссылки в баннерах и подборках обновлены`, kind: 'ok' });
  };
  const remove = async () => {
    const ok = await confirmDialog({ title: 'Удалить товар?', text: <>«{p.name}» исчезнет из каталога после публикации.{usages.length ? <> Он используется в {usages.length} местах — ссылки уберутся автоматически.</> : null}</>, confirm: 'Удалить', danger: true });
    if (!ok) return;
    router.push('/admin/products/');
    edit((d) => { d.products = d.products.filter((x) => x.id !== id); removeProductRefs(d, [id]); }, { label: `Удалён товар: ${p.name}` });
    toast({ title: 'Товар удалён', text: p.name, icon: 'trash', action: { label: 'Вернуть', fn: () => undo() } });
  };
  const duplicate = () => {
    const copy: Product = { ...JSON.parse(JSON.stringify(p)), id: uniqueId(`${p.id}-copy`, (x) => draft.products.some((y) => y.id === x)), name: `${p.name} (копия)`, hidden: true, sku: undefined };
    edit((d) => { d.products.splice(index + 1, 0, copy); }, { label: 'Копия товара' });
    router.push(`/admin/products/edit/?id=${encodeURIComponent(copy.id)}`);
    toast({ title: 'Создана копия — она пока скрыта', icon: 'duplicate' });
  };
  const go = (d: number) => { const x = draft.products[index + d]; if (x) router.push(`/admin/products/edit/?id=${encodeURIComponent(x.id)}`); };

  const brandName = draft.brands.find((b) => b.id === p.brand)?.name || p.brand;
  const typeOpts = draft.taxonomy.categories.flatMap((c) => c.groups.flatMap((g) => g.types)).filter((t, i, a) => a.indexOf(t) === i && draft.taxonomy.types[t]);
  Object.keys(draft.taxonomy.types).forEach((t) => { if (!typeOpts.includes(t)) typeOpts.push(t); });
  const d = discountOf(p);
  const st = stockState(p);
  const views: GalleryView[] = p.images?.length ? p.images.map((_, i) => `photo${i}` as GalleryView) : ['front', 'texture', ...(p.ingr.length ? ['ingredients' as const] : []), 'box', 'duo'];
  const descLen = p.desc.length;
  const seoTitle = `${brandName} ${p.name} — ${draft.settings.name}`;

  return (
    <div className="adm-page">
      <PageHead
        crumbs={[{ label: 'Товары', href: '/admin/products/' }, { label: brandName }]}
        title={<span className="adm-row" style={{ gap: 12, alignItems: 'baseline', flexWrap: 'wrap' }}>{p.name || 'Без названия'}{p.hidden && <Badge icon="eye-off">скрыт</Badge>}{isNew && <Badge tone="green">новый</Badge>}</span>}
        actions={<>
          <IconBtn icon="chev-left" label="Предыдущий товар" onClick={() => go(-1)} disabled={index <= 0} />
          <IconBtn icon="chev-right" label="Следующий товар" onClick={() => go(1)} disabled={index >= draft.products.length - 1} />
          <a className="a-btn" href={`${BASE_PATH}/product/${encodeURIComponent(p.id)}/?preview=1`} target="_blank" rel="noopener noreferrer"><I name="external" />На сайте</a>
          <Menu items={[{ label: 'Дублировать', icon: 'duplicate', onClick: duplicate }, { sep: true }, { label: 'Удалить товар', icon: 'trash', danger: true, onClick: remove }]} />
        </>} />

      {p.hidden && <Note kind="brand" icon="eye-off"><b>Товар скрыт</b> — покупатели его не видят. Включите «Показывать на сайте», когда всё будет готово. <button type="button" className="a-link" onClick={() => set('hidden', false, 'Товар показан')}>Показать сейчас</button></Note>}
      {issues.filter((i) => i.level === 'error').map((i, k) => <Note key={k} kind="error">{i.message}</Note>)}

      <div className="adm-grid adm-grid--editor">
        <div className="adm-stack adm-stack--lg" style={{ minWidth: 0 }}>
          <Card title="Основное">
            <div className="a-form">
              <Field label="Название" error={!p.name.trim() ? 'Нужно название' : undefined}><Input size="title" value={p.name} onValue={(v) => set('name', v, 'Товар: название')} /></Field>
              <div className="a-form-row a-form-row--2">
                <Field label="Бренд"><Select value={p.brand} onValue={(v) => set('brand', v, 'Товар: бренд')} options={draft.brands.slice().sort((a, b) => a.name.localeCompare(b.name)).map((b) => [b.id, b.name] as const)} /></Field>
                <Field label="Тип продукта"><Select value={p.type} onValue={(v) => set('type', v, 'Товар: тип')} options={typeOpts.map((t) => [t, `${draft.taxonomy.types[t].name}`] as const)} /></Field>
              </div>
              <div className="a-form-row a-form-row--2">
                <Field label="Объём или вес" hint="Например: 100 мл, 50 г, 10 шт"><Input value={p.volume} onValue={(v) => set('volume', v, 'Товар: объём')} /></Field>
                <Field label="Артикул" hint={p.sku ? undefined : `Автоматически: ${autoSku({ ...p, sku: undefined })}`}><Input value={p.sku || ''} placeholder={autoSku({ ...p, sku: undefined })} onValue={(v) => set('sku', v || undefined, 'Товар: артикул')} /></Field>
              </div>
              <Field label="Описание" aside={<span className={cx('a-counter', (descLen < 80 || descLen > 400) && 'is-over')}>{descLen} симв. · лучше 120–300</span>} hint="Первое предложение показывается под названием на странице товара">
                <TextArea value={p.desc} onValue={(v) => set('desc', v, 'Товар: описание')} rows={5} autoGrow />
              </Field>
            </div>
          </Card>

          <Card title="Цена и наличие">
            <div className="a-form">
              <div className="a-form-row a-form-row--3">
                <Field label="Цена" error={!(p.price > 0) ? 'Больше нуля' : undefined}><NumInput value={p.price} onValue={(v) => set('price', v ?? 0, 'Товар: цена')} suffix={draft.settings.currency} min={0} /></Field>
                <Field label="Старая цена" hint={d ? `Скидка ${d}%` : 'Зачёркнутая — для скидки'} error={p.old && p.old <= p.price ? 'Должна быть больше цены' : undefined}><NumInput value={p.old} allowEmpty onValue={(v) => set('old', v || undefined, 'Товар: старая цена')} suffix={draft.settings.currency} min={0} /></Field>
                <Field label="Остаток" hint={st === 'out' ? 'Нет в наличии' : st === 'low' ? 'Заканчивается' : 'В наличии'}><NumInput value={p.stock} onValue={(v) => set('stock', Math.max(0, Math.round(v ?? 0)), 'Товар: остаток')} suffix="шт" min={0} /></Field>
              </div>
              {d > 0 && <div className="adm-row" style={{ gap: 8 }}><Badge tone="brand">−{d}%</Badge><span className="adm-muted">покупатель экономит {money(p.old! - p.price, draft.settings.currency)}</span><button type="button" className="a-link" style={{ marginLeft: 'auto' }} onClick={() => set('old', undefined, 'Скидка убрана')}>Убрать скидку</button></div>}
              <div className="a-divider" />
              <Switch checked={!!p.variants?.length} onChange={(on) => upd((x) => { x.variants = on ? [{ name: 'Вариант 1', color: x.art.c }, { name: 'Вариант 2', color: '#c8283e' }] : undefined; }, on ? 'Варианты включены' : 'Варианты выключены')}
                label="У товара есть варианты" hint="Оттенки (тинты, кушоны) или номиналы (подарочные карты) — покупатель выбирает на странице товара" />
              {!!p.variants?.length && (
                <div className="a-stack a-stack--sm">
                  <div className="a-variant adm-muted" style={{ fontSize: 12 }}><span /><span>Название</span><span>Цвет</span><span>Своя цена</span><span /></div>
                  <SortableList items={p.variants} getKey={(_, i) => String(i)} gap={6} className="a-stack a-stack--sm" onMove={(a, b) => upd((x) => moveItem(x.variants!, a, b), 'Варианты: порядок')}
                    render={(v: Variant, i, handle) => (
                      <div className="a-variant">
                        <span className="a-item__handle" {...handle}><I name="drag" className="i--sm" /></span>
                        <Input value={v.name} onValue={(val) => upd((x) => { x.variants![i].name = val; }, 'Вариант: название', `p:${id}:v:${i}:n`)} />
                        <ColorInput size="sm" value={v.color || ''} onChange={(c) => upd((x) => { x.variants![i].color = c; }, 'Вариант: цвет', `p:${id}:v:${i}:c`)} />
                        <NumInput size="sm" value={v.price} allowEmpty placeholder="как у товара" onValue={(n) => upd((x) => { x.variants![i].price = n || undefined; }, 'Вариант: цена', `p:${id}:v:${i}:p`)} />
                        <IconBtn icon="trash" label="Удалить вариант" danger size="sm" onClick={() => upd((x) => { x.variants!.splice(i, 1); if (!x.variants!.length) x.variants = undefined; }, 'Вариант удалён')} />
                      </div>
                    )} />
                  <Btn size="sm" icon="plus" onClick={() => upd((x) => { x.variants!.push({ name: `Вариант ${x.variants!.length + 1}`, color: '#dd4487' }); }, 'Вариант добавлен')}>Добавить вариант</Btn>
                </div>
              )}
            </div>
          </Card>

          <Card title="Фото" sub="Если фото нет, упаковка рисуется автоматически по настройкам ниже">
            <ImagesField value={p.images || []} onChange={(v) => set('images', v.length ? v : undefined, 'Товар: фото')} folder="products" opts={{ max: 1400, removeWhite: true }} />
          </Card>

          <Card title="Нарисованная упаковка" sub={p.images?.length ? 'Сейчас на сайте показываются фото — упаковка нужна, только если фото убрать' : 'Форма, цвета и надписи «пачки»'}>
            <div className="a-stack">
              <ShapePicker p={p} onPick={(s) => setArt('shape', s)} />
              <div className="a-form-row a-form-row--3">
                <Field label="Корпус"><ColorInput value={p.art.c} onChange={(v) => setArt('c', v)} /></Field>
                <Field label="Крышка"><ColorInput value={p.art.cap || ''} onChange={(v) => setArt('cap', v)} /></Field>
                <Field label="Надписи"><ColorInput value={p.art.ink} onChange={(v) => setArt('ink', v)} palette={BRIGHTS.slice(0, 6)} /></Field>
              </div>
              <div className="a-form-row a-form-row--3">
                <Field label="Крупная надпись"><Input value={p.art.big || ''} onValue={(v) => setArt('big', v || undefined)} placeholder="96" /></Field>
                <Field label="Мелкая надпись"><Input value={p.art.sub || ''} onValue={(v) => setArt('sub', v || undefined)} placeholder="SNAIL ESSENCE" /></Field>
                <Field label="Цвет жидкости" hint="Для стеклянных флаконов"><ColorInput value={p.art.liquid || ''} onChange={(v) => setArt('liquid', v)} /></Field>
              </div>
              <div className="adm-row adm-row--wrap" style={{ gap: 18 }}>
                <Switch checked={!!p.art.serif} onChange={(v) => setArt('serif', v || undefined)} label="Шрифт с засечками" />
                <Switch checked={!!p.art.glass} onChange={(v) => setArt('glass', v || undefined)} label="Стекло" />
                <Switch checked={!!p.art.slim} onChange={(v) => setArt('slim', v || undefined)} label="Узкая" />
                <Switch checked={!!p.art.tall} onChange={(v) => setArt('tall', v || undefined)} label="Высокая" />
              </div>
            </div>
          </Card>

          <Card title="Для кого и состав">
            <div className="a-form">
              <Field label="Метки на карточке"><Chips value={p.tags} onChange={(v) => set('tags', v, 'Товар: метки')} options={TAGS} /></Field>
              <Field label="Тип кожи"><Chips value={p.skin} onChange={(v) => set('skin', v, 'Товар: тип кожи')} options={Object.entries(draft.taxonomy.skins)} /></Field>
              <Field label="Задачи" hint="По ним работают фильтры каталога и подборки"><Chips value={p.concerns} onChange={(v) => set('concerns', v, 'Товар: задачи')} options={Object.entries(draft.taxonomy.concerns)} /></Field>
              <Field label="Ключевые ингредиенты" hint="Первые три рисуются на картинке «Компоненты»" aside={<Link className="a-link" href="/admin/ingredients/" style={{ fontSize: 12 }}>Справочник</Link>}>
                <Chips size="sm" value={p.ingr} onChange={(v) => set('ingr', v, 'Товар: состав')} options={Object.entries(draft.ingredients).map(([k, x]) => [k, x.name] as const)} />
              </Field>
            </div>
          </Card>

          <Card title="Рейтинг и отзывы" sub="Пока отзывы не собираются с сайта, рейтинг задаётся вручную">
            <div className="a-form-row a-form-row--2">
              <Field label="Рейтинг"><NumInput value={p.rating} onValue={(v) => set('rating', Math.min(5, Math.max(0, Math.round((v ?? 0) * 10) / 10)), 'Товар: рейтинг')} step={0.1} min={0} max={5} suffix="из 5" /></Field>
              <Field label="Количество отзывов"><NumInput value={p.reviews} onValue={(v) => set('reviews', Math.max(0, Math.round(v ?? 0)), 'Товар: отзывы')} min={0} /></Field>
            </div>
          </Card>

          <Card title="Адрес страницы">
            <Field label="ID товара" hint={<>Страница: <span className="adm-mono">/product/{p.id}/</span> — смена адреса обновит ссылки в баннерах, подборках и блогерах</>}>
              <div className="adm-row" style={{ gap: 6 }}>
                <div className="adm-grow"><LazyInput value={p.id} onCommit={rename} validate={(v) => (!ID_RE.test(v.trim()) ? 'Только латиница, цифры и дефис' : draft.products.some((x) => x.id === v.trim() && x !== p) ? 'Такой ID уже есть' : null)} /></div>
                <Btn icon="wand" onClick={() => { const nid = uniqueId(`${draft.brands.find((b) => b.id === p.brand)?.name || ''} ${p.name}`, (x) => x !== p.id && draft.products.some((y) => y.id === x)); if (nid !== p.id) rename(nid); }} title="Из бренда и названия">Из названия</Btn>
              </div>
            </Field>
          </Card>
        </div>

        <div className="adm-stack adm-sticky">
          <Card title="Видимость">
            <Switch checked={!p.hidden} onChange={(v) => set('hidden', !v, v ? 'Товар показан' : 'Товар скрыт')} label="Показывать на сайте" hint={p.hidden ? 'Скрыт: нет в каталоге, поиске и подборках' : 'Виден в каталоге, поиске и на главной'} />
          </Card>
          <div className="a-preview a-preview--card">
            <span className="a-preview__label"><I name="eye" />Карточка в каталоге</span>
            <div style={{ width: 250, marginTop: 18 }}><ProductCard id={p.id} /></div>
          </div>
          <Card title="Галерея" sub="Как на странице товара">
            <div className="a-art-box"><Art spec={{ kind: 'gallery', id: p.id, view: views.includes(view) ? view : views[0] }} /></div>
            <div className="a-gallery-thumbs">
              {views.map((v) => <button key={v} type="button" className={cx(v === view && 'is-active')} onClick={() => setView(v)}><Art spec={{ kind: 'gallery', id: p.id, view: v }} /></button>)}
            </div>
          </Card>
          <Card title="В поиске Google">
            <div className="a-serp">
              <div className="a-serp__url">{draft.settings.name.toLowerCase().replace(/\s+/g, '')} › product › {p.id}</div>
              <div className="a-serp__title">{seoTitle.length > 62 ? seoTitle.slice(0, 60) + '…' : seoTitle}</div>
              <div className="a-serp__text">{p.desc ? (p.desc.length > 158 ? p.desc.slice(0, 156) + '…' : p.desc) : 'Добавьте описание — оно станет текстом в поиске.'}</div>
            </div>
            <div className="a-field__hint" style={{ marginTop: 8 }}>Коротко на странице: «{firstSentence(p.desc) || '—'}»</div>
          </Card>
          <Card title="Где используется" sub={usages.length ? undefined : 'Пока нигде, кроме каталога'}>
            {usages.length > 0 && <div className="a-changes">{usages.map((u, i) => <Link key={i} className="a-change" href={u.href}><I name="link" className="i--sm adm-muted" /><span className="adm-grow adm-ellipsis"><b style={{ fontWeight: 500 }}>{u.where}</b> · {u.label}</span><I name="chev-right" className="i--sm adm-muted" /></Link>)}</div>}
          </Card>
          {issues.length > 0 && (
            <Card title="Проверка">
              <div className="a-stack a-stack--sm">{issues.map((x, i) => <Note key={i} kind={x.level === 'error' ? 'error' : 'warn'}>{x.message}</Note>)}</div>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}

export { slugify };
