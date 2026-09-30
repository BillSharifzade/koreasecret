import { BFLY_D, MARK_D } from '@/lib/art';

/** KS monogram traced from the brand logo (fill = currentColor). */
export function Mark({ className = 'logo__mark' }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 446 480" aria-hidden="true">
      <path d={MARK_D} />
    </svg>
  );
}

/** The butterfly from the logo, used as a recurring brand motif. */
export function Butterfly({ className = '' }: { className?: string }) {
  return (
    <svg className={className} viewBox="-1 0 157 156" aria-hidden="true">
      <path d={BFLY_D} />
    </svg>
  );
}
