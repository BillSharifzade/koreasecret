/* Line icon sprite (24×24). Rendered once in the root layout; use <Icon name="…" /> anywhere. */
const ICONS: [string, string][] = [
  ['search', '<circle cx="11" cy="11" r="6.5"/><path d="m16 16 4.5 4.5"/>'],
  ['heart', '<path d="M12 20s-7.5-4.6-7.5-10.1A4.2 4.2 0 0 1 8.7 5.6c1.4 0 2.6.7 3.3 1.8.7-1.1 1.9-1.8 3.3-1.8a4.2 4.2 0 0 1 4.2 4.3C19.5 15.4 12 20 12 20Z"/>'],
  ['bag', '<path d="M5.5 8.5h13l-.9 10.6a1.6 1.6 0 0 1-1.6 1.4H8a1.6 1.6 0 0 1-1.6-1.4L5.5 8.5Z"/><path d="M9 10V7a3 3 0 0 1 6 0v3"/>'],
  ['user', '<circle cx="12" cy="8.5" r="3.8"/><path d="M4.8 20c.9-3.6 3.8-5.6 7.2-5.6s6.3 2 7.2 5.6"/>'],
  ['pin', '<path d="M12 21s-6.5-5.7-6.5-11a6.5 6.5 0 0 1 13 0c0 5.3-6.5 11-6.5 11Z" fill="currentColor" stroke="none"/><circle cx="12" cy="10" r="2.3" fill="#fff" stroke="none"/>'],
  ['menu', '<path d="M4.5 7h15M4.5 12h15M4.5 17h15"/>'],
  ['close', '<path d="m6 6 12 12M18 6 6 18"/>'],
  ['chev-right', '<path d="m9.5 6 6 6-6 6"/>'],
  ['chev-left', '<path d="m14.5 6-6 6 6 6"/>'],
  ['chev-down', '<path d="m6 9.5 6 6 6-6"/>'],
  ['arrow-right', '<path d="M4.5 12h15M13.5 6l6 6-6 6"/>'],
  ['arrow-left', '<path d="M19.5 12h-15M10.5 6l-6 6 6 6"/>'],
  ['star', '<path d="M12 3.3 14.6 9l6.1.6-4.6 4.1 1.3 6-5.4-3.2-5.4 3.2 1.3-6-4.6-4.1L9.4 9 12 3.3Z" fill="currentColor" stroke="none"/>'],
  ['plus', '<path d="M12 5.5v13M5.5 12h13"/>'],
  ['minus', '<path d="M5.5 12h13"/>'],
  ['trash', '<path d="M5 7h14M10 7V5.5h4V7M7 7l.8 11.5a1.5 1.5 0 0 0 1.5 1.5h5.4a1.5 1.5 0 0 0 1.5-1.5L17 7"/>'],
  ['share', '<path d="M12 15V4M8 7.5 12 3.5l4 4M6 11v7.5A1.5 1.5 0 0 0 7.5 20h9a1.5 1.5 0 0 0 1.5-1.5V11"/>'],
  ['play', '<path d="M8 5.5v13l10.5-6.5L8 5.5Z" fill="currentColor" stroke="none"/>'],
  ['check', '<path d="m5 12.5 4.5 4.5L19 7.5"/>'],
  ['filter', '<path d="M4 7h10M18 7h2M4 17h4M12 17h8"/><circle cx="16" cy="7" r="2"/><circle cx="10" cy="17" r="2"/>'],
  ['gift', '<rect x="4" y="9" width="16" height="11" rx="1.5"/><path d="M3.5 9h17v-1a1 1 0 0 0-1-1h-15a1 1 0 0 0-1 1v1ZM12 7v13M12 7c-1-2.5-4.5-3.5-4.5-1S12 7 12 7Zm0 0c1-2.5 4.5-3.5 4.5-1S12 7 12 7Z"/>'],
  ['truck', '<path d="M3.5 6.5h10v10h-10zM13.5 10h4l3 3v3.5h-7"/><circle cx="7.5" cy="17.5" r="1.8"/><circle cx="17" cy="17.5" r="1.8"/>'],
  ['shield', '<path d="M12 3.5 5 6v5.5c0 4.2 3 7.6 7 9 4-1.4 7-4.8 7-9V6l-7-2.5Z"/><path d="m9 12 2.2 2.2L15.5 10"/>'],
  ['return', '<path d="M9 7 5 11l4 4"/><path d="M5 11h9.5a4.5 4.5 0 0 1 0 9H11"/>'],
  ['chat', '<path d="M5 18.5V7.5A2.5 2.5 0 0 1 7.5 5h9A2.5 2.5 0 0 1 19 7.5v6a2.5 2.5 0 0 1-2.5 2.5H9l-4 2.5Z"/><path d="M9 10.5h.01M12 10.5h.01M15 10.5h.01" stroke-width="2.4"/>'],
  ['phone', '<path d="M6.5 4h3l1.5 4-2 1.3a10 10 0 0 0 5.7 5.7l1.3-2 4 1.5v3a2 2 0 0 1-2.2 2A15.5 15.5 0 0 1 4.5 6.2 2 2 0 0 1 6.5 4Z"/>'],
  ['telegram', '<path d="M20.5 4.5 3.8 11c-.8.3-.8 1.4 0 1.6l4.2 1.4 1.6 5c.2.7 1.1.9 1.6.3l2.4-2.5 4.3 3.1c.6.4 1.4.1 1.6-.6L21.9 5.9c.2-.9-.6-1.7-1.4-1.4Z"/><path d="m8 14 9-6.5"/>'],
  ['whatsapp', '<path d="M4.5 19.5 5.6 16A8 8 0 1 1 8.3 18.6l-3.8.9Z"/><path d="M9.5 8.5c0 3 2.5 5.8 5.8 6.2l1-1.2-1.8-1-1 .8a4.5 4.5 0 0 1-2.3-2.3l.8-1-1-1.8-1.5.3Z"/>'],
  ['vk', '<path d="M3.5 7.5h3c.6 3.3 2 5.2 3.3 5.7V7.5h2.8v3.3c1.3-.2 2.6-1.7 3.1-3.3h2.7c-.4 2-1.8 3.7-3 4.4 1.2.6 2.8 2 3.4 4.6h-3c-.5-1.6-1.8-2.9-3.2-3.1v3.1h-.4c-4.8 0-7.4-3.3-8.7-9Z"/>'],
  ['youtube', '<rect x="3" y="6" width="18" height="12" rx="4"/><path d="m10.5 9.5 4 2.5-4 2.5v-5Z" fill="currentColor"/>'],
  ['copy', '<rect x="8.5" y="8.5" width="11" height="11" rx="2"/><path d="M15.5 8.5V6a1.5 1.5 0 0 0-1.5-1.5H6A1.5 1.5 0 0 0 4.5 6v8A1.5 1.5 0 0 0 6 15.5h2.5"/>'],
  ['home', '<path d="M4.5 10.5 12 4.5l7.5 6V19a1 1 0 0 1-1 1H14v-5h-4v5H5.5a1 1 0 0 1-1-1v-8.5Z"/>'],
  ['grid', '<rect x="4.5" y="4.5" width="6" height="6" rx="1.5"/><rect x="13.5" y="4.5" width="6" height="6" rx="1.5"/><rect x="4.5" y="13.5" width="6" height="6" rx="1.5"/><rect x="13.5" y="13.5" width="6" height="6" rx="1.5"/>'],
  ['clock', '<circle cx="12" cy="12" r="8"/><path d="M12 7.5V12l3 2"/>'],
  ['thumb', '<path d="M7.5 10.5v9h-3v-9h3Zm0 0 3.8-6.2c1.2 0 2.2 1 2 2.3l-.6 3.4h5a1.8 1.8 0 0 1 1.8 2.1l-1.1 5.8a2 2 0 0 1-2 1.6H7.5"/>'],
  ['card', '<rect x="3.5" y="6" width="17" height="12" rx="2"/><path d="M3.5 10h17M7 14.5h3"/>'],
  ['sparkle', '<path d="M12 3.5c.6 4.4 2.1 5.9 6.5 6.5-4.4.6-5.9 2.1-6.5 6.5-.6-4.4-2.1-5.9-6.5-6.5 4.4-.6 5.9-2.1 6.5-6.5Z"/><path d="M18.5 15.5c.2 1.6.8 2.2 2.4 2.4-1.6.2-2.2.8-2.4 2.4-.2-1.6-.8-2.2-2.4-2.4 1.6-.2 2.2-.8 2.4-2.4Z"/>'],
  ['drop', '<path d="M12 3.5s-6 6.3-6 10.6a6 6 0 0 0 12 0c0-4.3-6-10.6-6-10.6Z"/><path d="M9 14.5a3 3 0 0 0 3 3"/>'],
  ['sun', '<circle cx="12" cy="12" r="4"/><path d="M12 2.8v2.4M12 18.8v2.4M2.8 12h2.4M18.8 12h2.4M5.5 5.5l1.7 1.7M16.8 16.8l1.7 1.7M5.5 18.5l1.7-1.7M16.8 7.2l1.7-1.7"/>'],
  ['lipstick', '<path d="M9 12.5V6.8c0-.6.4-1.2 1-1.4l3.5-1.6c.5-.2 1 .1 1 .7v8"/><rect x="8" y="12.5" width="7.5" height="3" rx=".8"/><rect x="7.5" y="15.5" width="8.5" height="5" rx="1.2"/>'],
  ['body', '<path d="M9 3.5h6l-.5 3.5h-5L9 3.5Z"/><path d="M8.5 7h7l1 2.3c.3.7.5 1.5.5 2.3v7.4a1.5 1.5 0 0 1-1.5 1.5h-7A1.5 1.5 0 0 1 7 19v-7.4c0-.8.2-1.6.5-2.3L8.5 7Z"/><path d="M10 13h4"/>'],
  ['hair', '<path d="M5 20.5c1-5.5 1-10 4-14 1.8-2.4 5-3 7.4-1.2 2.4 1.8 2.8 5 1.6 8.2-1 2.7-.8 5 .5 7"/><path d="M9.5 20c.5-3.8 1.5-7.3 3.5-9.5"/>'],
  ['brands', '<path d="M12 3.5 14 8l4.8.4-3.6 3.2 1.1 4.7L12 13.8l-4.3 2.5 1.1-4.7-3.6-3.2L10 8l2-4.5Z"/><path d="M5 20.5h14"/>'],
  ['fire', '<path d="M12 21c-3.6 0-6.5-2.6-6.5-6.2 0-3.3 2.4-5.2 3.6-7.8.4 1.7 1.2 2.7 2.4 3.1-.2-2.8 1-5.3 3.5-6.6-.3 3 .9 4.3 2.2 5.9 1 1.3 1.3 2.6 1.3 4.2C18.5 17.9 15.9 21 12 21Z"/><path d="M12 21c-1.7 0-3-1.2-3-2.9 0-1.8 1.7-2.7 2.3-4.4.8 1.2 3.7 2.2 3.7 4.4 0 1.7-1.3 2.9-3 2.9Z"/>'],
  ['percent', '<path d="m6 18 12-12"/><circle cx="7.5" cy="7.5" r="2.2"/><circle cx="16.5" cy="16.5" r="2.2"/>'],
  ['globe', '<circle cx="12" cy="12" r="8.5"/><path d="M3.5 12h17M12 3.5c2.3 2.4 3.4 5.2 3.4 8.5s-1.1 6.1-3.4 8.5c-2.3-2.4-3.4-5.2-3.4-8.5s1.1-6.1 3.4-8.5Z"/>'],
  ['eye', '<path d="M2.8 12S6 5.8 12 5.8 21.2 12 21.2 12 18 18.2 12 18.2 2.8 12 2.8 12Z"/><circle cx="12" cy="12" r="2.8"/>'],
];

export type IconName = (typeof ICONS)[number][0];

const SPRITE = ICONS.map(([id, body]) => `<symbol id="i-${id}" viewBox="0 0 24 24">${body}</symbol>`).join('');

export function IconSprite() {
  return <svg xmlns="http://www.w3.org/2000/svg" style={{ position: 'absolute', width: 0, height: 0, overflow: 'hidden' }} aria-hidden="true" dangerouslySetInnerHTML={{ __html: SPRITE }} />;
}

export function Icon({ name, className = '' }: { name: string; className?: string }) {
  return (
    <svg className={`i${className ? ' ' + className : ''}`} aria-hidden="true">
      <use href={`#i-${name}`} />
    </svg>
  );
}
