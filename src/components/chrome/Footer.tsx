'use client';
import Link from 'next/link';
import type { FormEvent } from 'react';
import { Mark } from '../Brand';
import { Icon } from '../Icon';
import { useI18n, useUI } from '../providers';
import { GiftCardModal } from './modals';
import { CONFIG, STORES } from '@/lib/data';
import { href, type ListKey, type StrKey } from '@/lib/i18n';

export function Footer() {
  const tr = useI18n();
  const ui = useUI();
  const L = (p: string) => href(tr.lang, p);

  const col = (titleKey: StrKey, linksKey: ListKey, links: (string | 'giftcard' | null)[] = []) => (
    <div className="footer__col">
      <div className="footer__title">{tr.t(titleKey)}</div>
      <ul className="footer__list">
        {tr.list(linksKey).map((label, i) => {
          const target = links[i];
          if (target === 'giftcard') return <li key={label}><a className="footer__link" href={L('/#giftcards')} onClick={(e) => { e.preventDefault(); ui.openModal(<GiftCardModal />, { label: tr.t('gc.title') }); }}>{label}</a></li>;
          if (target) return <li key={label}><Link className="footer__link" href={L(target)}>{label}</Link></li>;
          return <li key={label}><a className="footer__link" href="#" onClick={(e) => { e.preventDefault(); ui.soon(); }}>{label}</a></li>;
        })}
      </ul>
    </div>
  );

  const subscribe = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const input = e.currentTarget.elements.namedItem('email') as HTMLInputElement;
    if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(input.value.trim())) { ui.toast({ title: tr.t('f.subBad'), icon: 'close' }); input.focus(); return; }
    e.currentTarget.reset();
    ui.toast({ title: tr.t('f.subOk'), icon: 'sparkle' });
  };
  const soon = (e: React.MouseEvent) => { e.preventDefault(); ui.soon(); };

  return (
    <footer className="footer">
      <div className="container">
        <div className="footer__top">
          {col('f.about', 'f.aboutLinks', [null, '/#stores', '/#journal'])}
          {col('f.buyers', 'f.buyersLinks')}
          {col('f.info', 'f.infoLinks', ['giftcard'])}
          <div className="footer__col">
            <div className="footer__title">{tr.t('f.stores')}</div>
            <ul className="footer__list">{STORES.map((s) => <li key={s.addr.ru}><Link className="footer__link" href={L('/#stores')}>{tr.L(s.city)}, {tr.L(s.addr)}</Link></li>)}</ul>
          </div>
          <div className="footer__contact">
            <a className="footer__phone" href={CONFIG.phoneHref}>{CONFIG.phone}</a>
            <div className="footer__hours">{tr.t('f.hours')}<span>{tr.t('f.free')}</span></div>
            <div className="footer__socials">
              {[['telegram', 'Telegram'], ['vk', 'VK'], ['whatsapp', 'WhatsApp'], ['youtube', 'YouTube']].map(([i, n]) => <a key={i} className="social" href="#" aria-label={n} onClick={soon}><Icon name={i} /></a>)}
            </div>
            <form className="footer__sub" onSubmit={subscribe} noValidate>
              <div className="footer__sub-title">{tr.t('f.sub')}</div>
              <div className="footer__sub-form">
                <input className="input" type="email" name="email" placeholder={tr.t('f.subPh')} aria-label={tr.t('f.subPh')} />
                <button className="btn btn--primary" type="submit">{tr.t('f.subBtn')}</button>
              </div>
            </form>
          </div>
        </div>
        <div className="footer__bottom">
          <Link className="footer__brand" href={L('/')} aria-label="Korea Secret"><Mark className="" /></Link>
          <span className="footer__copy">{tr.t('f.copy')}</span>
          <div className="footer__legal"><a href="#" onClick={soon}>{tr.t('f.terms')}</a><a href="#" onClick={soon}>{tr.t('f.privacy')}</a></div>
          <div className="footer__pay" aria-label="Visa, Mastercard, МИР, СБП">
            <span className="pay-badge pay-badge--mc"><i /><i /></span><span className="pay-badge">VISA</span><span className="pay-badge pay-badge--mir">МИР</span><span className="pay-badge pay-badge--sbp"><Icon name="sparkle" className="i--sm" />СБП</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
