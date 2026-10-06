'use client';
import Link from 'next/link';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { copyText } from '@/components/providers';
import { asset } from '@/lib/asset';
import { contentImages, fmtBytes, uploadImage } from '../state/media';
import { github, removePendingUploads, useAdmin, type UploadMeta } from '../state/store';
import { I } from '../ui/icons';
import { ago, Badge, Btn, Card, cx, Empty, Note, PageHead, Seg } from '../ui/kit';
import { confirmDialog, Sheet, toast } from '../ui/overlay';
import '../styles/system.css';

type Filter = 'all' | 'used' | 'unused' | 'pending';
interface Item { path: string; uses: { where: string; href: string }[]; pending?: UploadMeta; repo?: { size: number }; kind: 'upload' | 'site' | 'external' }

const base = (p: string) => p.split('/').pop() || p;

export function Media() {
  const draft = useAdmin((s) => s.draft);
  const uploads = useAdmin((s) => s.uploads);
  const session = useAdmin((s) => s.session);
  const gh = session?.mode === 'github';
  const [repo, setRepo] = useState<{ state: 'idle' | 'loading' | 'error'; files: { path: string; size: number }[]; error?: string }>({ state: 'idle', files: [] });
  const [filter, setFilter] = useState<Filter>('all');
  const [sel, setSel] = useState<string | null>(null);
  const [drag, setDrag] = useState(false);
  const [busy, setBusy] = useState(0);
  const [size, setSize] = useState<{ w: number; h: number } | null>(null);
  const input = useRef<HTMLInputElement>(null);

  const loadRepo = useCallback(async () => {
    const g = github();
    if (!g) return;
    setRepo((r) => ({ ...r, state: 'loading' }));
    try { setRepo({ state: 'idle', files: (await g.listDir('public/uploads/')).map((f) => ({ path: f.path.replace(/^public/, ''), size: f.size })) }); }
    catch (e) { setRepo({ state: 'error', files: [], error: e instanceof Error ? e.message : String(e) }); }
  }, []);
  useEffect(() => { if (gh) loadRepo(); }, [gh, loadRepo]);

  const items = useMemo(() => {
    const m = new Map<string, Item>();
    const get = (path: string) => {
      let x = m.get(path);
      if (!x) { x = { path, uses: [], kind: /^https?:/i.test(path) ? 'external' : path.startsWith('/uploads/') ? 'upload' : 'site' }; m.set(path, x); }
      return x;
    };
    uploads.forEach((u) => { get(u.path).pending = u; });
    repo.files.forEach((f) => { get(f.path).repo = { size: f.size }; });
    contentImages(draft).forEach((c) => get(c.path).uses.push({ where: c.where, href: c.href }));
    return [...m.values()].sort((a, b) => (b.pending?.addedAt || 0) - (a.pending?.addedAt || 0) || Number(!!b.uses.length) - Number(!!a.uses.length) || a.path.localeCompare(b.path));
  }, [draft, uploads, repo.files]);

  const counts = { all: items.length, used: items.filter((x) => x.uses.length).length, unused: items.filter((x) => !x.uses.length).length, pending: items.filter((x) => x.pending).length };
  const shown = items.filter((x) => filter === 'all' || (filter === 'used' ? x.uses.length > 0 : filter === 'unused' ? !x.uses.length : !!x.pending));
  const current = sel ? items.find((x) => x.path === sel) : undefined;
  const removable = items.filter((x) => x.repo && !x.uses.length && !x.pending);

  const add = async (files: FileList | File[]) => {
    const list = [...files].filter((f) => f.type.startsWith('image/'));
    if (!list.length) return;
    setBusy(list.length);
    let done = 0;
    for (const f of list) {
      try { await uploadImage(f, f.name, { folder: 'library' }); done++; }
      catch (e) { toast({ title: `Не удалось: ${f.name}`, text: e instanceof Error ? e.message : String(e), kind: 'error' }); }
      setBusy((n) => n - 1);
    }
    if (done) { toast({ title: `Загружено: ${done}`, text: 'Используйте их через «Из медиатеки» в товарах, баннерах и блоках', kind: 'ok' }); setFilter('pending'); }
  };

  const deleteFromRepo = async (paths: string[]) => {
    const g = github();
    if (!g || !paths.length) return;
    const ok = await confirmDialog({
      title: paths.length === 1 ? 'Удалить файл из репозитория?' : `Удалить ${paths.length} файлов из репозитория?`,
      text: <>Файлы не используются ни в одном товаре или блоке. Удаление — отдельный коммит; сайт пересоберётся. Вернуть файл можно из истории репозитория на GitHub.</>,
      confirm: 'Удалить', danger: true
    });
    if (!ok) return;
    try {
      const head = await g.head();
      await g.commit(paths.map((p) => ({ path: 'public' + p, content: null })), paths.length === 1 ? `Удаление неиспользуемого файла ${base(paths[0])}` : 'Удаление неиспользуемых файлов', head);
      toast({ title: 'Файлы удалены из репозитория', kind: 'ok' });
      setSel(null);
      await loadRepo();
    } catch (e) { toast({ title: 'Не удалось удалить', text: e instanceof Error ? e.message : String(e), kind: 'error' }); }
  };

  const cancelUpload = async (it: Item) => {
    if (it.uses.length) {
      const ok = await confirmDialog({ title: 'Отменить загрузку?', text: <>Картинка используется ({it.uses.map((u) => u.where).join(', ')}) — там она пропадёт. Лучше сначала заменить её в этих местах.</>, confirm: 'Всё равно отменить', danger: true });
      if (!ok) return;
    }
    await removePendingUploads([it.path]);
    setSel(null);
    toast({ title: 'Загрузка отменена', icon: 'trash' });
  };

  const fullUrl = (p: string) => (/^https?:/i.test(p) ? p : new URL(asset(p).startsWith('blob:') ? p : asset(p), window.location.origin).href);

  return (
    <div className="adm-page">
      <PageHead title={<>Медиа<em>тека</em></>} sub="Все картинки сайта: фото товаров, баннеры, логотипы, карты магазинов. Новые загрузки ждут публикации и уезжают в репозиторий вместе с изменениями, где они используются."
        actions={<>
          {gh && <Btn icon="refresh" loading={repo.state === 'loading'} onClick={loadRepo}>Обновить</Btn>}
          {gh && removable.length > 0 && <Btn variant="danger" icon="trash" onClick={() => deleteFromRepo(removable.map((x) => x.path))}>Удалить неиспользуемые · {removable.length}</Btn>}
          <Btn variant="primary" icon="upload" onClick={() => input.current?.click()}>Загрузить</Btn>
        </>} />
      {!gh && <Note>Демо-режим: показаны картинки из контента и ваши загрузки. Файлы репозитория (в том числе неиспользуемые) видны после входа через GitHub.</Note>}
      {repo.state === 'error' && <Note kind="error">Не удалось получить список файлов: {repo.error}</Note>}
      <Card flush>
        <div className="a-toolbar">
          <Seg value={filter} onChange={setFilter} options={[{ value: 'all', label: 'Все', count: counts.all }, { value: 'used', label: 'Используются', count: counts.used }, { value: 'unused', label: 'Не используются', count: counts.unused }, { value: 'pending', label: 'Ждут публикации', count: counts.pending }]} />
        </div>
        <div className={cx('a-image a-sys-drop', drag && 'is-drag', busy > 0 && 'is-busy')} role="button" tabIndex={0} onClick={() => input.current?.click()}
          onDragOver={(e) => { e.preventDefault(); setDrag(true); }} onDragLeave={() => setDrag(false)} onDrop={(e) => { e.preventDefault(); setDrag(false); add(e.dataTransfer.files); }}>
          <div className="a-image__empty"><I name="upload" /><b>Перетащите картинки сюда</b><span>JPG, PNG или WebP — сожмём и переведём в WebP до 1600 px</span></div>
        </div>
        <input ref={input} type="file" accept="image/*" multiple hidden onChange={(e) => { if (e.target.files) add(e.target.files); e.target.value = ''; }} />
        {shown.length ? (
          <div className="a-sys-media">
            {shown.map((x) => (
              <button key={x.path} type="button" className={cx('a-sys-tile', sel === x.path && 'is-active')} onClick={() => { setSize(null); setSel(x.path); }} title={x.path}>
                <span className="a-sys-tile__img">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={asset(x.path)} alt="" loading="lazy" />
                </span>
                {x.pending ? <span className="a-sys-tile__badge"><Badge tone="amber">ждёт публикации</Badge></span> : !x.uses.length ? <span className="a-sys-tile__badge"><Badge>не используется</Badge></span> : null}
                <span className="a-sys-tile__name">{base(x.path)}</span>
                <span className="a-sys-tile__meta">
                  {x.uses.length ? <span>{x.uses.length === 1 ? x.uses[0].where : `${x.uses.length} места`}</span> : <span>—</span>}
                  {(x.pending?.size || x.repo?.size) ? <span>· {fmtBytes(x.pending?.size || x.repo!.size)}</span> : null}
                </span>
              </button>
            ))}
          </div>
        ) : <Empty title="Здесь пусто" text={filter === 'pending' ? 'Все загрузки уже опубликованы' : filter === 'unused' ? 'Неиспользуемых картинок нет — порядок!' : 'Картинок пока нет'} icon="images" />}
      </Card>
      <Note icon="info">Фото магазинов и карты из <span className="adm-mono">/public/stores/</span> — часть кода сайта: их можно заменить в карточке магазина, но не удалить отсюда.</Note>

      <Sheet open={!!current} onClose={() => setSel(null)} title={current ? base(current.path) : ''} sub={current?.pending ? `Загружено ${ago(current.pending.addedAt)} · ждёт публикации` : current?.kind === 'site' ? 'Файл сайта' : current?.kind === 'external' ? 'Внешняя ссылка' : 'Опубликовано'}
        foot={current && <>
          {current.pending && <Btn variant="danger" icon="trash" onClick={() => cancelUpload(current)}>Отменить загрузку</Btn>}
          {gh && current.repo && !current.uses.length && !current.pending && <Btn variant="danger" icon="trash" onClick={() => deleteFromRepo([current.path])}>Удалить из репозитория</Btn>}
          <span className="adm-grow" />
          <Btn icon="copy" onClick={() => { copyText(fullUrl(current.path)); toast({ title: 'Ссылка скопирована', icon: 'copy' }); }}>Копировать ссылку</Btn>
          <Btn variant="dark" onClick={() => setSel(null)}>Готово</Btn>
        </>}>
        {current && (
          <div className="a-stack a-stack--lg">
            <div className="a-sys-big">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={asset(current.path)} alt="" onLoad={(e) => setSize({ w: e.currentTarget.naturalWidth, h: e.currentTarget.naturalHeight })} />
            </div>
            <dl className="a-sys-kv">
              <dt>Путь</dt><dd className="adm-mono">{current.path}</dd>
              {size && <><dt>Размер</dt><dd>{size.w} × {size.h} px{(current.pending?.size || current.repo?.size) ? ` · ${fmtBytes(current.pending?.size || current.repo!.size)}` : ''}</dd></>}
              {current.pending && <><dt>Исходный файл</dt><dd>{current.pending.name}</dd><dt>Формат</dt><dd>{current.pending.type}</dd></>}
              <dt>Статус</dt><dd>{current.pending ? 'Ждёт публикации — уедет в репозиторий, если используется в черновике' : current.kind === 'site' ? 'Часть кода сайта' : current.kind === 'external' ? 'Загружается с другого сайта' : current.repo ? 'В репозитории' : 'Опубликовано'}</dd>
            </dl>
            <div className="a-stack a-stack--sm">
              <div className="a-section-title">Где используется</div>
              {current.uses.length ? (
                <div className="a-changes">{current.uses.map((u, i) => <Link key={i} className="a-change" href={u.href} onClick={() => setSel(null)}><I name="link" className="i--sm adm-muted" /><span className="adm-grow adm-ellipsis">{u.where}</span><I name="chev-right" className="i--sm adm-muted" /></Link>)}</div>
              ) : <div className="adm-muted">Нигде. {current.pending ? 'Выберите её через «Из медиатеки» в товаре, баннере или блоке — иначе она не опубликуется.' : current.repo ? 'Файл можно удалить из репозитория.' : ''}</div>}
            </div>
          </div>
        )}
      </Sheet>
    </div>
  );
}
