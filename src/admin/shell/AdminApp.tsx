'use client';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Suspense, useEffect, useState, type ReactNode } from 'react';
import { Butterfly, Mark } from '@/components/Brand';
import { Providers } from '@/components/providers';
import { BASE_PATH } from '@/lib/site';
import { useOrders } from '../orders/store';
import { siteUrl } from '../state/publish';
import { boot, logout, redo, undo, useAdmin } from '../state/store';
import { AdminSprite, I } from '../ui/icons';
import { ago, Btn, cx, IconBtn, Kbd, Menu } from '../ui/kit';
import { AskHost, toast, ToastHost } from '../ui/overlay';
import { CommandPalette, setPalette } from './Command';
import { Login } from './Login';
import { NAV } from './nav';
import { openPanel, PublishHost, useChanges, useIssues } from './Publish';

function Boot() {
  return <div className="adm-boot"><Butterfly /></div>;
}

/** Signs in, then renders the panel. Everything below needs the browser (IndexedDB, the draft), so the static
 *  export only contains this boot screen and the pages fill in on the client. */
export function AdminApp({ children }: { children: ReactNode }) {
  const ready = useAdmin((s) => s.ready);
  const session = useAdmin((s) => s.session);
  useEffect(() => { boot(); }, []);
  useEffect(() => { document.body.classList.add('adm-body'); return () => document.body.classList.remove('adm-body'); }, []);
  return (
    <>
      <AdminSprite />
      <Providers>
        {!ready ? <Boot /> : !session ? <Login /> : <Shell>{children}</Shell>}
        <ToastHost />
        <AskHost />
      </Providers>
    </>
  );
}

function Sidebar({ onNavigate }: { onNavigate: () => void }) {
  const pathname = usePathname();
  const session = useAdmin((s) => s.session);
  const products = useAdmin((s) => s.draft.products.length);
  const changes = useChanges().length;
  const orders = useOrders();
  const fresh = orders.filter((o) => o.status === 'new').length;
  const badge = (b?: string) => b === 'orders' ? (fresh ? <span className="adm-nav__count is-hot">{fresh}</span> : null)
    : b === 'products' ? <span className="adm-nav__count">{products}</span>
    : b === 'changes' && changes ? <span className="adm-nav__count is-hot">{changes}</span> : null;
  const isActive = (href: string) => (href === '/admin/' ? pathname === '/admin' || pathname === '/admin/' : pathname.startsWith(href.replace(/\/$/, '')));
  const user = session?.user;
  return (
    <aside className="adm-side">
      <div className="adm-side__panel">
        <Link className="adm-brand" href="/admin/" onClick={onNavigate}>
          <Mark className="adm-brand__mark" />
          <span className="adm-brand__word"><span className="adm-brand__name">Korea Secret<Butterfly /></span><span className="adm-brand__tag">Панель управления</span></span>
        </Link>
        <nav className="adm-nav" aria-label="Разделы">
          {NAV.map((g) => (
            <div key={g.label} className="adm-nav__group">
              <div className="adm-nav__label">{g.label}</div>
              {g.items.map((it) => (
                <Link key={it.href} href={it.href} className={cx('adm-nav__item', isActive(it.href) && 'is-active')} onClick={onNavigate} title={it.label}>
                  <I name={it.icon} /><span>{it.label}</span>{badge(it.badge)}
                </Link>
              ))}
            </div>
          ))}
        </nav>
        <div className="adm-side__foot">
          <Menu up align="left" items={[
            { heading: session?.mode === 'github' ? `${session.repo} · ${session.branch}` : 'Демо-режим' },
            { label: 'Открыть сайт', icon: 'external', onClick: () => window.open(session?.mode === 'github' ? siteUrl() : `${BASE_PATH}/`, '_blank') },
            { label: 'Сайт с черновиком', icon: 'eye', onClick: () => window.open(`${BASE_PATH}/?preview=1`, '_blank') },
            ...(session?.mode === 'github' ? [{ label: 'Репозиторий на GitHub', icon: 'github', onClick: () => window.open(`https://github.com/${session.repo}`, '_blank') }] : []),
            { sep: true, label: '' },
            { label: 'Выйти', icon: 'logout', danger: true, onClick: logout }
          ]} trigger={(toggle) => (
            <button type="button" className="adm-user" onClick={toggle} style={{ width: '100%', textAlign: 'left' }}>
              <span className="adm-user__avatar">{user?.avatar_url
                // eslint-disable-next-line @next/next/no-img-element
                ? <img src={user.avatar_url} alt="" />
                : <I name="user" />}</span>
              <div style={{ minWidth: 0, flex: 1 }}>
                <div className="adm-user__name adm-ellipsis">{user ? user.name || user.login : 'Демо-режим'}</div>
                <div className="adm-user__meta adm-ellipsis">{session?.mode === 'github' ? `@${user?.login} · GitHub` : 'изменения только в браузере'}</div>
              </div>
              <I name="more" className="i--sm adm-muted" />
            </button>
          )} />
        </div>
      </div>
    </aside>
  );
}

function StatusChip() {
  const changes = useChanges();
  const issues = useIssues();
  const deploy = useAdmin((s) => s.deploy);
  const remote = useAdmin((s) => s.remote);
  const savedAt = useAdmin((s) => s.savedAt);
  const errors = issues.filter((i) => i.level === 'error').length;
  const busy = deploy && (deploy.phase === 'waiting' || deploy.phase === 'queued' || deploy.phase === 'in_progress');
  const [, tick] = useState(0);
  useEffect(() => { const t = window.setInterval(() => tick((n) => n + 1), 15000); return () => window.clearInterval(t); }, []);
  const cls = busy ? 'is-busy' : errors || remote.state === 'error' ? 'is-error' : changes.length ? 'is-dirty' : '';
  const label = busy ? 'Сайт обновляется…'
    : errors ? `Ошибок: ${errors}`
    : changes.length ? `${changes.length} ${changes.length % 10 === 1 && changes.length % 100 !== 11 ? 'изменение' : changes.length % 10 >= 2 && changes.length % 10 <= 4 && (changes.length % 100 < 12 || changes.length % 100 > 14) ? 'изменения' : 'изменений'}`
    : deploy?.phase === 'success' && Date.now() - (deploy.finishedAt || 0) < 5 * 60e3 ? 'Сайт обновлён' : 'Всё опубликовано';
  return (
    <button type="button" className={cx('adm-status', cls)} onClick={() => openPanel('changes')} title={savedAt ? `Черновик сохранён ${ago(savedAt)}` : undefined}>
      <span className="adm-status__dot" /><span className="adm-status__label">{label}</span>
    </button>
  );
}

function Topbar({ onBurger }: { onBurger: () => void }) {
  const session = useAdmin((s) => s.session);
  const history = useAdmin((s) => s.history);
  const changes = useChanges();
  const doUndo = () => { const l = undo(); if (l) toast({ title: `Отменено: ${l}`, icon: 'undo', action: { label: 'Вернуть', fn: () => redo() } }); };
  const doRedo = () => { const l = redo(); if (l) toast({ title: `Повторено: ${l}`, icon: 'redo' }); };
  return (
    <div className="adm-top">
      <IconBtn icon="menu" label="Меню" className="adm-top__burger" onClick={onBurger} />
      <button type="button" className="adm-search" onClick={() => setPalette(true)} aria-label="Поиск и команды">
        <I name="search" className="i--sm" /><span>Поиск товаров, разделов и команд…</span><Kbd>⌘K</Kbd>
      </button>
      <div className="adm-top__spacer" />
      <div className="adm-top__group">
        <IconBtn icon="undo" label={history.undo.length ? `Отменить: ${history.undo[history.undo.length - 1]} (⌘Z)` : 'Отменить (⌘Z)'} onClick={doUndo} disabled={!history.undo.length} />
        <IconBtn icon="redo" label="Повторить (⌘⇧Z)" onClick={doRedo} disabled={!history.redo.length} />
      </div>
      <StatusChip />
      <a className="a-btn a-btn--white" href={`${BASE_PATH}/?preview=1`} target="_blank" rel="noopener noreferrer" title="Открыть сайт с черновиком"><I name="eye" /><span className="a-top__publish-label">Предпросмотр</span></a>
      <Btn variant="primary" icon={session?.mode === 'github' ? 'cloud' : 'download'} disabled={!changes.length} onClick={() => openPanel('publish')}>
        <span className="a-top__publish-label">{session?.mode === 'github' ? 'Опубликовать' : 'Выгрузить'}</span>
      </Btn>
    </div>
  );
}

function Shell({ children }: { children: ReactNode }) {
  const [nav, setNav] = useState(false);
  const pathname = usePathname();
  useEffect(() => { setNav(false); window.scrollTo(0, 0); }, [pathname]);

  // keyboard: ⌘K search, ⌘Z / ⌘⇧Z history, ⌘S publish
  useEffect(() => {
    const on = (e: KeyboardEvent) => {
      const mod = e.metaKey || e.ctrlKey;
      if (!mod) return;
      const k = e.key.toLowerCase();
      if (k === 'k') { e.preventDefault(); setPalette(true); }
      else if (k === 's') { e.preventDefault(); openPanel('publish'); }
      else if ((k === 'z' && e.shiftKey) || k === 'y') { e.preventDefault(); const l = redo(); if (l) toast({ title: `Повторено: ${l}`, icon: 'redo' }); }
      else if (k === 'z') {
        // single-line inputs keep their own undo only while typing a new value; history steps cover the rest
        e.preventDefault();
        const l = undo();
        if (l) toast({ title: `Отменено: ${l}`, icon: 'undo', action: { label: 'Вернуть', fn: () => redo() } });
      }
    };
    window.addEventListener('keydown', on);
    return () => window.removeEventListener('keydown', on);
  }, []);

  // leaving with an unsent draft is fine (it is saved), but warn while a publish is being written
  return (
    <div className={cx('adm', nav && 'is-nav-open')}>
      <Sidebar onNavigate={() => setNav(false)} />
      <div className="adm-side__backdrop" onClick={() => setNav(false)} />
      <div className="adm-main">
        <Topbar onBurger={() => setNav(true)} />
        <main className="adm-content"><Suspense fallback={null}>{children}</Suspense></main>
      </div>
      <CommandPalette />
      <PublishHost />
    </div>
  );
}
