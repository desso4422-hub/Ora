import { DAY_SHORT, WEEK_ORDER } from '../dates';

/** « Tous les jours », « En semaine », « Le week-end » ou « Lun, Mer, Ven ». */
export function daysSummary(days: number[]): string {
  const set = new Set(days);
  if (set.size === 7) return 'Tous les jours';
  if (set.size === 5 && [1, 2, 3, 4, 5].every((d) => set.has(d))) return 'En semaine';
  if (set.size === 2 && set.has(0) && set.has(6)) return 'Le week-end';
  return WEEK_ORDER.filter((d) => set.has(d))
    .map((d) => DAY_SHORT[d].charAt(0) + DAY_SHORT[d].slice(1).toLowerCase())
    .join(', ');
}
