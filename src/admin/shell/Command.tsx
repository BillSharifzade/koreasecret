'use client';
import { useRouter } from 'next/navigation';
import { useEffect, useMemo, useRef, useState, useSyncExternalStore } from 'react';
import { Art } from '@/components/Art';
import { mdText } from '@/lib/md';
import { BASE_PATH } from '@/lib/site';
import { brandOf, price } from '@/lib/shop';
import { useAdmin, undo, redo, logout } from '../state/store';
import { I } from '../ui/icons';
import { toast } from '../ui/overlay';
import { ALL_PAGES } from './nav';
import { exportJson, openPanel } from './Publish';

let open = false;
const ls = new Set<() => void>();
export const setPalette = (v: boolean) => { open = v; ls.forEach((l) => l()); };
const usePalette = () => useSyncExternalStore((f) => { ls.add(f); return () => { ls.delete(f); }; }, () => open, () => false);

interface Cmd { id: string; group: string; label: string; sub?: string; icon?: string; product?: string; keywords?: string; run: () => void }

const norm = (s: string) => s.toLowerCase().replace(/ё/g, 'е');

export function CommandPalette() {
  const isOpen = usePalette();
  const router = useRouter();
  const draft = useAdmin((s) => s.draft);
  const [q, setQ] = useState('');
  const [active, setActive] = useState(0);
  const list = useRef<HTMLDivElement>(null);
  useEffect(() => { if (isOpen) { setQ(''); setActive(0); } }, [isOpen]);

  const go = (href: string) => () => router.push(href);
  const cmds = useMemo<Cmd[]>(() => {
    if (!isOpen) return [];
    const out: Cmd[] = [
      { id: 'a-new', group: 'Действия', label: 'Новый товар', icon: 'plus', keywords: 'добавить создать', run: go('/admin/products/edit/?new=1') },
      { id: 'a-pub', group: 'Действия', label: 'Опубликовать изменения', icon: 'cloud', keywords: 'publish деплой', run: () => openPanel('publish') },
      { id: 'a-chg', group: 'Действия', label: 'Показать изменения черновика', icon: 'history', run: () => openPanel('changes') },
      { id: 'a-prev', group: 'Действия', label: 'Открыть сайт с черновиком', icon: 'eye', keywords: 'предпросмотр preview', run: () => window.open(`${BASE_PATH}/?preview=1`, '_blank') },
      { id: 'a-undo', group: 'Действия', label: 'Отменить последнее изменение', icon: 'undo', keywords: 'undo ctrl z', run: () => { const l = undo(); toast({ title: l ? `Отменено: ${l}` : 'Нечего отменять' }); } },
      { id: 'a-redo', group: 'Действия', label: 'Повторить', icon: 'redo', run: () => { const l = redo(); toast({ title: l ? `Повторено: ${l}` : 'Нечего повторять' }); } },
      { id: 'a-exp', group: 'Действия', label: 'Скачать резервную копию (JSON)', icon: 'download', keywords: 'экспорт backup', run: () => exportJson() },
      { id: 'a-out', group: 'Действия', label: 'Выйти', icon: 'logout', run: logout },
      ...ALL_PAGES.map((p) => ({ id: 'p' + p.href, group: 'Разделы', label: p.label, sub: p.group, icon: p.icon, keywords: p.keywords, run: go(p.href) })),
      ...draft.products.map((p) => ({ id: 'pr' + p.id, group: 'Товары', label: p.name, sub: `${brandOf(p.brand).name} · ${price(p.price)} · остаток ${p.stock}`, product: p.id, keywords: `${p.id} ${p.sku || ''}`, run: go(`/admin/products/edit/?id=${encodeURIComponent(p.id)}`) })),
      ...draft.brands.map((b) => ({ id: 'b' + b.id, group: 'Бренды', label: b.name, icon: 'tag', run: go(`/admin/brands/?id=${b.id}`) })),
      ...draft.heroSlides.map((s) => ({ id: 'h' + s.id, group: 'Баннеры', label: mdText(s.title), sub: s.kicker, icon: 'image', run: go(`/admin/banners/?id=${s.id}`) })),
      ...draft.promos.map((s) => ({ id: 'pm' + s.id, group: 'Акции', label: s.title, sub: s.date, icon: 'percent', run: go(`/admin/promos/?id=${s.id}`) })),
      ...draft.articles.map((s) => ({ id: 'ar' + s.id, group: 'Журнал', label: s.title, icon: 'book', run: go(`/admin/journal/?id=${s.id}`) })),
      ...draft.stores.map((s) => ({ id: 'st' + s.id, group: 'Магазины', label: s.addr, sub: s.city, icon: 'store', run: go(`/admin/stores/?id=${s.id}`) })),
      ...draft.collections.map((s) => ({ id: 'co' + s.id, group: 'Подборки', label: s.title, icon: 'grid', run: go(`/admin/collections/?id=${s.id}`) })),
      ...draft.bloggers.map((s) => ({ id: 'bl' + s.id, group: 'Блогеры', label: s.name, sub: s.about, icon: 'user', run: go(`/admin/bloggers/?id=${s.id}`) }))
    ];
    return out;
  }, [isOpen, draft]); // eslint-disable-line react-hooks/exhaustive-deps

  const found = useMemo(() => {
    const words = norm(q).split(/\s+/).filter(Boolean);
    if (!words.length) return cmds.filter((c) => c.group === 'Действия' || c.group === 'Разделы');
    return cmds.filter((c) => { const hay = norm(`${c.label} ${c.sub || ''} ${c.keywords || ''} ${c.group}`); return words.every((w) => hay.includes(w)); }).slice(0, 60);
  }, [cmds, q]);

  useEffect(() => { setActive(0); }, [q]);
  useEffect(() => { list.current?.querySelector('.is-active')?.scrollIntoView({ block: 'nearest' }); }, [active]);
  if (!isOpen) return null;

  const run = (c: Cmd) => { setPalette(false); c.run(); };
  let lastGroup = '';
  return (
    <div className="a-cmdk-wrap" onKeyDown={(e) => {
      if (e.key === 'ArrowDown') { e.preventDefault(); setActive((a) => Math.min(found.length - 1, a + 1)); }
      if (e.key === 'ArrowUp') { e.preventDefault(); setActive((a) => Math.max(0, a - 1)); }
      if (e.key === 'Enter' && found[active]) { e.preventDefault(); run(found[active]); }
      if (e.key === 'Escape') setPalette(false);
    }}>
      <div className="a-overlay is-open" onClick={() => setPalette(false)} />
      <div className="a-cmdk" role="dialog" aria-label="Поиск и команды" style={{ position: 'relative', zIndex: 1 }}>
        <div className="a-cmdk__input"><I name="search" /><input autoFocus value={q} onChange={(e) => setQ(e.target.value)} placeholder="Товар, раздел, баннер или действие…" /><kbd className="adm-kbd">Esc</kbd></div>
        <div className="a-cmdk__list" ref={list}>
          {found.length ? found.map((c, i) => {
            const head = c.group !== lastGroup ? <div className="a-cmdk__group">{c.group}</div> : null;
            lastGroup = c.group;
            return (
              <div key={c.id}>
                {head}
                <button type="button" className={`a-cmdk__item${i === active ? ' is-active' : ''}`} onMouseMove={() => setActive(i)} onClick={() => run(c)}>
                  {c.product ? <span className="a-cmdk__thumb"><Art spec={{ kind: 'product', id: c.product }} /></span> : <I name={c.icon || 'chev-right'} />}
                  <span className="a-cmdk__label"><b>{c.label}</b>{c.sub && <small>{c.sub}</small>}</span>
                  {i === active && <I name="arrow-right" className="i--sm" />}
                </button>
              </div>
            );
          }) : <div className="a-empty" style={{ padding: 30 }}>Ничего не нашлось</div>}
        </div>
        <div className="a-cmdk__foot"><span><kbd className="adm-kbd">↑</kbd><kbd className="adm-kbd">↓</kbd>выбор</span><span><kbd className="adm-kbd">↵</kbd>открыть</span><span><kbd className="adm-kbd">⌘</kbd><kbd className="adm-kbd">K</kbd>в любом месте</span></div>
      </div>
    </div>
  );
}
