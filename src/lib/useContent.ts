'use client';
import { useSyncExternalStore } from 'react';
import { contentVersion, onContent } from './data';

/** Re-renders the caller whenever the content document is swapped (admin edits, storefront preview). */
export function useContentVersion() {
  return useSyncExternalStore(onContent, contentVersion, () => 0);
}
