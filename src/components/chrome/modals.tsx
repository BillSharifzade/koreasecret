'use client';
import { useState, type FormEvent } from 'react';
import { Art } from '../Art';
import { Butterfly } from '../Brand';
import { useUI } from '../providers';
import { CONFIG, TEXTS } from '@/lib/data';
import { recordOrder } from '@/lib/orders';
import { brandOf, cartTotals, getProduct, giftCard, maskPhone, oldOf, phoneComplete, priceOf, price, titleOf } from '@/lib/shop';
import { shop, useShop } from '@/lib/store';


export function CityModal() {
  const ui = useUI();
  const city = useShop((s) => s.city) || CONFIG.cities[0];
  return (
    <>
      <h2 className="modal__title">Ваш город</h2>
      <p className="modal__text">От города зависят сроки доставки и наличие в магазинах</p>
      <div className="search__chips">
        {CONFIG.cities.map((c) => (
          <button key={c} className={`chip${c === city ? ' is-active' : ''}`} type="button" onClick={() => { shop.setCity(c); ui.closeModal(); ui.toast({ title: `Город: ${c}`, icon: 'pin' }); }}>
            {c}
          </button>
        ))}
      </div>
    </>
  );
}

export function PhoneInput({ name, id, required }: { name: string; id?: string; required?: boolean }) {
  const [v, setV] = useState('');
  return <input className="input" id={id} name={name} type="tel" inputMode="tel" placeholder="+992 __ ___-__-__" autoComplete="tel" required={required} value={v} onChange={(e) => setV(e.target.value ? maskPhone(e.target.value) : '')} />;
}

export function AccountModal() {
  const ui = useUI();
  const submit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const input = e.currentTarget.elements.namedItem('phone') as HTMLInputElement;
    if (!phoneComplete(input.value)) { input.focus(); ui.toast({ title: 'Введите номер полностью', icon: 'phone' }); return; }
    ui.closeModal();
    ui.toast({ title: 'Демо-режим: SMS не отправляются', text: input.value, icon: 'phone' });
  };
  return (
    <>
      <h2 className="modal__title">{TEXTS.account.title}</h2>
      <p className="modal__text">{TEXTS.account.text}</p>
      <form className="modal__stack" onSubmit={submit} noValidate>
        <label className="field"><span className="field__label">Номер телефона</span><PhoneInput name="phone" /></label>
        <button className="btn btn--primary btn--block" type="submit">Получить код</button>
        <p className="modal__note">Нажимая кнопку, вы соглашаетесь с условиями обработки персональных данных</p>
      </form>
    </>
  );
}

export function GiftCardModal() {
  const ui = useUI();
  const p = giftCard();
  const variants = p?.variants?.length ? p.variants : p ? [{ name: price(p.price), price: p.price }] : [];
  const [v, setV] = useState(Math.min(1, variants.length - 1));
  if (!p) return <><h2 className="modal__title">{TEXTS.giftcard.title}</h2><p className="modal__text">Подарочные карты скоро появятся.</p></>;
  return (
    <>
      <h2 className="modal__title">{TEXTS.giftcard.title}</h2>
      <p className="modal__text">{TEXTS.giftcard.text}</p>
      <Art className="giftcard-preview" as="div" spec={{ kind: 'giftcardPreview', amount: variants[v].name }} />
      <div className="denoms" role="radiogroup" aria-label={TEXTS.giftcard.title}>
        {variants.map((x, i) => (
          <button key={x.name} className={`denom${i === v ? ' is-active' : ''}`} type="button" role="radio" aria-checked={i === v} onClick={() => setV(i)}>{x.name}</button>
        ))}
      </div>
      <button className="btn btn--primary btn--block btn--lg" style={{ marginTop: 22 }} type="button" onClick={() => { ui.addToCart(p.id, v); ui.closeModal(); }}>Добавить в корзину</button>
    </>
  );
}

export function CheckoutModal() {
  const ui = useUI();
  const cart = useShop((s) => s.cart);
  const promo = useShop((s) => s.promo);
  const [done, setDone] = useState<string | null>(null);
  const T = cartTotals(cart, promo);

  if (done) {
    return (
      <div className="success">
        <div className="success__art"><Butterfly className="bfly-deco flap" /></div>
        <h3>Заказ оформлен!</h3>
        <p>Номер заказа <span className="success__num">{done}</span>. {TEXTS.checkout.success}</p>
        <button className="btn btn--primary" type="button" onClick={ui.closeModal}>Продолжить покупки</button>
      </div>
    );
  }

  const submit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const f = e.currentTarget;
    const name = f.elements.namedItem('name') as HTMLInputElement;
    const phone = f.elements.namedItem('phone') as HTMLInputElement;
    if (!name.value.trim() || !phoneComplete(phone.value)) { ui.toast({ title: 'Заполните имя и телефон', icon: 'user' }); (name.value.trim() ? phone : name).focus(); return; }
    const id = 'KS-' + String(Date.now()).slice(-6);
    const val = (k: string) => ((f.elements.namedItem(k) as HTMLInputElement | RadioNodeList | null)?.value || '').trim();
    recordOrder({
      id, createdAt: new Date().toISOString(), source: 'site', status: 'new',
      customer: { name: name.value.trim(), phone: phone.value, email: val('email') || undefined },
      city: shop.get().city || CONFIG.cities[0], address: val('address') || undefined, delivery: val('ship'), payment: val('pay'), comment: val('comment') || undefined,
      promo: T.pct ? promo : undefined,
      items: cart.flatMap((it) => {
        const p = getProduct(it.id);
        return p ? [{ id: p.id, v: it.v, q: it.q, name: titleOf(p), variant: p.variants?.[it.v]?.name, price: priceOf(p, it.v), old: oldOf(p, it.v) || undefined, brand: brandOf(p.brand).name, type: p.type }] : [];
      }),
      totals: { sub: T.sub, full: T.full, savings: T.savings, promo: T.promo, delivery: T.delivery, total: T.total, count: T.count }
    });
    setDone(id);
    shop.clearCart();
    ui.close();
  };
  const radio = (group: string, value: string, title: string, note: string, checked?: boolean) => (
    <label className="radio-card" key={value}><input type="radio" name={group} value={value} defaultChecked={checked} /><b>{title}</b><span>{note}</span></label>
  );

  return (
    <>
      <h2 className="modal__title">Оформление заказа</h2>
      <div className="co">
        <form className="co__form" onSubmit={submit} noValidate>
          <div className="co__row">
            <label className="field"><span className="field__label">Имя</span><input className="input" name="name" autoComplete="given-name" required /></label>
            <label className="field"><span className="field__label">Телефон</span><PhoneInput name="phone" required /></label>
          </div>
          <label className="field"><span className="field__label">E-mail</span><input className="input" name="email" type="email" autoComplete="email" /></label>
          <div className="field"><span className="field__label">Способ получения</span><div className="radio-cards">{TEXTS.checkout.delivery.map((o, i) => radio('ship', o.id, o.title, o.note, i === 0))}</div></div>
          <label className="field"><span className="field__label">Адрес доставки</span><input className="input" name="address" autoComplete="street-address" /></label>
          <div className="field"><span className="field__label">Оплата</span><div className="radio-cards">{TEXTS.checkout.payment.map((o, i) => radio('pay', o.id, o.title, o.note, i === 0))}</div></div>
          <label className="field"><span className="field__label">Комментарий к заказу</span><textarea className="input" name="comment" rows={2} /></label>
          <button className="btn btn--primary btn--lg btn--block" type="submit">Подтвердить заказ · {price(T.total)}</button>
        </form>
        <aside className="co__summary">
          <div className="footer__title">Ваш заказ</div>
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
          <div className="sum-row"><span>Товары</span><span>{price(T.full)}</span></div>
          {T.savings > 0 && <div className="sum-row"><span>Скидка на товары</span><span className="accent">−{price(T.savings)}</span></div>}
          {T.promo > 0 && <div className="sum-row"><span>Промокод</span><span className="accent">−{price(T.promo)}</span></div>}
          <div className="sum-row"><span>Доставка</span><span>{T.delivery ? price(T.delivery) : 'бесплатно'}</span></div>
          <div className="sum-row sum-row--total"><span>Итого</span><span>{price(T.total)}</span></div>
        </aside>
      </div>
    </>
  );
}
