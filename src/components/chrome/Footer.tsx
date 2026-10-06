'use client';
import Link from 'next/link';
import type { FormEvent } from 'react';
import { Mark } from '../Brand';
import { Icon } from '../Icon';
import { useUI } from '../providers';
import { SmartLink } from '../ui/SmartLink';
import { CONFIG, FOOTER, STORES } from '@/lib/data';
import { href as linkHref } from '@/lib/asset';

const SOCIALS = [['telegram', 'Telegram'], ['instagram', 'Instagram'], ['whatsapp', 'WhatsApp'], ['tiktok', 'TikTok']] as const;

export function Footer() {
  const ui = useUI();

  const subscribe = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const input = e.currentTarget.elements.namedItem('email') as HTMLInputElement;
    if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(input.value.trim())) { ui.toast({ title: 'Проверьте адрес почты', icon: 'close' }); input.focus(); return; }
    e.currentTarget.reset();
    ui.toast({ title: 'Спасибо! Первый секрет уже летит к вам', icon: 'sparkle' });
  };

  return (
    <footer className="footer">
      <div className="container">
        <div className="footer__top">
          {FOOTER.columns.map((col, i) => (
            <div key={i} className="footer__col">
              <div className="footer__title">{col.title}</div>
              <ul className="footer__list">{col.links.map((l, k) => <li key={k}><SmartLink className="footer__link" href={l.href}>{l.label}</SmartLink></li>)}</ul>
            </div>
          ))}
          {STORES.length > 0 && (
            <div className="footer__col">
              <div className="footer__title">Магазины</div>
              <ul className="footer__list">{STORES.map((s) => <li key={s.id}><Link className="footer__link" href="/#stores">{s.city}, {s.addr}</Link></li>)}</ul>
            </div>
          )}
          <div className="footer__contact">
            <a className="footer__phone" href={CONFIG.phoneHref}>{CONFIG.phone}</a>
            <div className="footer__hours">{CONFIG.hours}<span>{CONFIG.hoursNote}</span></div>
            <div className="footer__socials">
              {SOCIALS.map(([k, n]) => {
                const url = CONFIG.socials[k];
                return url
                  ? <a key={k} className="social" href={linkHref(url)} target="_blank" rel="noopener noreferrer" aria-label={n}><Icon name={k} /></a>
                  : <a key={k} className="social" href="#" aria-label={n} onClick={(e) => { e.preventDefault(); ui.soon(); }}><Icon name={k} /></a>;
              })}
            </div>
            <form className="footer__sub" onSubmit={subscribe} noValidate>
              <div className="footer__sub-title">{FOOTER.subscribe}</div>
              <div className="footer__sub-form">
                <input className="input" type="email" name="email" placeholder="Ваш e-mail" aria-label="Ваш e-mail" />
                <button className="btn btn--primary" type="submit">Подписаться</button>
              </div>
            </form>
          </div>
        </div>
        <div className="footer__bottom">
          <Link className="footer__brand" href="/" aria-label={CONFIG.name}><Mark className="" /></Link>
          <span className="footer__copy">{FOOTER.copyright}</span>
          <div className="footer__legal">{FOOTER.legal.map((l, i) => <SmartLink key={i} href={l.href}>{l.label}</SmartLink>)}</div>
          <div className="footer__pay" aria-label="Оплата: Visa, Mastercard, Корти Миллӣ, QR-код мобильного банка">
            <span className="pay-badge pay-badge--mc"><i /><i /></span><span className="pay-badge">VISA</span><span className="pay-badge pay-badge--plain">Корти Миллӣ</span><span className="pay-badge pay-badge--plain"><Icon name="qr" className="i--sm" />QR</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
