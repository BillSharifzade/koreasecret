'use client';
import { useRef, useState } from 'react';
import { THEMES } from '@/lib/art';
import { mdBlocks } from '@/lib/md';
import type { Theme } from '@/lib/types';
import { I } from './icons';
import { cx, IconBtn, Seg } from './kit';

export const THEME_NAMES: Record<Theme, string> = { pink: 'Розовая', peach: 'Персик', mint: 'Мята', lilac: 'Лаванда', rose: 'Пудра', cream: 'Сливки', blue: 'Небо', plum: 'Слива' };

/** The scene palettes of art.ts (promo cards, collections, menu promos). */
export function ThemePicker({ value, onChange }: { value: Theme; onChange: (t: Theme) => void }) {
  return (
    <div className="a-themes">
      {(Object.keys(THEME_NAMES) as Theme[]).map((t) => {
        const [a, b, c] = THEMES[t];
        return (
          <button key={t} type="button" className={cx('a-theme', value === t && 'is-active')} onClick={() => onChange(t)} title={THEME_NAMES[t]}>
            <i style={{ background: `linear-gradient(135deg, ${a}, ${b} 55%, ${c})` }} />
            <span>{THEME_NAMES[t]}</span>
          </button>
        );
      })}
    </div>
  );
}

/** Light markdown with a toolbar and a preview (the same renderer the site uses). */
export function MarkdownField({ value, onChange, rows = 10, heading = true }: { value: string; onChange: (v: string) => void; rows?: number; heading?: boolean }) {
  const ref = useRef<HTMLTextAreaElement>(null);
  const [mode, setMode] = useState<'edit' | 'preview'>('edit');
  const wrap = (before: string, after = before, placeholder = 'текст') => {
    const el = ref.current;
    if (!el) return;
    const { selectionStart: a, selectionEnd: b } = el;
    const sel = value.slice(a, b) || placeholder;
    const next = value.slice(0, a) + before + sel + after + value.slice(b);
    onChange(next);
    requestAnimationFrame(() => { el.focus(); el.setSelectionRange(a + before.length, a + before.length + sel.length); });
  };
  const line = (prefix: string) => {
    const el = ref.current;
    if (!el) return;
    const a = value.lastIndexOf('\n', el.selectionStart - 1) + 1;
    const next = value.slice(0, a) + prefix + value.slice(a);
    onChange(next);
    requestAnimationFrame(() => { el.focus(); el.setSelectionRange(el.selectionStart + prefix.length, el.selectionStart + prefix.length); });
  };
  const words = value.trim() ? value.trim().split(/\s+/).length : 0;
  return (
    <div className="a-md">
      <div className="a-md__bar">
        {mode === 'edit' && <>
          <IconBtn size="sm" icon="type" label="Жирный (**текст**)" onClick={() => wrap('**')} />
          <button type="button" className="a-icon-btn a-icon-btn--sm" title="Курсив (*текст*)" aria-label="Курсив" onClick={() => wrap('*')}><i style={{ fontFamily: 'var(--serif)', fontSize: 16 }}>I</i></button>
          <IconBtn size="sm" icon="link" label="Ссылка" onClick={() => wrap('[', '](https://)', 'текст ссылки')} />
          {heading && <button type="button" className="a-icon-btn a-icon-btn--sm" title="Подзаголовок (## )" aria-label="Подзаголовок" onClick={() => line('## ')}><b style={{ fontSize: 13 }}>H</b></button>}
          <IconBtn size="sm" icon="list" label="Список (- )" onClick={() => line('- ')} />
        </>}
        <span className="adm-grow" />
        <span className="a-counter">{words} слов · ~{Math.max(1, Math.round(words / 180))} мин</span>
        <Seg size="sm" value={mode} onChange={setMode} options={[{ value: 'edit', label: 'Текст' }, { value: 'preview', label: 'Просмотр', icon: 'eye' }]} />
      </div>
      {mode === 'edit'
        ? <textarea ref={ref} className="a-input a-md__input" rows={rows} value={value} onChange={(e) => onChange(e.target.value)} placeholder="Абзацы разделяйте пустой строкой. **жирный**, *курсив*, [ссылка](https://…), ## подзаголовок, - список" />
        : <div className="a-md__preview article" dangerouslySetInnerHTML={{ __html: mdBlocks(value) || '<p class="adm-muted">Пусто</p>' }} />}
      <div className="a-field__hint"><I name="info" className="i--xs" /> Пустая строка — новый абзац. Разметка безопасна: HTML-теги не выполняются.</div>
    </div>
  );
}
