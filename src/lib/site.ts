/** Public site URL including the base path, e.g. https://user.github.io/koreasecret (no trailing slash). */
export const BASE_PATH = process.env.NEXT_PUBLIC_BASE_PATH || '';
export const SITE_URL = (process.env.NEXT_PUBLIC_SITE_URL || `http://localhost:3000${BASE_PATH}`).replace(/\/$/, '');
