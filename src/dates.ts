// Dates locales sous forme de clés « yyyy-mm-dd ». Jamais d'UTC / toISOString.

const pad = (n: number) => String(n).padStart(2, '0');

export function toKey(d: Date): string {
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
}

const KEY_RE = /^(\d{4})-(\d{2})-(\d{2})$/;

export function isValidKey(key: string): boolean {
  const m = KEY_RE.exec(key);
  if (!m) return false;
  const d = fromKey(key);
  return toKey(d) === key;
}

/** Date locale à midi (évite les surprises des changements d'heure). */
export function fromKey(key: string): Date {
  const [y, m, d] = key.split('-').map(Number);
  return new Date(y, m - 1, d, 12, 0, 0, 0);
}

export function todayKey(now: Date = new Date()): string {
  return toKey(now);
}

export function addDays(key: string, n: number): string {
  const d = fromKey(key);
  d.setDate(d.getDate() + n);
  return toKey(d);
}

/** 0 = dimanche … 6 = samedi */
export function weekday(key: string): number {
  return fromKey(key).getDay();
}

/** Nombre de jours de a à b (b - a). */
export function diffDays(a: string, b: string): number {
  return Math.round((fromKey(b).getTime() - fromKey(a).getTime()) / 86_400_000);
}

/** Lundi de la semaine contenant `key`. */
export function startOfWeek(key: string): string {
  const wd = weekday(key);
  return addDays(key, -((wd + 6) % 7));
}

/** Les 7 clés lun → dim de la semaine contenant `key`. */
export function weekKeys(key: string): string[] {
  const mon = startOfWeek(key);
  return Array.from({ length: 7 }, (_, i) => addDays(mon, i));
}

/** Ordre d'affichage lun → dim, en indices 0–6 (0 = dimanche). */
export const WEEK_ORDER = [1, 2, 3, 4, 5, 6, 0] as const;
export const DAY_SHORT: Record<number, string> = { 0: 'DIM', 1: 'LUN', 2: 'MAR', 3: 'MER', 4: 'JEU', 5: 'VEN', 6: 'SAM' };
export const DAY_LETTER: Record<number, string> = { 0: 'D', 1: 'L', 2: 'M', 3: 'M', 4: 'J', 5: 'V', 6: 'S' };
export const DAY_FULL: Record<number, string> = {
  0: 'dimanche', 1: 'lundi', 2: 'mardi', 3: 'mercredi', 4: 'jeudi', 5: 'vendredi', 6: 'samedi',
};

export function formatLongDate(key: string): string {
  return fromKey(key).toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long' });
}

export function formatTime(h: number, m: number): string {
  return `${pad(h)}:${pad(m)}`;
}
