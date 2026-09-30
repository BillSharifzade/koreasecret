'use client';
import { useState, type FormEvent } from 'react';
import { Art } from '../Art';
import { Butterfly } from '../Brand';
import { useI18n, useUI } from '../providers';
import { CONFIG } from '@/lib/data';
import { cartTotals, getProduct, maskPhone, priceOf, price, titleOf } from '@/lib/shop';
import { shop, useShop } from '@/lib/store';

const CITY_EN: Record<string, string> = { 'Москва': 'Moscow', 'Санкт-Петербург': 'Saint Petersburg', 'Казань': 'Kazan', 'Екатеринбург': 'Yekaterinburg', 'Новосибирск': 'Novosibirsk', 'Краснодар': 'Krasnodar' };
export const cityLabel = (city: string, lang: string) => (lang === 'en' ? CITY_EN[city] || city : city);

export function CityModal() {
  const tr = useI18n();
  const ui = useUI();
  const city = useShop((s) => s.city) || CONFIG.cities[0];
  return (
    <>
      <h2 className="modal__title">{tr.t('city.title')}</h2>
      <p className="modal__text">{tr.t('city.text')}</p>
      <div className="search__chips">
        {CONFIG.cities.map((c) => (
          <button key={c} className={`chip${c === city ? ' is-active' : ''}`} type="button" onClick={() => { shop.setCity(c); ui.closeModal(); ui.toast({ title: tr.t('city.saved', { city: cityLabel(c, tr.lang) }), icon: 'pin' }); }}>
            {cityLabel(c, tr.lang)}
          </button>
        ))}
      </div>
    </>
  );
}

export function PhoneInput({ name, id, required }: { name: string; id?: string; required?: boolean }) {
  const [v, setV] = useState('');
  return <input className="input" id={id} name={name} type="tel" inputMode="tel" placeholder="+7 (___) ___-__-__" autoComplete="tel" required={required} value={v} onChange={(e) => setV(e.target.value ? maskPhone(e.target.value) : '')} />;
}

export function AccountModal() {
  const tr = useI18n();
  const ui = useUI();
  const submit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const input = e.currentTarget.elements.namedItem('phone') as HTMLInputElement;
    const digits = input.value.replace(/\D/g, '');
    if (digits.length < 11) { input.focus(); ui.toast({ title: tr.t('acc.bad'), icon: 'phone' }); return; }
    ui.closeModal();
    ui.toast({ title: tr.t('acc.demo'), text: maskPhone(digits), icon: 'phone' });
  };
  return (
    <>
      <h2 className="modal__title">{tr.t('acc.title')}</h2>
      <p className="modal__text">{tr.t('acc.text')}</p>
      <form className="modal__stack" onSubmit={submit} noValidate>
        <label className="field"><span className="field__label">{tr.t('acc.phone')}</span><PhoneInput name="phone" /></label>
        <button className="btn btn--primary btn--block" type="submit">{tr.t('acc.btn')}</button>
        <p className="modal__note">{tr.t('acc.note')}</p>
      </form>
    </>
  );
}

export function GiftCardModal() {
  const tr = useI18n();
  const ui = useUI();
  const p = getProduct('ks-giftcard')!;
  const [v, setV] = useState(1);
  return (
    <>
      <h2 className="modal__title">{tr.t('gc.title')}</h2>
      <p className="modal__text">{tr.t('gc.text')}</p>
      <Art className="giftcard-preview" as="div" spec={{ kind: 'giftcardPreview', amount: p.variants![v].name }} />
      <div className="denoms" role="radiogroup" aria-label={tr.t('gc.title')}>
        {p.variants!.map((x, i) => (
          <button key={x.name} className={`denom${i === v ? ' is-active' : ''}`} type="button" role="radio" aria-checked={i === v} onClick={() => setV(i)}>{x.name}</button>
        ))}
      </div>
      <button className="btn btn--primary btn--block btn--lg" style={{ marginTop: 22 }} type="button" onClick={() => { ui.addToCart(p.id, v); ui.closeModal(); }}>{tr.t('gc.add')}</button>
    </>
  );
}

export function CheckoutModal() {
  const tr = useI18n();
  const ui = useUI();
  const cart = useShop((s) => s.cart);
  const promo = useShop((s) => s.promo);
  const [done, setDone] = useState<string | null>(null);
  const T = cartTotals(cart, promo);

  if (done) {
    return (
      <div className="success">
        <div className="success__art"><Butterfly className="bfly-deco flap" /></div>
        <h3>{tr.t('co.success')}</h3>
        <p dangerouslySetInnerHTML={{ __html: tr.t('co.successText', { num: done }) }} />
        <button className="btn btn--primary" type="button" onClick={ui.closeModal}>{tr.t('co.continue')}</button>
      </div>
    );
  }

  const submit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const f = e.currentTarget;
    const name = f.elements.namedItem('name') as HTMLInputElement;
    const phone = f.elements.namedItem('phone') as HTMLInputElement;
    if (!name.value.trim() || phone.value.replace(/\D/g, '').length < 11) { ui.toast({ title: tr.t('co.required'), icon: 'user' }); (name.value.trim() ? phone : name).focus(); return; }
    setDone('KS-' + String(Date.now()).slice(-6));
    shop.clearCart();
    ui.close();
  };
  const radio = (group: string, value: string, title: string, note: string, checked?: boolean) => (
    <label className="radio-card" key={value}><input type="radio" name={group} value={value} defaultChecked={checked} /><b>{title}</b><span>{note}</span></label>
  );

  return (
    <>
      <h2 className="modal__title">{tr.t('co.title')}</h2>
      <div className="co">
        <form className="co__form" onSubmit={submit} noValidate>
          <div className="co__row">
            <label className="field"><span className="field__label">{tr.t('co.name')}</span><input className="input" name="name" autoComplete="given-name" required /></label>
            <label className="field"><span className="field__label">{tr.t('co.phone')}</span><PhoneInput name="phone" required /></label>
          </div>
          <label className="field"><span className="field__label">{tr.t('co.email')}</span><input className="input" name="email" type="email" autoComplete="email" /></label>
          <div className="field"><span className="field__label">{tr.t('co.method')}</span><div className="radio-cards">{radio('ship', 'courier', tr.t('co.courier'), tr.t('co.courierNote'), true)}{radio('ship', 'pickup', tr.t('co.pickup'), tr.t('co.pickupNote'))}{radio('ship', 'store', tr.t('co.store'), tr.t('co.storeNote'))}</div></div>
          <label className="field"><span className="field__label">{tr.t('co.address')}</span><input className="input" name="address" autoComplete="street-address" /></label>
          <div className="field"><span className="field__label">{tr.t('co.pay')}</span><div className="radio-cards">{radio('pay', 'card', tr.t('co.payCard'), tr.t('co.payCardNote'), true)}{radio('pay', 'sbp', tr.t('co.paySbp'), tr.t('co.paySbpNote'))}{radio('pay', 'cash', tr.t('co.payCash'), tr.t('co.payCashNote'))}</div></div>
          <label className="field"><span className="field__label">{tr.t('co.comment')}</span><textarea className="input" name="comment" rows={2} /></label>
          <button className="btn btn--primary btn--lg btn--block" type="submit">{tr.t('co.confirm')} · {price(T.total)}</button>
        </form>
        <aside className="co__summary">
          <div className="footer__title">{tr.t('co.summary')}</div>
          <div className="co__items">
            {cart.map((it) => {
              const p = getProduct(it.id);
              if (!p) return null;
              const va = p.variants?.[it.v];
              return (
                <div className="co__item" key={`${it.id}:${it.v}`}>
                  <Art className="co__item-art" spec={{ kind: 'product', id: p.id, variant: va?.color, amount: va?.price ? va.name : undefined }} />
                  <span>{titleOf(p)}{va ? ` · ${va.name}` : ''}<br /><span className="muted">× {it.q}</span></span>
                  <b>{price(priceOf(p, it.v) * it.q)}</b>
                </div>
              );
            })}
          </div>
          <div className="sum-row"><span>{tr.t('cart.subtotal')}</span><span>{price(T.full)}</span></div>
          {T.savings > 0 && <div className="sum-row"><span>{tr.t('cart.savings')}</span><span className="accent">−{price(T.savings)}</span></div>}
          {T.promo > 0 && <div className="sum-row"><span>{tr.t('cart.promoLine')}</span><span className="accent">−{price(T.promo)}</span></div>}
          <div className="sum-row"><span>{tr.t('cart.delivery')}</span><span>{T.delivery ? price(T.delivery) : tr.t('cart.free')}</span></div>
          <div className="sum-row sum-row--total"><span>{tr.t('cart.total')}</span><span>{price(T.total)}</span></div>
        </aside>
      </div>
    </>
  );
}
