import { strFromU8, strToU8, unzipSync, zipSync } from 'fflate';

/* Spreadsheets without a heavy library: XLSX is a zip of a few XML files (fflate zips), CSV is text.
   Exports get a styled header row, number formats, column widths, a frozen header and filters — they open
   cleanly in Excel, Numbers and Google Sheets. */

export type ColType = 'text' | 'int' | 'money' | 'num' | 'pct' | 'date' | 'datetime';
export interface SheetCol { key: string; label: string; type?: ColType; width?: number }
export interface SheetData { name: string; columns: SheetCol[]; rows: Record<string, unknown>[]; totals?: Record<string, unknown>; title?: string }

const xmlEsc = (s: string) => s.replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c] as string)).replace(/[\u0000-\u0008\u000b\u000c\u000e-\u001f]/g, '');
const colName = (i: number) => { let s = ''; i++; while (i > 0) { const m = (i - 1) % 26; s = String.fromCharCode(65 + m) + s; i = Math.floor((i - 1) / 26); } return s; };
// Excel serial date (days since 1899-12-30), in local time
const serial = (d: Date) => (d.getTime() - d.getTimezoneOffset() * 60000) / 864e5 + 25569;
const STYLE: Record<ColType, number> = { text: 0, int: 2, money: 2, num: 3, pct: 5, date: 4, datetime: 6 };

function sheetXml(sh: SheetData) {
  const cols = sh.columns;
  const widths = cols.map((c) => c.width ?? Math.min(48, Math.max(c.label.length + 2, ...sh.rows.slice(0, 200).map((r) => String(r[c.key] ?? '').length + 1), 8)));
  const cell = (ref: string, v: unknown, type: ColType, style?: number) => {
    if (v === null || v === undefined || v === '') return '';
    if (type === 'date' || type === 'datetime') {
      const m = typeof v === 'string' ? v.match(/^(\d{4})-(\d{2})-(\d{2})$/) : null;
      const d = v instanceof Date ? v : m ? new Date(+m[1], +m[2] - 1, +m[3]) : new Date(String(v));
      if (!Number.isNaN(d.getTime())) return `<c r="${ref}" s="${style ?? STYLE[type]}"><v>${serial(d)}</v></c>`;
    }
    if (type !== 'text' && typeof v === 'number' && Number.isFinite(v)) return `<c r="${ref}" s="${style ?? STYLE[type]}"><v>${type === 'pct' ? v / 100 : v}</v></c>`;
    return `<c r="${ref}" t="inlineStr" s="${style ?? 0}"><is><t xml:space="preserve">${xmlEsc(String(v))}</t></is></c>`;
  };
  let rows = '';
  let r = 1;
  if (sh.title) { rows += `<row r="1">${cell('A1', sh.title, 'text', 7)}</row>`; r = 3; }
  rows += `<row r="${r}">${cols.map((c, i) => cell(`${colName(i)}${r}`, c.label, 'text', 1)).join('')}</row>`;
  const first = r;
  for (const row of sh.rows) { r++; rows += `<row r="${r}">${cols.map((c, i) => cell(`${colName(i)}${r}`, row[c.key], c.type || 'text')).join('')}</row>`; }
  if (sh.totals) { r++; rows += `<row r="${r}">${cols.map((c, i) => cell(`${colName(i)}${r}`, sh.totals![c.key], c.type || 'text', c.type && c.type !== 'text' ? 8 : 9)).join('')}</row>`; }
  const last = colName(cols.length - 1);
  return `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<worksheet xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main"><sheetViews><sheetView workbookViewId="0"><pane ySplit="${first}" topLeftCell="A${first + 1}" activePane="bottomLeft" state="frozen"/></sheetView></sheetViews><cols>${widths.map((w, i) => `<col min="${i + 1}" max="${i + 1}" width="${w}" customWidth="1"/>`).join('')}</cols><sheetData>${rows}</sheetData>${sh.rows.length ? `<autoFilter ref="A${first}:${last}${first + sh.rows.length}"/>` : ''}</worksheet>`;
}

const STYLES = `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<styleSheet xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main">
<numFmts count="3"><numFmt numFmtId="164" formatCode="dd.mm.yyyy"/><numFmt numFmtId="165" formatCode="dd.mm.yyyy hh:mm"/><numFmt numFmtId="166" formatCode="#,##0.0"/></numFmts>
<fonts count="3"><font><sz val="11"/><name val="Calibri"/></font><font><b/><sz val="11"/><color rgb="FF161215"/><name val="Calibri"/></font><font><b/><sz val="14"/><color rgb="FFDD4487"/><name val="Calibri"/></font></fonts>
<fills count="3"><fill><patternFill patternType="none"/></fill><fill><patternFill patternType="gray125"/></fill><fill><patternFill patternType="solid"><fgColor rgb="FFFCE9F2"/></patternFill></fill></fills>
<borders count="2"><border/><border><top style="thin"><color rgb="FFDD4487"/></top></border></borders>
<cellStyleXfs count="1"><xf/></cellStyleXfs>
<cellXfs count="10">
<xf/>
<xf fontId="1" fillId="2" applyFont="1" applyFill="1"/>
<xf numFmtId="3" applyNumberFormat="1"/>
<xf numFmtId="166" applyNumberFormat="1"/>
<xf numFmtId="164" applyNumberFormat="1"/>
<xf numFmtId="9" applyNumberFormat="1"/>
<xf numFmtId="165" applyNumberFormat="1"/>
<xf fontId="2" applyFont="1"/>
<xf numFmtId="3" fontId="1" borderId="1" applyNumberFormat="1" applyFont="1" applyBorder="1"/>
<xf fontId="1" borderId="1" applyFont="1" applyBorder="1"/>
</cellXfs><cellStyles count="1"><cellStyle name="Normal" xfId="0" builtinId="0"/></cellStyles></styleSheet>`;

export function writeXlsx(sheets: SheetData[]): Blob {
  const safe = sheets.map((s, i) => ({ ...s, name: (s.name.replace(/[\\/?*[\]:]/g, ' ').slice(0, 31) || `Лист ${i + 1}`) }));
  const files: Record<string, Uint8Array> = {
    '[Content_Types].xml': strToU8(`<?xml version="1.0" encoding="UTF-8" standalone="yes"?><Types xmlns="http://schemas.openxmlformats.org/package/2006/content-types"><Default Extension="rels" ContentType="application/vnd.openxmlformats-package.relationships+xml"/><Default Extension="xml" ContentType="application/xml"/><Override PartName="/xl/workbook.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet.main+xml"/><Override PartName="/xl/styles.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.styles+xml"/>${safe.map((_, i) => `<Override PartName="/xl/worksheets/sheet${i + 1}.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.worksheet+xml"/>`).join('')}</Types>`),
    '_rels/.rels': strToU8(`<?xml version="1.0" encoding="UTF-8" standalone="yes"?><Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships"><Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/officeDocument" Target="xl/workbook.xml"/></Relationships>`),
    'xl/workbook.xml': strToU8(`<?xml version="1.0" encoding="UTF-8" standalone="yes"?><workbook xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main" xmlns:r="http://schemas.openxmlformats.org/officeDocument/2006/relationships"><sheets>${safe.map((s, i) => `<sheet name="${xmlEsc(s.name)}" sheetId="${i + 1}" r:id="rId${i + 1}"/>`).join('')}</sheets></workbook>`),
    'xl/_rels/workbook.xml.rels': strToU8(`<?xml version="1.0" encoding="UTF-8" standalone="yes"?><Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">${safe.map((_, i) => `<Relationship Id="rId${i + 1}" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/worksheet" Target="worksheets/sheet${i + 1}.xml"/>`).join('')}<Relationship Id="rId${safe.length + 1}" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/styles" Target="styles.xml"/></Relationships>`),
    'xl/styles.xml': strToU8(STYLES)
  };
  safe.forEach((s, i) => { files[`xl/worksheets/sheet${i + 1}.xml`] = strToU8(sheetXml(s)); });
  const zipped = zipSync(files, { level: 6 });
  return new Blob([zipped.buffer as ArrayBuffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
}

/** First sheet of an .xlsx as rows of strings. */
export function readXlsx(buf: ArrayBuffer): string[][] {
  const files = unzipSync(new Uint8Array(buf));
  const parse = (path: string) => (files[path] ? new DOMParser().parseFromString(strFromU8(files[path]), 'application/xml') : null);
  const shared: string[] = [];
  const ss = parse('xl/sharedStrings.xml');
  ss?.querySelectorAll('si').forEach((si) => shared.push([...si.querySelectorAll('t')].map((t) => t.textContent || '').join('')));
  const wbRels = parse('xl/_rels/workbook.xml.rels');
  const wb = parse('xl/workbook.xml');
  const rid = wb?.querySelector('sheet')?.getAttribute('r:id') || wb?.querySelector('sheet')?.getAttributeNS('http://schemas.openxmlformats.org/officeDocument/2006/relationships', 'id');
  let target = 'worksheets/sheet1.xml';
  wbRels?.querySelectorAll('Relationship').forEach((r) => { if (r.getAttribute('Id') === rid) target = r.getAttribute('Target') || target; });
  const sheet = parse('xl/' + target.replace(/^\/?xl\//, ''));
  if (!sheet) throw new Error('В файле нет листа с данными');
  const out: string[][] = [];
  sheet.querySelectorAll('sheetData > row').forEach((row) => {
    const cells: string[] = [];
    row.querySelectorAll('c').forEach((c) => {
      const ref = c.getAttribute('r') || '';
      const col = ref.replace(/\d+/g, '').split('').reduce((n, ch) => n * 26 + ch.charCodeAt(0) - 64, 0) - 1;
      const t = c.getAttribute('t');
      const v = c.querySelector('v')?.textContent ?? '';
      const text = t === 's' ? shared[Number(v)] ?? '' : t === 'inlineStr' ? [...c.querySelectorAll('is t')].map((x) => x.textContent || '').join('') : v;
      cells[col >= 0 ? col : cells.length] = text;
    });
    out.push(Array.from(cells, (x) => x ?? ''));
  });
  return out;
}

/* ---------- CSV ---------- */
export function toCsv(cols: SheetCol[], rows: Record<string, unknown>[], sep = ','): string {
  const q = (v: unknown) => {
    if (v === null || v === undefined) return '';
    const s = v instanceof Date ? v.toISOString() : String(v);
    return /[",;\n\r\t]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
  };
  return '﻿' + [cols.map((c) => q(c.label)).join(sep), ...rows.map((r) => cols.map((c) => q(r[c.key])).join(sep))].join('\r\n');
}

export function parseCsv(text: string): string[][] {
  const t = text.replace(/^﻿/, '');
  const firstLine = t.slice(0, t.indexOf('\n') > 0 ? t.indexOf('\n') : t.length);
  const sep = [';', '\t', ','].map((s) => [s, firstLine.split(s).length] as const).sort((a, b) => b[1] - a[1])[0][0];
  const rows: string[][] = [];
  let row: string[] = [], cell = '', quoted = false;
  for (let i = 0; i < t.length; i++) {
    const ch = t[i];
    if (quoted) {
      if (ch === '"') { if (t[i + 1] === '"') { cell += '"'; i++; } else quoted = false; }
      else cell += ch;
    } else if (ch === '"') quoted = true;
    else if (ch === sep) { row.push(cell); cell = ''; }
    else if (ch === '\n' || ch === '\r') { if (ch === '\r' && t[i + 1] === '\n') i++; row.push(cell); rows.push(row); row = []; cell = ''; }
    else cell += ch;
  }
  if (cell || row.length) { row.push(cell); rows.push(row); }
  return rows.filter((r) => r.some((c) => c.trim() !== ''));
}

/** Rows of a .csv / .xlsx file the user picked. */
export async function readTable(file: File): Promise<string[][]> {
  if (/\.xlsx$/i.test(file.name)) return readXlsx(await file.arrayBuffer());
  if (/\.xls$/i.test(file.name)) throw new Error('Старый формат .xls не поддерживается — сохраните файл как .xlsx или .csv');
  return parseCsv(await file.text());
}

export function download(data: Blob | string, filename: string, type = 'text/plain;charset=utf-8') {
  const blob = typeof data === 'string' ? new Blob([data], { type }) : data;
  const a = document.createElement('a');
  a.href = URL.createObjectURL(blob);
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
  setTimeout(() => URL.revokeObjectURL(a.href), 4000);
}

/** today's local date, YYYY-MM-DD (file names, date inputs) */
export const localDate = (d = new Date()) => `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
export const stamp = () => localDate();
