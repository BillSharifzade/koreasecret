/* Russian number and date formatting. */

/** 12500 → "12 500" */
export const fmt = (n: number) => String(Math.round(n)).replace(/\B(?=(\d{3})+(?!\d))/g, ' ');

/** Picks the Russian plural form: plural(3, 'товар', 'товара', 'товаров') → 'товара' */
export function plural(n: number, one: string, few: string, many: string) {
  const a = Math.abs(n) % 10, b = Math.abs(n) % 100;
  if (a === 1 && b !== 11) return one;
  if (a >= 2 && a <= 4 && (b < 12 || b > 14)) return few;
  return many;
}

/** count(21, 'отзыв', 'отзыва', 'отзывов') → "21 отзыв" */
export const count = (n: number, one: string, few: string, many: string) => `${fmt(n)} ${plural(n, one, few, many)}`;

const MONTHS = ['января', 'февраля', 'марта', 'апреля', 'мая', 'июня', 'июля', 'августа', 'сентября', 'октября', 'ноября', 'декабря'];
/** "28 сентября" (UTC, so server and client agree) */
export const dateRu = (d: Date) => `${d.getUTCDate()} ${MONTHS[d.getUTCMonth()]}`;
