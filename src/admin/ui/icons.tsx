/* Admin icons: the storefront sprite (<Icon>) plus these, drawn on the same 24px grid with the same 1.7 stroke. */
const ICONS: [string, string][] = [
  ['dashboard', '<rect x="4" y="4" width="7" height="9" rx="2"/><rect x="13" y="4" width="7" height="5" rx="2"/><rect x="13" y="11" width="7" height="9" rx="2"/><rect x="4" y="15" width="7" height="5" rx="2"/>'],
  ['receipt', '<path d="M6 3.5h12v17l-2.4-1.6L13.2 20.5 12 19.7l-1.2.8-2.4-1.6L6 20.5v-17Z"/><path d="M9 8h6M9 11.5h6M9 15h3.5"/>'],
  ['users', '<circle cx="9" cy="8.5" r="3.3"/><path d="M3 19.5c.7-3.1 3.1-4.9 6-4.9s5.3 1.8 6 4.9"/><path d="M15.5 5.5a3.2 3.2 0 0 1 0 6.2M17.5 14.9c1.8.6 3 2.1 3.5 4.6"/>'],
  ['chart', '<path d="M4 20h16"/><rect x="5.5" y="11" width="3" height="6.5" rx="1"/><rect x="10.5" y="6.5" width="3" height="11" rx="1"/><rect x="15.5" y="13" width="3" height="4.5" rx="1"/>'],
  ['trend', '<path d="m4 16 5-5 3.5 3.5L20 7"/><path d="M15 7h5v5"/>'],
  ['report', '<path d="M7 3.5h7l4.5 4.5v11a1.5 1.5 0 0 1-1.5 1.5H7A1.5 1.5 0 0 1 5.5 19V5A1.5 1.5 0 0 1 7 3.5Z"/><path d="M13.5 3.5V8.5h5M9 17v-3M12 17v-5M15 17v-2"/>'],
  ['box', '<path d="m12 3.5 8 4v9l-8 4-8-4v-9l8-4Z"/><path d="m4 7.5 8 4 8-4M12 11.5v9"/>'],
  ['tag', '<path d="M3.5 12.2V5a1.5 1.5 0 0 1 1.5-1.5h7.2l8.3 8.3a1.5 1.5 0 0 1 0 2.1l-7 7a1.5 1.5 0 0 1-2.1 0l-7.9-7.7Z"/><circle cx="8.3" cy="8.3" r="1.5"/>'],
  ['layers', '<path d="m12 4 8.5 4.5L12 13 3.5 8.5 12 4Z"/><path d="m3.5 12.5 8.5 4.5 8.5-4.5M3.5 16.5 12 21l8.5-4.5"/>'],
  ['flask', '<path d="M9.5 3.5h5M10.5 3.5v5.2L5.2 17.6A2 2 0 0 0 7 20.5h10a2 2 0 0 0 1.8-2.9l-5.3-8.9V3.5"/><path d="M7.5 14.5h9"/>'],
  ['list', '<path d="M9 6.5h11M9 12h11M9 17.5h11"/><circle cx="4.8" cy="6.5" r="1.1" fill="currentColor" stroke="none"/><circle cx="4.8" cy="12" r="1.1" fill="currentColor" stroke="none"/><circle cx="4.8" cy="17.5" r="1.1" fill="currentColor" stroke="none"/>'],
  ['star-o', '<path d="M12 3.8 14.4 9l5.7.6-4.3 3.8 1.2 5.6L12 16.1 7 19l1.2-5.6L3.9 9.6 9.6 9 12 3.8Z"/>'],
  ['layout', '<rect x="3.5" y="4" width="17" height="16" rx="2.5"/><path d="M3.5 9h17M9.5 9v11"/>'],
  ['image', '<rect x="3.5" y="4.5" width="17" height="15" rx="2.5"/><circle cx="9" cy="9.5" r="1.8"/><path d="m4 17.5 5-4.5 3.5 3 3-2.5 4.5 4"/>'],
  ['images', '<rect x="6.5" y="3.5" width="14" height="12" rx="2"/><path d="M3.5 7.5v10a3 3 0 0 0 3 3h10"/><path d="m7 13.5 3.5-3 2.5 2 2-1.5 4.5 3.5"/>'],
  ['book', '<path d="M4 5.5A2 2 0 0 1 6 3.5h13.5v14H6a2 2 0 0 0-2 2v-14Z"/><path d="M4 19.5a2 2 0 0 0 2 2h13.5v-4M8.5 7.5h7"/>'],
  ['nav', '<rect x="3.5" y="4" width="17" height="5" rx="2"/><path d="M6.5 13.5h11M6.5 17.5h7"/>'],
  ['type', '<path d="M5 7V5h14v2M12 5v14M9 19h6"/>'],
  ['settings', '<circle cx="12" cy="12" r="3"/><path d="M12 3.5 14 5.6l2.9-.3.6 2.8 2.5 1.5-1 2.4 1 2.4-2.5 1.5-.6 2.8-2.9-.3L12 20.5 10 18.4l-2.9.3-.6-2.8L4 14.4l1-2.4-1-2.4 2.5-1.5.6-2.8 2.9.3L12 3.5Z"/>'],
  ['palette', '<path d="M12 3.5a8.5 8.5 0 0 0 0 17c1.2 0 1.8-.7 1.8-1.6 0-1.2-1-1.6-1-2.6 0-1 .8-1.7 1.8-1.7H17a3.5 3.5 0 0 0 3.5-3.5c0-4.3-3.8-7.6-8.5-7.6Z"/><circle cx="7.8" cy="11" r="1.2"/><circle cx="10.5" cy="7.3" r="1.2"/><circle cx="15" cy="7.8" r="1.2"/>'],
  ['cloud', '<path d="M7 18.5a4 4 0 0 1-.6-8A6 6 0 0 1 18 9.6a4.5 4.5 0 0 1-.5 8.9H7Z"/><path d="m9.5 13.5 2.5-2.5 2.5 2.5M12 11v6"/>'],
  ['github', '<path d="M12 3.5a8.5 8.5 0 0 0-2.7 16.6c.4.1.6-.2.6-.4v-1.6c-2.4.5-2.9-1-2.9-1-.4-1-1-1.3-1-1.3-.8-.5 0-.5 0-.5.9.1 1.4.9 1.4.9.8 1.3 2 1 2.5.7.1-.6.3-1 .6-1.2-1.9-.2-3.9-1-3.9-4.2 0-.9.3-1.7.9-2.3-.1-.2-.4-1.1.1-2.3 0 0 .7-.2 2.3.9a8 8 0 0 1 4.2 0c1.6-1.1 2.3-.9 2.3-.9.5 1.2.2 2.1.1 2.3.5.6.9 1.4.9 2.3 0 3.3-2 4-3.9 4.2.3.3.6.8.6 1.6v2.4c0 .2.2.5.6.4A8.5 8.5 0 0 0 12 3.5Z"/>'],
  ['undo', '<path d="M9 7.5 5 11.5l4 4"/><path d="M5 11.5h9.5a4.5 4.5 0 0 1 0 9H12"/>'],
  ['redo', '<path d="m15 7.5 4 4-4 4"/><path d="M19 11.5H9.5a4.5 4.5 0 0 0 0 9H12"/>'],
  ['eye-off', '<path d="M3.5 3.5l17 17M10 6.1c.6-.1 1.3-.2 2-.2 6 0 9.2 6.1 9.2 6.1a15 15 0 0 1-2.6 3.4M6.4 7.5C4 9.1 2.8 12 2.8 12S6 18.2 12 18.2c1.6 0 3-.4 4.2-1"/><path d="M9.9 9.9a3 3 0 0 0 4.2 4.2"/>'],
  ['external', '<path d="M13.5 4.5h6v6M19.5 4.5l-8 8"/><path d="M17.5 13.5v5a1.5 1.5 0 0 1-1.5 1.5H6A1.5 1.5 0 0 1 4.5 18.5V8.5A1.5 1.5 0 0 1 6 7h5"/>'],
  ['edit', '<path d="M4.5 19.5h4l10-10a2.8 2.8 0 0 0-4-4l-10 10v4Z"/><path d="m13 7 4 4"/>'],
  ['drag', '<circle cx="9" cy="6" r="1.3" fill="currentColor" stroke="none"/><circle cx="15" cy="6" r="1.3" fill="currentColor" stroke="none"/><circle cx="9" cy="12" r="1.3" fill="currentColor" stroke="none"/><circle cx="15" cy="12" r="1.3" fill="currentColor" stroke="none"/><circle cx="9" cy="18" r="1.3" fill="currentColor" stroke="none"/><circle cx="15" cy="18" r="1.3" fill="currentColor" stroke="none"/>'],
  ['more', '<circle cx="6" cy="12" r="1.5" fill="currentColor" stroke="none"/><circle cx="12" cy="12" r="1.5" fill="currentColor" stroke="none"/><circle cx="18" cy="12" r="1.5" fill="currentColor" stroke="none"/>'],
  ['download', '<path d="M12 4v11M7.5 10.5 12 15l4.5-4.5M5 19.5h14"/>'],
  ['upload', '<path d="M12 15V4M7.5 8.5 12 4l4.5 4.5M5 19.5h14"/>'],
  ['refresh', '<path d="M19.5 12a7.5 7.5 0 1 1-2.2-5.3L19.5 9"/><path d="M19.5 4.5V9H15"/>'],
  ['alert', '<path d="M12 4 21 19.5H3L12 4Z"/><path d="M12 10v4.5M12 17.2h.01" stroke-width="2"/>'],
  ['info', '<circle cx="12" cy="12" r="8.5"/><path d="M12 11v5.5M12 7.8h.01" stroke-width="2"/>'],
  ['link', '<path d="M10 14a4 4 0 0 0 5.7 0l3-3A4 4 0 0 0 13 5.3l-1.3 1.3"/><path d="M14 10a4 4 0 0 0-5.7 0l-3 3A4 4 0 0 0 11 18.7l1.3-1.3"/>'],
  ['calendar', '<rect x="4" y="5.5" width="16" height="14.5" rx="2.5"/><path d="M4 10h16M8.5 3.5v4M15.5 3.5v4"/>'],
  ['logout', '<path d="M14 4.5H6.5A1.5 1.5 0 0 0 5 6v12a1.5 1.5 0 0 0 1.5 1.5H14"/><path d="M10.5 12h10M17 8.5l3.5 3.5-3.5 3.5"/>'],
  ['lock', '<rect x="5" y="10.5" width="14" height="10" rx="2.5"/><path d="M8.5 10.5V8a3.5 3.5 0 0 1 7 0v2.5"/>'],
  ['key', '<circle cx="8" cy="15" r="4"/><path d="m11 12 8.5-8.5M16 7l2.5 2.5M14 9l2 2"/>'],
  ['history', '<path d="M4.5 12a7.5 7.5 0 1 0 2.2-5.3L4.5 9"/><path d="M4.5 4.5V9H9M12 8v4.5l3 2"/>'],
  ['wand', '<path d="m4 20 11-11M13 7l4 4"/><path d="M18 3v3M16.5 4.5h3M20 9v2M19 10h2M9 3v2M8 4h2"/>'],
  ['mail', '<rect x="3.5" y="5.5" width="17" height="13" rx="2.5"/><path d="m4 7 8 6 8-6"/>'],
  ['bell', '<path d="M6 16.5V11a6 6 0 0 1 12 0v5.5l1.5 2h-15l1.5-2Z"/><path d="M10 20.5a2 2 0 0 0 4 0"/>'],
  ['sort', '<path d="M8 4.5v15M4.5 8 8 4.5 11.5 8M16 19.5v-15M12.5 16l3.5 3.5 3.5-3.5"/>'],
  ['printer', '<path d="M7 9V4.5h10V9"/><rect x="4" y="9" width="16" height="7.5" rx="2"/><path d="M7 14h10v6H7z"/>'],
  ['file', '<path d="M7 3.5h7l4.5 4.5v11a1.5 1.5 0 0 1-1.5 1.5H7A1.5 1.5 0 0 1 5.5 19V5A1.5 1.5 0 0 1 7 3.5Z"/><path d="M13.5 3.5V8.5h5"/>'],
  ['table', '<rect x="3.5" y="4.5" width="17" height="15" rx="2.5"/><path d="M3.5 9.5h17M3.5 14.5h17M9.5 9.5v10"/>'],
  ['zap', '<path d="M13 3.5 5 13.5h6l-1 7 8-10h-6l1-7Z"/>'],
  ['cash', '<rect x="3" y="6.5" width="18" height="11" rx="2"/><circle cx="12" cy="12" r="2.6"/><path d="M6.5 9.5v5M17.5 9.5v5"/>'],
  ['target', '<circle cx="12" cy="12" r="8.5"/><circle cx="12" cy="12" r="4.5"/><circle cx="12" cy="12" r="1" fill="currentColor"/>'],
  ['split', '<path d="M5 4.5h4.5M5 4.5V9M5 4.5l6 6v9M19 4.5h-4.5M19 4.5V9M19 4.5l-4.4 4.4"/>'],
  ['columns', '<rect x="3.5" y="4.5" width="17" height="15" rx="2.5"/><path d="M9.2 4.5v15M14.8 4.5v15"/>'],
  ['eye', '<path d="M2.8 12S6 5.8 12 5.8 21.2 12 21.2 12 18 18.2 12 18.2 2.8 12 2.8 12Z"/><circle cx="12" cy="12" r="2.8"/>'],
  ['check-circle', '<circle cx="12" cy="12" r="8.5"/><path d="m8 12.3 2.7 2.7L16 9.7"/>'],
  ['x-circle', '<circle cx="12" cy="12" r="8.5"/><path d="m9 9 6 6M15 9l-6 6"/>'],
  ['loader', '<path d="M12 3.5a8.5 8.5 0 1 0 8.5 8.5"/>'],
  ['command', '<path d="M9 6.5A2.5 2.5 0 1 0 6.5 9H9V6.5Zm0 0v11m0-11h6m-6 11A2.5 2.5 0 1 1 6.5 15H9v2.5Zm0 0h6m0-11A2.5 2.5 0 1 1 17.5 9H15V6.5Zm0 0v11m0 0A2.5 2.5 0 1 0 17.5 15H15v2.5Z"/>'],
  ['store', '<path d="M4 9.5 5.5 4.5h13L20 9.5"/><path d="M4 9.5a2.7 2.7 0 0 0 5.3 0 2.7 2.7 0 0 0 5.4 0 2.7 2.7 0 0 0 5.3 0"/><path d="M5.5 11.5v8h13v-8M10 19.5v-5h4v5"/>'],
  ['compass', '<circle cx="12" cy="12" r="8.5"/><path d="m15.5 8.5-2 5-5 2 2-5 5-2Z"/>'],
  ['minus-circle', '<circle cx="12" cy="12" r="8.5"/><path d="M8 12h8"/>'],
  ['duplicate', '<rect x="8.5" y="8.5" width="11" height="11" rx="2"/><path d="M15.5 8.5V6a1.5 1.5 0 0 0-1.5-1.5H6A1.5 1.5 0 0 0 4.5 6v8A1.5 1.5 0 0 0 6 15.5h2.5"/><path d="M14 11.5v5M11.5 14h5"/>']
];

const SPRITE = ICONS.map(([id, body]) => `<symbol id="a-${id}" viewBox="0 0 24 24">${body}</symbol>`).join('');
const OWN = new Set(ICONS.map(([id]) => id));

export function AdminSprite() {
  return <svg xmlns="http://www.w3.org/2000/svg" style={{ position: 'absolute', width: 0, height: 0, overflow: 'hidden' }} aria-hidden="true" dangerouslySetInnerHTML={{ __html: SPRITE }} />;
}

/** Any icon: the admin's own set or the storefront sprite. */
export function I({ name, className = '', size }: { name: string; className?: string; size?: number }) {
  return (
    <svg className={`i${className ? ' ' + className : ''}`} aria-hidden="true" style={size ? { width: size, height: size } : undefined}>
      <use href={`#${OWN.has(name) ? 'a' : 'i'}-${name}`} />
    </svg>
  );
}
