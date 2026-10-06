'use client';
import Link from 'next/link';
import type { AnchorHTMLAttributes, MouseEvent, ReactNode } from 'react';
import { useUI } from '../providers';
import { GiftCardModal } from '../chrome/modals';
import { TEXTS } from '@/lib/data';

type Props = Omit<AnchorHTMLAttributes<HTMLAnchorElement>, 'href'> & { href: string; children: ReactNode };

/** A link from the content: site paths, external URLs, '#giftcard' (gift card dialog) or '' (section not built yet). */
export function SmartLink({ href, onClick, children, ...rest }: Props) {
  const ui = useUI();
  if (href === '#giftcard' || !href) {
    const open = (e: MouseEvent<HTMLAnchorElement>) => {
      e.preventDefault();
      onClick?.(e);
      if (href) ui.openModal(<GiftCardModal />, { label: TEXTS.giftcard.title });
      else ui.soon();
    };
    return <a href={href || '#'} onClick={open} {...rest}>{children}</a>;
  }
  if (/^(https?:|mailto:|tel:)/i.test(href)) {
    const ext = /^https?:/i.test(href);
    return <a href={href} onClick={onClick} {...(ext ? { target: '_blank', rel: 'noopener noreferrer' } : null)} {...rest}>{children}</a>;
  }
  if (!href.startsWith('/') && !href.startsWith('#')) return <a href="#" onClick={(e) => { e.preventDefault(); ui.soon(); }} {...rest}>{children}</a>;
  return <Link href={href} onClick={onClick} {...rest}>{children}</Link>;
}
