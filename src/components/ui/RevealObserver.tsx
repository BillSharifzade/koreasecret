'use client';
import { useEffect } from 'react';
import { usePathname } from 'next/navigation';

/** Adds .is-in to .reveal elements as they scroll into view (also catches elements rendered later). */
export function RevealObserver() {
  const pathname = usePathname();
  useEffect(() => {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      document.querySelectorAll('.reveal').forEach((el) => el.classList.add('is-in'));
      return;
    }
    const io = new IntersectionObserver(
      (entries) => entries.forEach((en) => { if (en.isIntersecting) { en.target.classList.add('is-in'); io.unobserve(en.target); } }),
      // start just before an element scrolls in, so it settles as it arrives instead of popping in on screen
      { rootMargin: '0px 0px 12% 0px', threshold: 0 }
    );
    let raf = 0;
    const scan = () => { cancelAnimationFrame(raf); raf = requestAnimationFrame(() => document.querySelectorAll('.reveal:not(.is-in)').forEach((el) => io.observe(el))); };
    scan();
    const mo = new MutationObserver(scan);
    mo.observe(document.body, { childList: true, subtree: true });
    return () => { io.disconnect(); mo.disconnect(); cancelAnimationFrame(raf); };
  }, [pathname]);
  return null;
}
