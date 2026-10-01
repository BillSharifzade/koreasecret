'use client';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useEffect, useRef, useState } from 'react';
import { Butterfly } from '../Brand';
import { Icon } from '../Icon';
import { useMounted } from '../layer';
import { useUI } from '../providers';
import { AccountModal } from './modals';
import GlassSurface, { GLASS } from '../ui/GlassSurface';
import { useBackdropTone } from '../ui/useBackdropTone';
import { CONFIG } from '@/lib/data';
import { shop, useShop } from '@/lib/store';

export function TabBar() {
  const ui = useUI();
  const pathname = usePathname();
  const ref = useRef<HTMLElement>(null);
  const backdrop = useBackdropTone(ref);
  const cartCount = useShop((s) => s.cart.reduce((n, it) => n + it.q, 0));
  const favCount = useShop((s) => s.fav.length);
  const home = pathname === '/';
  const catalog = pathname.startsWith('/catalog');
  const badge = (n: number) => <span className={`header__badge${n > 0 ? ' is-visible' : ''}`}>{n || ''}</span>;
  return (
    <GlassSurface {...GLASS} as="nav" ref={ref} className="tabbar" width="auto" height={66} tone={backdrop} data-backdrop={backdrop} aria-label="Меню">
      <Link className={`tabbar__item${home ? ' is-active' : ''}`} href="/"><Icon name="home" /><span>Главная</span></Link>
      <button className={`tabbar__item${catalog || ui.overlay === 'mega' ? ' is-active' : ''}`} type="button" onClick={() => ui.toggle('mega')}><Icon name="grid" /><span>Каталог</span></button>
      <button className="tabbar__item" type="button" onClick={() => ui.open('fav')}><Icon name="heart" /><span>Избранное</span>{badge(favCount)}</button>
      <button className="tabbar__item" type="button" onClick={() => ui.open('cart')}><Icon name="bag" /><span>Корзина</span>{badge(cartCount)}</button>
      <button className="tabbar__item" type="button" onClick={() => ui.openModal(<AccountModal />, { label: 'Вход или регистрация' })}><Icon name="user" /><span>Профиль</span></button>
    </GlassSurface>
  );
}

export function CookieBanner() {
  const mounted = useMounted();
  const accepted = useShop((s) => s.cookie);
  const [leaving, setLeaving] = useState(false);
  if (!mounted || accepted) return null;
  return (
    <div className="cookie" role="region" aria-label="Cookie" style={leaving ? { opacity: 0, transform: 'translate(-50%, 16px)', transition: 'opacity .3s, transform .3s' } : undefined}>
      <Butterfly className="cookie__icon" />
      <p dangerouslySetInnerHTML={{ __html: 'Мы используем cookie, чтобы сайт работал удобнее. Продолжая пользоваться сайтом, вы соглашаетесь с <a href="#">правилами cookie</a>.' }} />
      <button className="btn btn--gray" type="button" onClick={() => { setLeaving(true); window.setTimeout(() => shop.acceptCookies(), 300); }}>Хорошо</button>
    </div>
  );
}

export function ChatWidget() {
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
      <div className={`chat-panel${open ? ' is-open' : ''}`} role="dialog" aria-label="Консультант Korea Secret" aria-hidden={!open}>
        <div className="chat-panel__head">
          <div className="chat-panel__avatar"><Butterfly /></div>
          <div><div className="chat-panel__name">Консультант Korea Secret</div><div className="chat-panel__status">Онлайн · отвечаем за 2 минуты</div></div>
        </div>
        <div className="chat-panel__body">
          <div className="chat-panel__bubble">Здравствуйте! Поможем подобрать уход под ваш тип кожи. Где вам удобнее общаться?</div>
          <a className="chat-panel__link" href="#" onClick={(e) => { e.preventDefault(); ui.soon(); }}><Icon name="telegram" />Telegram</a>
          <a className="chat-panel__link" href="#" onClick={(e) => { e.preventDefault(); ui.soon(); }}><Icon name="whatsapp" />WhatsApp</a>
          <a className="chat-panel__link" href={CONFIG.phoneHref}><Icon name="phone" />Позвонить · {CONFIG.phone}</a>
        </div>
      </div>
      <button className="chat-fab" type="button" aria-label="Напишите нам, мы онлайн!" aria-expanded={open} onClick={() => setOpen((o) => !o)}>
        <Icon name="chat" /><span>Напишите нам, мы онлайн!</span><span className="chat-fab__dot" />
      </button>
    </div>
  );
}
