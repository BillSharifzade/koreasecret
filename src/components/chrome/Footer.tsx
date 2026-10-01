'use client';
import Link from 'next/link';
import type { FormEvent } from 'react';
import { Mark } from '../Brand';
import { Icon } from '../Icon';
import { useUI } from '../providers';
import { GiftCardModal } from './modals';
import { CONFIG, STORES } from '@/lib/data';

export function Footer() {
  const ui = useUI();

  /* links: a path, 'giftcard' (opens the gift card dialog) or null (not built yet) */
  const col = (title: string, labels: string[], links: (string | 'giftcard' | null)[] = []) => (
    <div className="footer__col">
      <div className="footer__title">{title}</div>
      <ul className="footer__list">
        {labels.map((label, i) => {
          const target = links[i];
          if (target === 'giftcard') return <li key={label}><a className="footer__link" href="#giftcards" onClick={(e) => { e.preventDefault(); ui.openModal(<GiftCardModal />, { label: 'Подарочная карта' }); }}>{label}</a></li>;
          if (target) return <li key={label}><Link className="footer__link" href={target}>{label}</Link></li>;
          return <li key={label}><a className="footer__link" href="#" onClick={(e) => { e.preventDefault(); ui.soon(); }}>{label}</a></li>;
        })}
      </ul>
    </div>
  );

  const subscribe = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const input = e.currentTarget.elements.namedItem('email') as HTMLInputElement;
    if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(input.value.trim())) { ui.toast({ title: 'Проверьте адрес почты', icon: 'close' }); input.focus(); return; }
    e.currentTarget.reset();
    ui.toast({ title: 'Спасибо! Первый секрет уже летит к вам', icon: 'sparkle' });
  };
  const soon = (e: React.MouseEvent) => { e.preventDefault(); ui.soon(); };

  return (
    <footer className="footer">
      <div className="container">
        <div className="footer__top">
          {col('О нас', ['О компании', 'Магазины', 'Журнал', 'Вакансии', 'Контакты'], [null, '/#stores', '/#journal'])}
          {col('Покупателям', ['Как заказать', 'Оплата', 'Доставка по Таджикистану', 'Возврат', 'Программа лояльности'])}
          {col('Информация', ['Подарочные карты', 'Проверка подлинности', 'Вопрос-ответ', 'Оптовым клиентам', 'Карта сайта'], ['giftcard'])}
          <div className="footer__col">
            <div className="footer__title">Магазины</div>
            <ul className="footer__list">{STORES.map((s) => <li key={s.id}><Link className="footer__link" href="/#stores">{s.city}, {s.addr}</Link></li>)}</ul>
          </div>
          <div className="footer__contact">
            <a className="footer__phone" href={CONFIG.phoneHref}>{CONFIG.phone}</a>
            <div className="footer__hours">ежедневно с 9:00 до 21:00<span>или пишите в Telegram и WhatsApp</span></div>
            <div className="footer__socials">
              {[['telegram', 'Telegram'], ['instagram', 'Instagram'], ['whatsapp', 'WhatsApp'], ['tiktok', 'TikTok']].map(([i, n]) => <a key={i} className="social" href="#" aria-label={n} onClick={soon}><Icon name={i} /></a>)}
            </div>
            <form className="footer__sub" onSubmit={subscribe} noValidate>
              <div className="footer__sub-title">Секреты красоты и закрытые акции — раз в неделю</div>
              <div className="footer__sub-form">
                <input className="input" type="email" name="email" placeholder="Ваш e-mail" aria-label="Ваш e-mail" />
                <button className="btn btn--primary" type="submit">Подписаться</button>
              </div>
            </form>
          </div>
        </div>
        <div className="footer__bottom">
          <Link className="footer__brand" href="/" aria-label="Korea Secret"><Mark className="" /></Link>
          <span className="footer__copy">© 2026 Korea Secret</span>
          <div className="footer__legal"><a href="#" onClick={soon}>Договор оферты</a><a href="#" onClick={soon}>Конфиденциальность</a></div>
          <div className="footer__pay" aria-label="Оплата: Visa, Mastercard, Корти Миллӣ, QR-код мобильного банка">
            <span className="pay-badge pay-badge--mc"><i /><i /></span><span className="pay-badge">VISA</span><span className="pay-badge pay-badge--plain">Корти Миллӣ</span><span className="pay-badge pay-badge--plain"><Icon name="qr" className="i--sm" />QR</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
