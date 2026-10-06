'use client';
import { useId, useMemo, type CSSProperties } from 'react';
import { renderArt, type ArtSpecInput } from '@/lib/art';
import { useContentVersion } from '@/lib/useContent';

/** Renders procedural SVG art. useId() gives every instance a unique, hydration-stable id prefix for its gradients. */
export function Art({ spec, className, as: Tag = 'span', style }: { spec: ArtSpecInput; className?: string; as?: 'span' | 'div'; style?: CSSProperties }) {
  const id = useId();
  const key = JSON.stringify(spec);
  const v = useContentVersion();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  const html = useMemo(() => renderArt(spec, id), [key, id, v]);
  return <Tag className={className ? `art ${className}` : 'art'} style={style} dangerouslySetInnerHTML={{ __html: html }} />;
}
