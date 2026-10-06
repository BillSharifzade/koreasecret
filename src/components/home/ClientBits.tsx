'use client';
import { useState } from 'react';
import { Art } from '../Art';
import { Icon } from '../Icon';
import { useUI } from '../providers';
import { GiftCardModal } from '../chrome/modals';
import { TEXTS } from '@/lib/data';
import { mdBlocks, mdInline } from '@/lib/md';
import type { HomeSection } from '@/lib/types';

export function GiftCardButton({ className = 'btn btn--white', label = 'Купить' }: { className?: string; label?: string }) {
  const ui = useUI();
  return <button className={className} type="button" onClick={() => ui.openModal(<GiftCardModal />, { label: TEXTS.giftcard.title })}>{label}</button>;
}

export function SeoBlock({ s }: { s: Extract<HomeSection, { type: 'seo' }> }) {
  const [open, setOpen] = useState(false);
  return (
    <section className="section" id={s.id}>
      <div className="container reveal">
        <div className={`seo${open ? ' is-open' : ''}`}>
          <Art className="seo__art" as="div" spec={{ kind: 'seo' }} />
          <div className="seo__body">
            <div className="seo__inner">
              <h1 className="seo__title" dangerouslySetInnerHTML={{ __html: mdInline(s.title) }} />
              <div className="seo__text" id={`${s.id}-text`} dangerouslySetInnerHTML={{ __html: mdBlocks(s.body) }} />
            </div>
            <button className="seo__more" type="button" aria-expanded={open} aria-controls={`${s.id}-text`} onClick={() => setOpen((o) => !o)}>
              <span>{open ? 'Свернуть' : 'Показать всё'}</span><Icon name="chev-down" />
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}
