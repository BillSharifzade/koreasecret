'use client';
import { useState } from 'react';
import { Art } from '../Art';
import { Icon } from '../Icon';
import { useI18n, useUI } from '../providers';
import { GiftCardModal } from '../chrome/modals';
import { SEO } from '@/lib/data';

export function GiftCardButton({ className = 'btn btn--white' }: { className?: string }) {
  const tr = useI18n();
  const ui = useUI();
  return <button className={className} type="button" onClick={() => ui.openModal(<GiftCardModal />, { label: tr.t('gc.title') })}>{tr.t('home.gift.cta')}</button>;
}

export function SeoBlock() {
  const tr = useI18n();
  const [open, setOpen] = useState(false);
  return (
    <div className="container reveal">
      <div className={`seo${open ? ' is-open' : ''}`}>
        <Art className="seo__art" as="div" spec={{ kind: 'seo' }} />
        <div className="seo__body">
          <div className="seo__inner">
            <h1 className="seo__title">{tr.L(SEO.title)}</h1>
            <div className="seo__text" id="seoText" dangerouslySetInnerHTML={{ __html: tr.L(SEO.html) }} />
          </div>
          <button className="seo__more" type="button" aria-expanded={open} aria-controls="seoText" onClick={() => setOpen((o) => !o)}>
            <span>{open ? tr.t('home.collapse') : tr.t('home.showAll')}</span><Icon name="chev-down" />
          </button>
        </div>
      </div>
    </div>
  );
}
