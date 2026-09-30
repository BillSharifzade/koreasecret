'use client';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useEffect, useRef, useState } from 'react';
import { Butterfly } from '../Brand';
import { Icon } from '../Icon';
import { useMounted } from '../layer';
import { useI18n, useUI } from '../providers';
import { AccountModal } from './modals';
import { CONFIG } from '@/lib/data';
import { shop, useShop } from '@/lib/store';

export function TabBar() {
  const tr = useI18n();
  const ui = useUI();
  const pathname = usePathname();
  const cartCount = useShop((s) => s.cart.reduce((n, it) => n + it.q, 0));
  const favCount = useShop((s) => s.fav.length);
  const home = pathname === `/${tr.lang}`;
  const catalog = pathname.startsWith(`/${tr.lang}/catalog`);
  const badge = (n: number) => <span className={`header__badge${n > 0 ? ' is-visible' : ''}`}>{n || ''}</span>;
  return (
    <nav className="tabbar" aria-label={tr.t('nav.menu')}>
      <Link className={`tabbar__item${home ? ' is-active' : ''}`} href={`/${tr.lang}`}><Icon name="home" /><span>{tr.t('nav.home')}</span></Link>
      <button className={`tabbar__item${catalog || ui.overlay === 'mega' ? ' is-active' : ''}`} type="button" onClick={() => ui.toggle('mega')}><Icon name="grid" /><span>{tr.t('nav.catalog')}</span></button>
      <button className="tabbar__item" type="button" onClick={() => ui.open('fav')}><Icon name="heart" /><span>{tr.t('nav.fav')}</span>{badge(favCount)}</button>
      <button className="tabbar__item" type="button" onClick={() => ui.open('cart')}><Icon name="bag" /><span>{tr.t('nav.cart')}</span>{badge(cartCount)}</button>
      <button className="tabbar__item" type="button" onClick={() => ui.openModal(<AccountModal />, { label: tr.t('acc.title') })}><Icon name="user" /><span>{tr.t('nav.account')}</span></button>
    </nav>
  );
}

export function CookieBanner() {
  const tr = useI18n();
  const mounted = useMounted();
  const accepted = useShop((s) => s.cookie);
  const [leaving, setLeaving] = useState(false);
  if (!mounted || accepted) return null;
  return (
    <div className="cookie" role="region" aria-label="Cookie" style={leaving ? { opacity: 0, transform: 'translate(-50%, 16px)', transition: 'opacity .3s, transform .3s' } : undefined}>
      <Butterfly className="cookie__icon" />
      <p dangerouslySetInnerHTML={{ __html: tr.t('cookie.text') }} />
      <button className="btn btn--gray" type="button" onClick={() => { setLeaving(true); window.setTimeout(() => shop.acceptCookies(), 300); }}>{tr.t('cookie.ok')}</button>
    </div>
  );
}

export function ChatWidget() {
  const tr = useI18n();
  const ui = useUI();
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (!open) return;
    const onDoc = (e: MouseEvent) => { if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false); };
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') setOpen(false); };
    document.addEventListener('mousedown', onDoc);
    document.addEventListener('keydown', onKey);
    return () => { document.removeEventListener('mousedown', onDoc); document.removeEventListener('keydown', onKey); };
  }, [open]);
  return (
    <div ref={ref}>
      <div className={`chat-panel${open ? ' is-open' : ''}`} role="dialog" aria-label={tr.t('chat.name')} aria-hidden={!open}>
        <div className="chat-panel__head">
          <div className="chat-panel__avatar"><Butterfly /></div>
          <div><div className="chat-panel__name">{tr.t('chat.name')}</div><div className="chat-panel__status">{tr.t('chat.status')}</div></div>
        </div>
        <div className="chat-panel__body">
          <div className="chat-panel__bubble">{tr.t('chat.hello')}</div>
          <a className="chat-panel__link" href="#" onClick={(e) => { e.preventDefault(); ui.soon(); }}><Icon name="telegram" />Telegram</a>
          <a className="chat-panel__link" href="#" onClick={(e) => { e.preventDefault(); ui.soon(); }}><Icon name="whatsapp" />WhatsApp</a>
          <a className="chat-panel__link" href={CONFIG.phoneHref}><Icon name="phone" />{tr.t('chat.call')} · {CONFIG.phone}</a>
        </div>
      </div>
      <button className="chat-fab" type="button" aria-label={tr.t('chat.fab')} aria-expanded={open} onClick={() => setOpen((o) => !o)}>
        <Icon name="chat" /><span>{tr.t('chat.fab')}</span><span className="chat-fab__dot" />
      </button>
    </div>
  );
}
