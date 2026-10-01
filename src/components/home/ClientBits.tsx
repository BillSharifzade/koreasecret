'use client';
import { useState } from 'react';
import { Art } from '../Art';
import { Icon } from '../Icon';
import { useUI } from '../providers';
import { GiftCardModal } from '../chrome/modals';
import { SEO } from '@/lib/data';

export function GiftCardButton({ className = 'btn btn--white' }: { className?: string }) {
  const ui = useUI();
  return <button className={className} type="button" onClick={() => ui.openModal(<GiftCardModal />, { label: 'Подарочная карта' })}>Купить</button>;
}

export function SeoBlock() {
  const [open, setOpen] = useState(false);
  return (
    <section className="section" id="seo">
      <div className="container reveal">
        <div className={`seo${open ? ' is-open' : ''}`}>
          <Art className="seo__art" as="div" spec={{ kind: 'seo' }} />
          <div className="seo__body">
            <div className="seo__inner">
              <h1 className="seo__title">{SEO.title}</h1>
              <div className="seo__text" id="seoText" dangerouslySetInnerHTML={{ __html: SEO.html }} />
            </div>
            <button className="seo__more" type="button" aria-expanded={open} aria-controls="seoText" onClick={() => setOpen((o) => !o)}>
              <span>{open ? 'Свернуть' : 'Показать всё'}</span><Icon name="chev-down" />
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}
