'use client';
import { useEffect, useRef, useState, type ReactNode } from 'react';
import { BASE_PATH } from '@/lib/site';
import { I } from './icons';
import { cx, IconBtn, Seg } from './kit';

export type Device = 'desktop' | 'mobile';
const WIDTH: Record<Device, number> = { desktop: 1440, mobile: 390 };

/*
 * The real storefront in an iframe, running the draft in preview mode: what visitors will see, updated live as the
 * draft changes (the frame listens on the same BroadcastChannel as preview tabs). `focus` scrolls to and outlines a
 * block; clicks on home page blocks come back through onSelect.
 */
export function SitePreview({ path = '/', device = 'desktop', focus, onSelect, height = 640, className, toolbar = true, onDevice }: {
  path?: string; device?: Device; focus?: string; onSelect?: (id: string) => void; height?: number | string; className?: string; toolbar?: boolean; onDevice?: (d: Device) => void;
}) {
  const box = useRef<HTMLDivElement>(null);
  const frame = useRef<HTMLIFrameElement>(null);
  const [size, setSize] = useState({ w: 0, h: 0 });
  const [ready, setReady] = useState(false);
  const [nonce, setNonce] = useState(0);
  const focusRef = useRef(focus);
  focusRef.current = focus;
  const selRef = useRef(onSelect);
  selRef.current = onSelect;

  useEffect(() => {
    const el = box.current;
    if (!el) return;
    const ro = new ResizeObserver(() => setSize({ w: el.clientWidth, h: el.clientHeight }));
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  useEffect(() => {
    const on = (e: MessageEvent) => {
      if (e.origin !== window.location.origin || e.source !== frame.current?.contentWindow) return;
      if (e.data?.type === 'ks-ready') { setReady(true); frame.current?.contentWindow?.postMessage({ type: 'ks-focus', id: focusRef.current, instant: true }, window.location.origin); }
      if (e.data?.type === 'ks-click' && e.data.id) selRef.current?.(e.data.id);
    };
    window.addEventListener('message', on);
    return () => window.removeEventListener('message', on);
  }, []);

  useEffect(() => {
    if (ready) frame.current?.contentWindow?.postMessage({ type: 'ks-focus', id: focus, top: !focus }, window.location.origin);
  }, [focus, ready]);

  useEffect(() => { setReady(false); }, [path, device, nonce]);

  const vw = WIDTH[device];
  const k = size.w ? Math.min(1, size.w / vw) : 0;
  const src = `${BASE_PATH}${path}`;

  return (
    <div className={cx('a-site', className)}>
      {toolbar && (
        <div className="a-hb__bar">
          <div className="a-hb__dots"><i /><i /><i /></div>
          <div className="a-hb__url"><I name="lock" className="i--xs" />&nbsp;{path}</div>
          {onDevice && <Seg size="sm" value={device} onChange={onDevice} options={[{ value: 'desktop', label: '', icon: 'layout' }, { value: 'mobile', label: '', icon: 'phone' }]} />}
          <IconBtn icon="refresh" label="Обновить" size="sm" onClick={() => setNonce((n) => n + 1)} />
          <a className="a-icon-btn a-icon-btn--sm" href={`${src}${src.includes('?') ? '&' : '?'}preview=1`} target="_blank" rel="noopener noreferrer" aria-label="Открыть в новой вкладке" title="Открыть в новой вкладке"><I name="external" /></a>
        </div>
      )}
      <div ref={box} className={cx('a-site__view', device === 'mobile' && 'is-mobile')} style={{ height }}>
        {!ready && <div className="a-site__loading"><div className="a-spinner" /></div>}
        {k > 0 && (
          <iframe
            key={`${path}|${device}|${nonce}`}
            ref={frame}
            name="ks-preview"
            title="Предпросмотр сайта"
            src={src}
            style={{ width: vw, height: size.h / k, transform: `scale(${k})`, transformOrigin: 'top left', left: Math.max(0, (size.w - vw * k) / 2) }}
          />
        )}
      </div>
    </div>
  );
}

/** A storefront component rendered at a fixed design width and scaled to fit (cards, banners). */
export function Scaled({ width, children, label = 'Предпросмотр', className }: { width: number; children: ReactNode; label?: string; className?: string }) {
  const outer = useRef<HTMLDivElement>(null);
  const inner = useRef<HTMLDivElement>(null);
  const [k, setK] = useState(0);
  const [h, setH] = useState(0);
  useEffect(() => {
    const o = outer.current, i = inner.current;
    if (!o || !i) return;
    const ro = new ResizeObserver(() => { setK(Math.min(1, o.clientWidth / width)); setH(i.offsetHeight); });
    ro.observe(o);
    ro.observe(i);
    return () => ro.disconnect();
  }, [width]);
  return (
    <div ref={outer} className={cx('a-preview', className)} style={{ height: k ? h * k : undefined }}>
      {label && <span className="a-preview__label"><I name="eye" />{label}</span>}
      <div ref={inner} className="a-preview__stage" style={{ width, transform: `scale(${k || 0.0001})` }}>{children}</div>
    </div>
  );
}
