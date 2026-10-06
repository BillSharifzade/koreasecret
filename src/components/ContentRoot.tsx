'use client';
import { Fragment, useEffect, useState, type ReactNode } from 'react';
import { BASE_PATH } from '@/lib/site';
import { setAssetOverrides } from '@/lib/asset';
import { CHANNEL, idbGet, PREVIEW_FLAG, uploadUrls, type BridgeMessage } from '@/lib/bridge';
import { setContent } from '@/lib/data';
import { applyTheme } from '@/lib/theme';
import { useContentVersion } from '@/lib/useContent';
import type { SiteContent } from '@/lib/types';

/** The admin embeds the storefront in frames named like this (live previews inside the panel). */
export const FRAME_NAME = 'ks-preview';
const inFrame = () => typeof window !== 'undefined' && window.name === FRAME_NAME && window.parent !== window;

/** ?preview=1 (from the admin) turns preview on for this tab; it stays on while browsing until «Выйти». */
export function previewOn() {
  if (inFrame()) return true;
  try {
    const url = new URL(window.location.href);
    if (url.searchParams.get('preview') === '1') {
      sessionStorage.setItem(PREVIEW_FLAG, '1');
      url.searchParams.delete('preview');
      window.history.replaceState(window.history.state, '', url.pathname + url.search + url.hash);
    }
    return sessionStorage.getItem(PREVIEW_FLAG) === '1';
  } catch { return false; }
}

/*
 * Renders the storefront from the current content document. Every content swap remounts the tree (key), so cached
 * memos and carousels pick the new data up. In preview mode the admin's draft replaces the published content and
 * follows the admin live: each edit arrives over a BroadcastChannel.
 */
export function ContentRoot({ children }: { children: ReactNode }) {
  const v = useContentVersion();
  const [preview, setPreview] = useState<'off' | 'loading' | 'on' | 'empty'>('off');

  useEffect(() => {
    if (!previewOn()) return;
    const frame = inFrame();
    if (frame) document.documentElement.classList.add('ks-frame');
    setPreview(frame ? 'off' : 'loading');
    let alive = true;
    let ch: BroadcastChannel | null = null;
    (async () => {
      const apply = async (c: SiteContent | undefined) => {
        if (!alive) return;
        if (!c) { if (!frame) setPreview('empty'); window.parent.postMessage({ type: 'ks-ready' }, window.location.origin); return; }
        setAssetOverrides(await uploadUrls());
        setContent(c);
        applyTheme(c.theme.brand);
        document.documentElement.classList.toggle('has-promo', c.promoBar.enabled && c.promoBar.messages.length > 0);
        if (!frame) setPreview('on');
        window.parent.postMessage({ type: 'ks-ready' }, window.location.origin);
      };
      await apply(await idbGet<SiteContent>('draft'));
      try {
        ch = new BroadcastChannel(CHANNEL);
        ch.onmessage = async (e: MessageEvent<BridgeMessage>) => {
          if (e.data.type === 'draft') await apply(e.data.content);
          else if (e.data.type === 'uploads') setAssetOverrides(await uploadUrls());
          else if (e.data.type === 'reset') window.location.reload();
        };
      } catch { /* no live updates */ }
    })();
    // inside the admin: scroll to / highlight a block on request, report clicks on home page blocks
    const onMsg = (e: MessageEvent) => {
      if (e.origin !== window.location.origin || !e.data || typeof e.data !== 'object') return;
      if (e.data.type === 'ks-focus') {
        document.querySelectorAll('.ks-focus').forEach((el) => el.classList.remove('ks-focus'));
        const el = e.data.id ? document.getElementById(e.data.id) || document.querySelector(`[data-ks-id="${CSS.escape(String(e.data.id))}"]`) : null;
        // scroll this frame only (scrollIntoView would scroll the admin page around the frame too), below the fixed header
        if (el) { el.classList.add('ks-focus'); window.scrollTo({ top: Math.max(0, el.getBoundingClientRect().top + window.scrollY - (el.id === 'hero' || el.classList.contains('hero') ? 0 : 96)), behavior: e.data.instant ? 'auto' : 'smooth' }); }
        else if (e.data.top) window.scrollTo({ top: 0, behavior: 'smooth' });
      }
    };
    const onClick = (e: MouseEvent) => {
      const el = (e.target as Element).closest<HTMLElement>('main > section[id], main > [data-ks-id]');
      if (el) window.parent.postMessage({ type: 'ks-click', id: el.dataset.ksId || el.id }, window.location.origin);
    };
    if (frame) { window.addEventListener('message', onMsg); document.addEventListener('click', onClick, true); }
    return () => { alive = false; ch?.close(); window.removeEventListener('message', onMsg); document.removeEventListener('click', onClick, true); };
  }, []);

  const exit = () => { try { sessionStorage.removeItem(PREVIEW_FLAG); } catch { /* ignore */ } window.location.reload(); };

  return (
    <>
      <Fragment key={v}>{children}</Fragment>
      {preview !== 'off' && (
        <div className={`preview-bar${preview === 'loading' ? ' is-loading' : ''}`} role="status">
          <span className="preview-bar__dot" />
          <span className="preview-bar__text">{preview === 'empty' ? 'Черновика нет — показан опубликованный сайт' : preview === 'loading' ? 'Загружаем черновик…' : <>Предпросмотр черновика<small>изменения из админки появляются сразу</small></>}</span>
          <a className="preview-bar__btn" href={`${BASE_PATH}/admin/`}>Админка</a>
          <button className="preview-bar__btn preview-bar__btn--x" type="button" onClick={exit}>Выйти</button>
        </div>
      )}
    </>
  );
}
