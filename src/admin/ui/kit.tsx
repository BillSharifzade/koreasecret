'use client';
import Link from 'next/link';
import { useEffect, useId, useRef, useState, type ButtonHTMLAttributes, type CSSProperties, type KeyboardEvent, type ReactNode } from 'react';
import { Butterfly } from '@/components/Brand';
import { I } from './icons';

const cx = (...c: (string | false | null | undefined)[]) => c.filter(Boolean).join(' ');
export { cx };

/* ---------- buttons ---------- */
type BtnVariant = 'primary' | 'dark' | 'white' | 'ghost' | 'outline' | 'danger' | 'soft';
interface BtnProps extends ButtonHTMLAttributes<HTMLButtonElement> { variant?: BtnVariant; size?: 'sm' | 'md' | 'lg'; icon?: string; iconRight?: string; loading?: boolean; block?: boolean }
export function Btn({ variant = 'soft', size = 'md', icon, iconRight, loading, block, className, children, type = 'button', ...rest }: BtnProps) {
  return (
    <button type={type} className={cx('a-btn', variant !== 'soft' && `a-btn--${variant}`, size !== 'md' && `a-btn--${size}`, block && 'a-btn--block', loading && 'is-loading', className)} {...rest}>
      {loading ? <I name="loader" /> : icon && <I name={icon} />}
      {children}
      {iconRight && <I name={iconRight} />}
    </button>
  );
}
export function LinkBtn({ href, variant = 'soft', size = 'md', icon, iconRight, children, className, external }: { href: string; variant?: BtnVariant; size?: 'sm' | 'md' | 'lg'; icon?: string; iconRight?: string; children: ReactNode; className?: string; external?: boolean }) {
  const cls = cx('a-btn', variant !== 'soft' && `a-btn--${variant}`, size !== 'md' && `a-btn--${size}`, className);
  const inner = <>{icon && <I name={icon} />}{children}{iconRight && <I name={iconRight} />}</>;
  return external ? <a className={cls} href={href} target="_blank" rel="noopener noreferrer">{inner}</a> : <Link className={cls} href={href}>{inner}</Link>;
}
export function IconBtn({ icon, label, onClick, danger, size, disabled, className, active }: { icon: string; label: string; onClick?: () => void; danger?: boolean; size?: 'sm'; disabled?: boolean; className?: string; active?: boolean }) {
  return (
    <button type="button" className={cx('a-icon-btn', size === 'sm' && 'a-icon-btn--sm', danger && 'is-danger', active && 'is-active', className)} onClick={onClick} aria-label={label} title={label} disabled={disabled}>
      <I name={icon} />
    </button>
  );
}

/* ---------- field shell ---------- */
export function Field({ label, hint, error, aside, children, className, htmlFor }: { label?: ReactNode; hint?: ReactNode; error?: ReactNode; aside?: ReactNode; children: ReactNode; className?: string; htmlFor?: string }) {
  return (
    <div className={cx('a-field', !!error && 'has-error', className)}>
      {(label || aside) && <label className="a-field__label" htmlFor={htmlFor}><span>{label}</span>{aside}</label>}
      {children}
      {error ? <div className="a-field__error">{error}</div> : hint ? <div className="a-field__hint">{hint}</div> : null}
    </div>
  );
}

/* ---------- inputs (controlled; onValue gets the plain value) ---------- */
interface InputProps { value: string; onValue: (v: string) => void; placeholder?: string; id?: string; className?: string; size?: 'sm' | 'lg' | 'title'; type?: string; maxLength?: number; autoFocus?: boolean; readOnly?: boolean; onBlur?: () => void; onKeyDown?: (e: KeyboardEvent<HTMLInputElement>) => void; list?: string; style?: CSSProperties; inputMode?: 'text' | 'numeric' | 'decimal' | 'url' | 'email' | 'tel' | 'search' }
export function Input({ value, onValue, size, className, ...rest }: InputProps) {
  return <input className={cx('a-input', size && `a-input--${size}`, className)} value={value ?? ''} onChange={(e) => onValue(e.target.value)} {...rest} />;
}

/** Commits on blur / Enter (ids and other values whose change rewrites references). */
export function LazyInput({ value, onCommit, validate, ...rest }: Omit<InputProps, 'onValue'> & { onCommit: (v: string) => void; validate?: (v: string) => string | null }) {
  const [v, setV] = useState(value);
  const [err, setErr] = useState<string | null>(null);
  useEffect(() => { setV(value); setErr(null); }, [value]);
  const commit = () => {
    if (v === value) return;
    const e = validate?.(v) ?? null;
    if (e) { setErr(e); return; }
    onCommit(v);
  };
  return (
    <>
      <Input {...rest} value={v} onValue={(x) => { setV(x); setErr(null); }} onBlur={commit} onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); commit(); } if (e.key === 'Escape') setV(value); }} />
      {err && <div className="a-field__error">{err}</div>}
    </>
  );
}

export function NumInput({ value, onValue, suffix, min, max, step = 1, placeholder, size, allowEmpty, id }: { value: number | undefined; onValue: (v: number | undefined) => void; suffix?: string; min?: number; max?: number; step?: number; placeholder?: string; size?: 'sm'; allowEmpty?: boolean; id?: string }) {
  const [text, setText] = useState(value === undefined || value === null || Number.isNaN(value) ? '' : String(value));
  const last = useRef(value);
  useEffect(() => { if (value !== last.current) { last.current = value; setText(value === undefined || Number.isNaN(value) ? '' : String(value)); } }, [value]);
  const push = (s: string) => {
    setText(s);
    const t = s.replace(',', '.').replace(/\s/g, '');
    if (t === '') { if (allowEmpty) { last.current = undefined; onValue(undefined); } return; }
    let n = Number(t);
    if (!Number.isFinite(n)) return;
    if (min !== undefined) n = Math.max(min, n);
    if (max !== undefined) n = Math.min(max, n);
    last.current = n;
    onValue(n);
  };
  const input = <input id={id} className={cx('a-input', size && `a-input--${size}`, 'adm-num')} inputMode={step < 1 ? 'decimal' : 'numeric'} value={text} placeholder={placeholder} onChange={(e) => push(e.target.value)} onBlur={() => setText(value === undefined || Number.isNaN(value) ? '' : String(value))}
    onKeyDown={(e) => { if (e.key === 'ArrowUp' || e.key === 'ArrowDown') { e.preventDefault(); const n = (value || 0) + (e.key === 'ArrowUp' ? step : -step) * (e.shiftKey ? 10 : 1); push(String(Math.round(n * 100) / 100)); } }} />;
  return suffix ? <div className="a-affix">{input}<span className="a-affix__suffix">{suffix}</span></div> : input;
}

export function TextArea({ value, onValue, rows = 4, placeholder, maxLength, autoGrow, id }: { value: string; onValue: (v: string) => void; rows?: number; placeholder?: string; maxLength?: number; autoGrow?: boolean; id?: string }) {
  const ref = useRef<HTMLTextAreaElement>(null);
  useEffect(() => {
    const el = ref.current;
    if (!autoGrow || !el) return;
    el.style.height = 'auto';
    el.style.height = `${Math.max(el.scrollHeight + 2, rows * 22)}px`;
  }, [value, autoGrow, rows]);
  return <textarea ref={ref} id={id} className="a-input" rows={rows} value={value ?? ''} placeholder={placeholder} maxLength={maxLength} onChange={(e) => onValue(e.target.value)} />;
}

export function Select<T extends string>({ value, onValue, options, size, id, placeholder }: { value: T; onValue: (v: T) => void; options: readonly (readonly [T, string])[]; size?: 'sm'; id?: string; placeholder?: string }) {
  return (
    <select id={id} className={cx('a-input', size && `a-input--${size}`)} value={value} onChange={(e) => onValue(e.target.value as T)}>
      {placeholder !== undefined && <option value="">{placeholder}</option>}
      {options.map(([v, l]) => <option key={v} value={v}>{l}</option>)}
    </select>
  );
}

export function Switch({ checked, onChange, label, hint, disabled }: { checked: boolean; onChange: (v: boolean) => void; label?: ReactNode; hint?: ReactNode; disabled?: boolean }) {
  return (
    <label className="a-switch" style={disabled ? { opacity: 0.5, pointerEvents: 'none' } : undefined}>
      <input type="checkbox" checked={checked} onChange={(e) => onChange(e.target.checked)} />
      <span className="a-switch__track" />
      {(label || hint) && <span className="a-switch__text">{label}{hint && <small>{hint}</small>}</span>}
    </label>
  );
}

export function Check({ checked, onChange, label, indeterminate, ariaLabel }: { checked: boolean; onChange: (v: boolean) => void; label?: ReactNode; indeterminate?: boolean; ariaLabel?: string }) {
  const ref = useRef<HTMLInputElement>(null);
  useEffect(() => { if (ref.current) ref.current.indeterminate = !!indeterminate; }, [indeterminate]);
  return (
    <label className="a-check" onClick={(e) => e.stopPropagation()}>
      <input ref={ref} type="checkbox" checked={checked} aria-label={ariaLabel} onChange={(e) => onChange(e.target.checked)} />
      <span className="a-check__box" />
      {label && <span>{label}</span>}
    </label>
  );
}

export function Seg<T extends string>({ value, onChange, options, size }: { value: T; onChange: (v: T) => void; options: { value: T; label: ReactNode; icon?: string; count?: number }[]; size?: 'sm' }) {
  return (
    <div className={cx('a-seg', size === 'sm' && 'a-seg--sm')} role="tablist">
      {options.map((o) => (
        <button key={o.value} type="button" role="tab" aria-selected={o.value === value} className={cx('a-seg__item', o.value === value && 'is-active')} onClick={() => onChange(o.value)}>
          {o.icon && <I name={o.icon} />}{o.label}{o.count !== undefined && <span className="a-seg__count">{o.count}</span>}
        </button>
      ))}
    </div>
  );
}

/** Toggle chips for a multi-choice list. */
export function Chips<T extends string>({ value, onChange, options, size }: { value: T[]; onChange: (v: T[]) => void; options: readonly (readonly [T, string])[]; size?: 'sm' }) {
  return (
    <div className="a-chips">
      {options.map(([v, l]) => {
        const on = value.includes(v);
        return <button key={v} type="button" className={cx('a-chip', size === 'sm' && 'a-chip--sm', on && 'is-active')} aria-pressed={on} onClick={() => onChange(on ? value.filter((x) => x !== v) : [...value, v])}>{on && <I name="check" />}{l}</button>;
      })}
    </div>
  );
}

/** Free-text list (cities, synonyms, search chips): Enter or comma adds, Backspace removes the last one. */
export function TagsInput({ value, onChange, placeholder }: { value: string[]; onChange: (v: string[]) => void; placeholder?: string }) {
  const [t, setT] = useState('');
  const ref = useRef<HTMLInputElement>(null);
  const add = () => { const x = t.trim(); if (x && !value.includes(x)) onChange([...value, x]); setT(''); };
  return (
    <div className="a-tags" onClick={() => ref.current?.focus()}>
      {value.map((v, i) => <span key={v + i} className="a-tag">{v}<button type="button" aria-label={`Убрать ${v}`} onClick={() => onChange(value.filter((_, k) => k !== i))}><I name="close" className="i--xs" /></button></span>)}
      <input ref={ref} value={t} placeholder={value.length ? '' : placeholder} onChange={(e) => setT(e.target.value)} onBlur={add}
        onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ',') { e.preventDefault(); add(); } else if (e.key === 'Backspace' && !t && value.length) onChange(value.slice(0, -1)); }} />
    </div>
  );
}

export const PASTELS = ['#fde3ee', '#fbd3e3', '#efe3ff', '#e5d3fb', '#e4f3e8', '#d9f0e2', '#ffe6dc', '#ffe3c7', '#d9e9f8', '#e1eefb', '#fbf1e6', '#f7c6d9'];
export const BRIGHTS = ['#dd4487', '#c8283e', '#f08a72', '#e9b949', '#6c9f5e', '#4f86c6', '#8a3d8c', '#b43f72', '#161215', '#ffffff'];

export function ColorInput({ value, onChange, palette, size }: { value: string; onChange: (v: string) => void; palette?: string[]; size?: 'sm' }) {
  const [t, setT] = useState(value || '');
  useEffect(() => setT(value || ''), [value]);
  const ok = (s: string) => /^#([0-9a-f]{3}|[0-9a-f]{6})$/i.test(s);
  return (
    <div className="a-stack a-stack--sm">
      <div className={cx('a-color', size === 'sm' && 'a-color--sm')}>
        <label className="a-color__swatch" aria-label="Выбрать цвет">
          <i style={{ background: ok(value) ? value : 'transparent' }} />
          <input type="color" value={ok(value) && value.length === 7 ? value : '#dd4487'} onChange={(e) => onChange(e.target.value)} />
        </label>
        <input className={cx('a-input', size === 'sm' && 'a-input--sm')} value={t} spellCheck={false} maxLength={7} onChange={(e) => { const v = e.target.value.trim(); setT(v); if (ok(v)) onChange(v.toLowerCase()); }} placeholder="#rrggbb" />
      </div>
      {palette && <div className="a-palette">{palette.map((c) => <button key={c} type="button" className={value?.toLowerCase() === c ? 'is-active' : ''} style={{ background: c }} aria-label={c} onClick={() => onChange(c)} />)}</div>}
    </div>
  );
}

/* ---------- display ---------- */
export function Badge({ tone, children, dot, icon }: { tone?: 'green' | 'amber' | 'red' | 'blue' | 'brand' | 'dark'; children: ReactNode; dot?: boolean; icon?: string }) {
  return <span className={cx('a-badge', tone && `a-badge--${tone}`, dot && 'a-badge--dot')}>{icon && <I name={icon} />}{children}</span>;
}

export function Card({ title, sub, actions, children, flush, soft, className, id }: { title?: ReactNode; sub?: ReactNode; actions?: ReactNode; children?: ReactNode; flush?: boolean; soft?: boolean; className?: string; id?: string }) {
  return (
    <section id={id} className={cx('a-card', flush && 'a-card--flush', soft && 'a-card--soft', className)}>
      {(title || actions) && <div className="a-card__head"><div className="a-card__title">{title}{sub && <small>{sub}</small>}</div>{actions && <div className="adm-row">{actions}</div>}</div>}
      {children}
    </section>
  );
}

export function PageHead({ title, sub, crumbs, actions }: { title: ReactNode; sub?: ReactNode; crumbs?: { label: string; href?: string }[]; actions?: ReactNode }) {
  return (
    <header className="adm-head">
      <div style={{ minWidth: 0 }}>
        {crumbs && <nav className="adm-head__crumbs">{crumbs.map((c, i) => <span key={i} className="adm-row" style={{ gap: 6 }}>{c.href ? <Link href={c.href}>{c.label}</Link> : <span>{c.label}</span>}{i < crumbs.length - 1 && <I name="chev-right" className="i--xs" />}</span>)}</nav>}
        <h1 className="adm-head__title">{title}</h1>
        {sub && <p className="adm-head__sub">{sub}</p>}
      </div>
      {actions && <div className="adm-head__actions">{actions}</div>}
    </header>
  );
}

export function Empty({ title, text, action, icon }: { title: string; text?: ReactNode; action?: ReactNode; icon?: string }) {
  return (
    <div className="a-empty">
      <div className="a-empty__art">{icon ? <I name={icon} size={64} /> : <Butterfly />}</div>
      <div className="a-empty__title">{title}</div>
      {text && <p>{text}</p>}
      {action}
    </div>
  );
}

export function Note({ kind, icon, children }: { kind?: 'warn' | 'error' | 'ok' | 'brand'; icon?: string; children: ReactNode }) {
  return <div className={cx('a-note', kind && `a-note--${kind}`)}><I name={icon || (kind === 'error' ? 'alert' : kind === 'warn' ? 'alert' : kind === 'ok' ? 'check-circle' : 'info')} /><div>{children}</div></div>;
}

export function Tabs<T extends string>({ value, onChange, items }: { value: T; onChange: (v: T) => void; items: { value: T; label: ReactNode; badge?: ReactNode }[] }) {
  return (
    <div className="a-tabs" role="tablist">
      {items.map((t) => <button key={t.value} type="button" role="tab" aria-selected={t.value === value} className={cx('a-tab', t.value === value && 'is-active')} onClick={() => onChange(t.value)}>{t.label}{t.badge}</button>)}
    </div>
  );
}

export const Kbd = ({ children }: { children: ReactNode }) => <kbd className="adm-kbd">{children}</kbd>;

/* ---------- dropdown menu ---------- */
export interface MenuItem { label?: string; icon?: string; onClick?: () => void; href?: string; danger?: boolean; sep?: boolean; heading?: string; disabled?: boolean }
export function Menu({ items, trigger, align = 'right', up }: { items: MenuItem[]; trigger?: (open: () => void, isOpen: boolean) => ReactNode; align?: 'left' | 'right'; up?: boolean }) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const id = useId();
  useEffect(() => {
    if (!open) return;
    const down = (e: MouseEvent) => { if (!ref.current?.contains(e.target as Node)) setOpen(false); };
    const key = (e: globalThis.KeyboardEvent) => { if (e.key === 'Escape') setOpen(false); };
    document.addEventListener('mousedown', down);
    document.addEventListener('keydown', key);
    return () => { document.removeEventListener('mousedown', down); document.removeEventListener('keydown', key); };
  }, [open]);
  return (
    <div className="a-menu-wrap" ref={ref}>
      {trigger ? trigger(() => setOpen((o) => !o), open) : <IconBtn icon="more" label="Действия" onClick={() => setOpen((o) => !o)} />}
      {open && (
        <div className={cx('a-menu', align === 'left' && 'a-menu--left', up && 'a-menu--up')} role="menu" id={id}>
          {items.map((it, i) => it.sep ? <div key={i} className="a-menu__sep" />
            : it.heading ? <div key={i} className="a-menu__label">{it.heading}</div>
            : it.href ? <Link key={i} className={cx('a-menu__item', it.danger && 'is-danger')} href={it.href} onClick={() => setOpen(false)}>{it.icon && <I name={it.icon} />}{it.label}</Link>
            : <button key={i} type="button" role="menuitem" disabled={it.disabled} className={cx('a-menu__item', it.danger && 'is-danger')} style={it.disabled ? { opacity: 0.4 } : undefined} onClick={() => { setOpen(false); it.onClick?.(); }}>{it.icon && <I name={it.icon} />}{it.label}</button>)}
        </div>
      )}
    </div>
  );
}

/* ---------- formatting ---------- */
export const money = (n: number, cur = 'смн') => `${String(Math.round(n)).replace(/\B(?=(\d{3})+(?!\d))/g, ' ')} ${cur}`;
export const num = (n: number, d = 0) => (Math.round(n * 10 ** d) / 10 ** d).toLocaleString('ru-RU', { minimumFractionDigits: d, maximumFractionDigits: d });
export const ago = (t: number | string | null | undefined) => {
  if (!t) return '';
  const s = (Date.now() - new Date(t).getTime()) / 1000;
  if (s < 10) return 'только что';
  if (s < 60) return `${Math.round(s)} сек назад`;
  if (s < 3600) return `${Math.round(s / 60)} мин назад`;
  if (s < 86400) return `${Math.round(s / 3600)} ч назад`;
  if (s < 86400 * 7) return `${Math.round(s / 86400)} дн назад`;
  return new Date(t).toLocaleDateString('ru-RU', { day: 'numeric', month: 'short', year: 'numeric' });
};
export const dt = (t: string | number | Date, withTime = true) => new Date(t).toLocaleString('ru-RU', { day: 'numeric', month: 'short', ...(withTime ? { hour: '2-digit', minute: '2-digit' } : { year: 'numeric' }) });
