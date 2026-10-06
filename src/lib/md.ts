import { href } from './asset';

/* Light markdown for editable copy. Everything is escaped first, so content can never inject markup:
   blocks are paragraphs (blank line between), "## " headings and "- " lists; inline **bold**, *italic*, [text](link). */

const esc = (s: string) => s.replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c] as string));

export function mdInline(s: string): string {
  return esc(s)
    .replace(/\[([^\]]+)\]\(([^)\s]+)\)/g, (_m, text: string, link: string) => {
      const url = href(link.replace(/&amp;/g, '&'));
      const ext = /^https?:/i.test(url) ? ' target="_blank" rel="noopener noreferrer"' : '';
      return `<a href="${esc(url)}"${ext}>${text}</a>`;
    })
    .replace(/\*\*(.+?)\*\*/g, '<b>$1</b>')
    .replace(/\*(.+?)\*/g, '<em>$1</em>')
    .replace(/\n/g, '<br>');
}

export function mdBlocks(s: string, opts: { heading?: 'h2' | 'h3' | 'h4' } = {}): string {
  const h = opts.heading || 'h3';
  return (s || '').trim().split(/\n\s*\n/).map((block) => {
    const b = block.trim();
    if (!b) return '';
    if (b.startsWith('## ')) return `<${h}>${mdInline(b.slice(3))}</${h}>`;
    const lines = b.split('\n');
    if (lines.every((l) => /^\s*[-•]\s+/.test(l))) return `<ul>${lines.map((l) => `<li>${mdInline(l.replace(/^\s*[-•]\s+/, ''))}</li>`).join('')}</ul>`;
    return `<p>${mdInline(b)}</p>`;
  }).join('');
}

/** Plain text of a markdown string (for meta descriptions, counters, search). */
export const mdText = (s: string) => (s || '').replace(/\[([^\]]+)\]\([^)]+\)/g, '$1').replace(/\*\*|\*|^##\s+|^\s*[-•]\s+/gm, '').replace(/\s+/g, ' ').trim();
