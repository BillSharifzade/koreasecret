'use client';
import { useEffect, useRef, useState, type KeyboardEvent, type ReactNode } from 'react';
import { I } from './icons';
import { Card, cx, Seg } from './kit';

/*
 * Charts drawn by hand in SVG, following one method everywhere:
 *  - one series → the brand colour; a comparison period → muted grey (emphasis, never a second hue);
 *  - categorical slots in a fixed, validated order (CVD-checked: worst adjacent ΔE 9.1); yellow and aqua sit below
 *    3:1 on white, so every multi-series chart carries a legend, direct values and a table view;
 *  - 2px lines with a ~10% area wash, bars ≤24px with a 4px rounded data end and 2px gaps, solid hairline grid;
 *  - a crosshair + tooltip on time series, a tooltip per bar / cell; values lead in the tooltip;
 *  - every chart card can switch to a table (the same numbers without hovering).
 */
export const SERIES = ['#dd4487', '#2a78d6', '#eda100', '#1baf7a', '#4a3aa7', '#eb6834'];
export const MUTED = '#bdb6c1';
const GRID = '#efe9f1';
const AXIS = '#ddd6e0';
/** sequential ramp of the brand hue, light → dark (heatmaps) */
export const RAMP = ['#fdf2f7', '#fadbe8', '#f6bcd5', '#ef93bb', '#e566a0', '#d23f84', '#ab2c68', '#7d1f4b'];

export const compact = (n: number) => new Intl.NumberFormat('ru-RU', { notation: 'compact', maximumFractionDigits: n >= 1e6 ? 1 : 0 }).format(n);
const fmtInt = (n: number) => Math.round(n).toLocaleString('ru-RU');

function niceScale(max: number, ticks = 4) {
  if (max <= 0) return { max: 1, step: 0.25 };
  const raw = max / ticks;
  const p = Math.pow(10, Math.floor(Math.log10(raw)));
  const step = [1, 2, 2.5, 5, 10].map((m) => m * p).find((s) => s >= raw) || 10 * p;
  return { max: Math.ceil(max / step) * step, step };
}

function useWidth<T extends HTMLElement>() {
  const ref = useRef<T>(null);
  const [w, setW] = useState(0);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const ro = new ResizeObserver(() => setW(el.clientWidth));
    ro.observe(el);
    setW(el.clientWidth);
    return () => ro.disconnect();
  }, []);
  return [ref, w] as const;
}

/* ---------- tooltip ---------- */
interface TipRow { label: string; value: string; color?: string; dashed?: boolean }
function Tip({ x, y, title, rows, width }: { x: number; y: number; title: string; rows: TipRow[]; width: number }) {
  const left = Math.max(80, Math.min(width - 80, x));
  return (
    <div className="a-chart__tip" style={{ left, top: y }} role="status">
      <b>{title}</b>
      {rows.map((r, i) => (
        <div key={i} className="a-chart__tip-row">
          <span><i style={{ background: r.color || 'transparent', height: 3, width: 12, borderRadius: 2, verticalAlign: 3, opacity: r.dashed ? 0.6 : 1 }} />{r.label}</span>
          <span>{r.value}</span>
        </div>
      ))}
    </div>
  );
}

export function Legend({ items }: { items: { label: string; color: string; line?: boolean }[] }) {
  return <div className="a-legend">{items.map((x) => <span key={x.label}><i style={{ background: x.color, ...(x.line ? { height: 3, width: 14, borderRadius: 2 } : null) }} />{x.label}</span>)}</div>;
}

/* ---------- time series (line / area) ---------- */
export interface TrendPoint { label: string; long: string; values: number[] }
export interface TrendSeries { label: string; color: string; area?: boolean; muted?: boolean }

/** `partialLast`: the last point is a period still in progress (today) — its segment is dashed. */
export function TrendChart({ points, series, height = 260, fmt = fmtInt, fmtAxis = compact, partialLast }: { points: TrendPoint[]; series: TrendSeries[]; height?: number; fmt?: (n: number) => string; fmtAxis?: (n: number) => string; partialLast?: boolean }) {
  const [box, w] = useWidth<HTMLDivElement>();
  const [hover, setHover] = useState<number | null>(null);
  const max = Math.max(0, ...points.flatMap((p) => p.values));
  const { max: top, step } = niceScale(max);
  const ticks = Array.from({ length: Math.round(top / step) + 1 }, (_, i) => i * step);
  const left = Math.max(34, Math.max(...ticks.map((t) => fmtAxis(t).length)) * 7 + 12);
  const right = 12, topPad = 10, bottom = 28;
  const iw = Math.max(1, w - left - right), ih = height - topPad - bottom;
  const n = points.length;
  const X = (i: number) => left + (n <= 1 ? iw / 2 : (i / (n - 1)) * iw);
  const Y = (v: number) => topPad + ih - (v / top) * ih;
  const every = Math.max(1, Math.ceil(n / Math.max(2, Math.floor(iw / 78))));

  const pick = (clientX: number) => {
    const rect = box.current!.getBoundingClientRect();
    const x = clientX - rect.left - left;
    setHover(Math.max(0, Math.min(n - 1, Math.round(n <= 1 ? 0 : (x / iw) * (n - 1)))));
  };
  const onKey = (e: KeyboardEvent) => {
    if (e.key === 'ArrowRight') { e.preventDefault(); setHover((h) => Math.min(n - 1, (h ?? -1) + 1)); }
    if (e.key === 'ArrowLeft') { e.preventDefault(); setHover((h) => Math.max(0, (h ?? n) - 1)); }
    if (e.key === 'Escape') setHover(null);
  };

  return (
    <div ref={box} className="a-chart" style={{ height }}>
      {w > 0 && (
        <svg width={w} height={height} tabIndex={0} role="img" aria-label="График; стрелки влево и вправо показывают значения"
          onPointerMove={(e) => pick(e.clientX)} onPointerDown={(e) => pick(e.clientX)} onPointerLeave={() => setHover(null)} onKeyDown={onKey} onBlur={() => setHover(null)}>
          <g className="a-chart__grid">
            {ticks.map((t) => <g key={t}><line x1={left} x2={w - right} y1={Y(t)} y2={Y(t)} stroke={t === 0 ? AXIS : GRID} /><text x={left - 8} y={Y(t) + 4} textAnchor="end">{fmtAxis(t)}</text></g>)}
          </g>
          {points.map((p, i) => (i % every === 0 || i === n - 1) && (n < 3 || i !== n - 1 || (n - 1) % every >= every / 2 || i % every === 0) ? <text key={i} x={X(i)} y={height - 8} textAnchor={i === 0 && n > 1 ? 'start' : i === n - 1 && n > 1 ? 'end' : 'middle'}>{p.label}</text> : null)}
          {series.map((s, si) => {
            const pt = (i: number) => `${X(i).toFixed(1)},${Y(points[i].values[si] ?? 0).toFixed(1)}`;
            const cut = partialLast && !s.muted && n > 2 ? n - 1 : n;
            const d = points.slice(0, cut).map((_, i) => `${i ? 'L' : 'M'}${pt(i)}`).join('');
            return (
              <g key={si}>
                {s.area && cut > 1 && <path d={`${d}L${X(cut - 1).toFixed(1)},${Y(0)}L${X(0).toFixed(1)},${Y(0)}Z`} fill={s.color} opacity={0.1} />}
                <path d={d} fill="none" stroke={s.color} strokeWidth={2} strokeLinejoin="round" strokeLinecap="round" opacity={s.muted ? 0.9 : 1} />
                {cut < n && <path d={`M${pt(n - 2)}L${pt(n - 1)}`} fill="none" stroke={s.color} strokeWidth={2} strokeLinecap="round" strokeDasharray="2 5" />}
              </g>
            );
          })}
          {n > 0 && hover === null && <circle cx={X(n - 1)} cy={Y(points[n - 1].values[0] ?? 0)} r={4} fill={series[0].color} stroke="#fff" strokeWidth={2} />}
          {hover !== null && points[hover] && (
            <g pointerEvents="none">
              <line x1={X(hover)} x2={X(hover)} y1={topPad} y2={topPad + ih} stroke={AXIS} />
              {series.map((s, si) => <circle key={si} cx={X(hover)} cy={Y(points[hover].values[si] ?? 0)} r={4} fill={s.color} stroke="#fff" strokeWidth={2} />)}
            </g>
          )}
        </svg>
      )}
      {hover !== null && points[hover] && w > 0 && (
        <Tip x={X(hover)} y={Math.min(...series.map((_, si) => Y(points[hover].values[si] ?? 0)))} width={w} title={points[hover].long + (partialLast && hover === n - 1 ? ' · ещё идёт' : '')}
          rows={series.map((s, si) => ({ label: s.label, value: fmt(points[hover].values[si] ?? 0), color: s.color, dashed: s.muted }))} />
      )}
    </div>
  );
}

/* ---------- columns (one series over time) ---------- */
export function ColumnChart({ points, color = SERIES[0], height = 220, fmt = fmtInt, fmtAxis = compact, unit = '' }: { points: { label: string; long: string; value: number }[]; color?: string; height?: number; fmt?: (n: number) => string; fmtAxis?: (n: number) => string; unit?: string }) {
  const [box, w] = useWidth<HTMLDivElement>();
  const [hover, setHover] = useState<number | null>(null);
  const { max: top, step } = niceScale(Math.max(0, ...points.map((p) => p.value)));
  const ticks = Array.from({ length: Math.round(top / step) + 1 }, (_, i) => i * step);
  const left = Math.max(30, Math.max(...ticks.map((t) => fmtAxis(t).length)) * 7 + 12);
  const right = 8, topPad = 10, bottom = 28;
  const iw = Math.max(1, w - left - right), ih = height - topPad - bottom;
  const n = Math.max(1, points.length);
  const slot = iw / n;
  const bw = Math.max(2, Math.min(24, slot - 2));
  const Y = (v: number) => topPad + ih - (v / top) * ih;
  const every = Math.max(1, Math.ceil(n / Math.max(2, Math.floor(iw / 70))));
  const bar = (x: number, y: number, bw2: number, h: number) => {
    const r = Math.min(4, bw2 / 2, h);
    return `M${x},${y + h}V${y + r}Q${x},${y} ${x + r},${y}H${x + bw2 - r}Q${x + bw2},${y} ${x + bw2},${y + r}V${y + h}Z`;
  };
  return (
    <div ref={box} className="a-chart" style={{ height }} onPointerLeave={() => setHover(null)}>
      {w > 0 && (
        <svg width={w} height={height} role="img" aria-label="Столбчатая диаграмма">
          <g className="a-chart__grid">{ticks.map((t) => <g key={t}><line x1={left} x2={w - right} y1={Y(t)} y2={Y(t)} stroke={t === 0 ? AXIS : GRID} /><text x={left - 8} y={Y(t) + 4} textAnchor="end">{fmtAxis(t)}</text></g>)}</g>
          {points.map((p, i) => {
            const x = left + i * slot + (slot - bw) / 2;
            const h = Math.max(0, Y(0) - Y(p.value));
            return (
              <g key={i} onPointerEnter={() => setHover(i)} onFocus={() => setHover(i)} onBlur={() => setHover(null)} tabIndex={0} aria-label={`${p.long}: ${fmt(p.value)}${unit}`}>
                <rect x={left + i * slot} y={topPad} width={slot} height={ih} fill="transparent" />
                {h > 0 && <path d={bar(x, Y(p.value), bw, h)} fill={color} opacity={hover === null || hover === i ? 1 : 0.45} />}
                {(i % every === 0) && <text x={left + i * slot + slot / 2} y={height - 8} textAnchor="middle">{p.label}</text>}
              </g>
            );
          })}
        </svg>
      )}
      {hover !== null && points[hover] && <Tip x={left + hover * slot + slot / 2} y={Y(points[hover].value)} width={w} title={points[hover].long} rows={[{ label: unit || 'Значение', value: fmt(points[hover].value), color }]} />}
    </div>
  );
}

/* ---------- ranking bars ---------- */
export function BarList({ items, fmt = fmtInt, color = SERIES[0], max: maxN, empty = 'Нет данных' }: { items: { key: string; label: ReactNode; sub?: ReactNode; value: number; note?: ReactNode; href?: string }[]; fmt?: (n: number) => string; color?: string; max?: number; empty?: string }) {
  const list = maxN ? items.slice(0, maxN) : items;
  const top = Math.max(1, ...list.map((x) => x.value));
  if (!list.length) return <div className="adm-muted" style={{ padding: '24px 0', textAlign: 'center' }}>{empty}</div>;
  return (
    <div className="a-bars">
      {list.map((x, i) => (
        <div key={x.key} className="a-bar" title={`${typeof x.label === 'string' ? x.label : ''}: ${fmt(x.value)}`}>
          <span className="a-bar__label"><span className="adm-muted adm-num" style={{ display: 'inline-block', width: 22 }}>{i + 1}</span>{x.label}{x.sub && <span className="adm-muted"> · {x.sub}</span>}</span>
          <span className="a-bar__value">{fmt(x.value)}{x.note && <span className="adm-muted" style={{ fontWeight: 400, marginLeft: 6 }}>{x.note}</span>}</span>
          <span className="a-bar__track"><span className="a-bar__fill" style={{ width: `${(x.value / top) * 100}%`, background: color, animationDelay: `${i * 40}ms` }} /></span>
        </div>
      ))}
    </div>
  );
}

/* ---------- part-to-whole ---------- */
export function StackBar({ parts, fmt = fmtInt }: { parts: { key: string; label: string; value: number; color?: string }[]; fmt?: (n: number) => string }) {
  const total = parts.reduce((s, p) => s + p.value, 0) || 1;
  const [hover, setHover] = useState<string | null>(null);
  return (
    <div className="a-stack a-stack--sm">
      <div className="a-stackbar" role="img" aria-label={parts.map((p) => `${p.label} ${Math.round((p.value / total) * 100)}%`).join(', ')}>
        {parts.filter((p) => p.value > 0).map((p, i) => (
          <span key={p.key} style={{ flexGrow: p.value, background: p.color || SERIES[i % SERIES.length], opacity: hover && hover !== p.key ? 0.4 : 1 }} onPointerEnter={() => setHover(p.key)} onPointerLeave={() => setHover(null)} title={`${p.label}: ${fmt(p.value)} (${Math.round((p.value / total) * 100)}%)`} />
        ))}
      </div>
      <div className="a-stackbar__legend">
        {parts.map((p, i) => (
          <div key={p.key} className={cx('a-stackbar__row', hover === p.key && 'is-hover')} onPointerEnter={() => setHover(p.key)} onPointerLeave={() => setHover(null)}>
            <i style={{ background: p.color || SERIES[i % SERIES.length] }} />
            <span className="adm-grow adm-ellipsis">{p.label}</span>
            <b className="adm-num">{fmt(p.value)}</b>
            <span className="adm-muted adm-num" style={{ width: 44, textAlign: 'right' }}>{Math.round((p.value / total) * 100)}%</span>
          </div>
        ))}
      </div>
    </div>
  );
}

/* ---------- weekday × hour heatmap ---------- */
const WD = ['Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб', 'Вс'];
export function Heatmap({ grid, unit = 'заказов' }: { grid: number[][]; unit?: string }) {
  const max = Math.max(1, ...grid.flat());
  const [hover, setHover] = useState<[number, number] | null>(null);
  const color = (v: number) => (v <= 0 ? '#f7f3f8' : RAMP[Math.min(RAMP.length - 1, Math.floor((v / max) * (RAMP.length - 0.001)))]);
  return (
    <div className="a-heat">
      <div className="a-heat__grid">
        <span />
        {Array.from({ length: 24 }, (_, h) => <span key={h} className="a-heat__h">{h % 3 === 0 ? h : ''}</span>)}
        {grid.map((row, d) => (
          <div key={d} style={{ display: 'contents' }}>
            <span className="a-heat__d">{WD[d]}</span>
            {row.map((v, h) => (
              <span key={h} className={cx('a-heat__cell', hover?.[0] === d && hover?.[1] === h && 'is-hover')} style={{ background: color(v) }} tabIndex={0}
                aria-label={`${WD[d]}, ${h}:00–${h + 1}:00 — ${v} ${unit}`} onPointerEnter={() => setHover([d, h])} onFocus={() => setHover([d, h])} onPointerLeave={() => setHover(null)} onBlur={() => setHover(null)} />
            ))}
          </div>
        ))}
      </div>
      <div className="adm-row adm-row--between" style={{ marginTop: 10, fontSize: 12.5 }}>
        <span className="adm-muted">{hover ? <><b style={{ color: 'var(--ink)' }}>{grid[hover[0]][hover[1]]} {unit}</b> · {WD[hover[0]]}, {hover[1]}:00–{hover[1] + 1}:00</> : 'Наведите на клетку'}</span>
        <span className="a-heat__scale"><span>0</span>{RAMP.map((c) => <i key={c} style={{ background: c }} />)}<span>{max}</span></span>
      </div>
    </div>
  );
}

/* ---------- sparkline ---------- */
export function Sparkline({ values, color = SERIES[0], className = 'a-kpi__spark' }: { values: number[]; color?: string; className?: string }) {
  if (values.length < 2) return null;
  const w = 96, h = 34, max = Math.max(...values), min = Math.min(...values), span = max - min || 1;
  const pts = values.map((v, i) => [(i / (values.length - 1)) * (w - 4) + 2, h - 3 - ((v - min) / span) * (h - 6)]);
  const d = pts.map(([x, y], i) => `${i ? 'L' : 'M'}${x.toFixed(1)},${y.toFixed(1)}`).join('');
  return (
    <svg className={className} viewBox={`0 0 ${w} ${h}`} aria-hidden="true">
      <path d={`${d}L${w - 2},${h}L2,${h}Z`} fill={color} opacity={0.1} />
      <path d={d} fill="none" stroke={color} strokeWidth={1.75} strokeLinecap="round" strokeLinejoin="round" />
      <circle cx={pts[pts.length - 1][0]} cy={pts[pts.length - 1][1]} r={2.5} fill={color} />
    </svg>
  );
}

/* ---------- stat tile ---------- */
export function Kpi({ label, value, unit, delta, deltaGood = 'up', foot, spark, icon }: { label: string; value: string; unit?: string; delta?: number | null; deltaGood?: 'up' | 'down'; foot?: ReactNode; spark?: number[]; icon?: string }) {
  const dir = delta === null || delta === undefined || Math.abs(delta) < 0.5 ? 'flat' : delta > 0 ? 'up' : 'down';
  const good = dir === 'flat' ? 'flat' : (dir === deltaGood ? 'up' : 'down');
  return (
    <div className="a-kpi">
      <div className="a-kpi__label">{icon && <span className="a-kpi__icon"><I name={icon} /></span>}{label}</div>
      <div className="a-kpi__value">{value}{unit && <small>{unit}</small>}</div>
      <div className="a-kpi__foot">
        {delta !== undefined && delta !== null && <span className={`a-delta is-${good}`}>{dir === 'up' ? '↑' : dir === 'down' ? '↓' : '→'} {Math.abs(delta).toFixed(Math.abs(delta) < 10 ? 1 : 0)}%</span>}
        {foot}
      </div>
      {spark && <Sparkline values={spark} />}
    </div>
  );
}

/* ---------- a card with a chart ⇄ table switch ---------- */
export function ChartCard({ title, sub, actions, chart, table, className }: { title: ReactNode; sub?: ReactNode; actions?: ReactNode; chart: ReactNode; table?: { columns: string[]; rows: (string | number)[][]; num?: number[] }; className?: string }) {
  const [mode, setMode] = useState<'chart' | 'table'>('chart');
  return (
    <Card title={title} sub={sub} className={className} actions={<>{actions}{table && <Seg size="sm" value={mode} onChange={setMode} options={[{ value: 'chart', label: '', icon: 'chart' }, { value: 'table', label: '', icon: 'table' }]} />}</>}>
      {mode === 'chart' || !table ? chart : (
        <div className="a-table-wrap" style={{ maxHeight: 360 }}>
          <table className="a-table a-table--compact">
            <thead><tr>{table.columns.map((c, i) => <th key={i} className={table.num?.includes(i) ? 'is-num' : undefined}>{c}</th>)}</tr></thead>
            <tbody>{table.rows.map((r, k) => <tr key={k}>{r.map((v, i) => <td key={i} className={table.num?.includes(i) ? 'is-num' : undefined}>{typeof v === 'number' ? fmtInt(v) : v}</td>)}</tr>)}</tbody>
          </table>
        </div>
      )}
    </Card>
  );
}
