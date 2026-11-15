// Logique métier pure : aucune dépendance à React Native.
import { addDays, diffDays, weekday } from './dates';
import type { Habit, Logs } from './types';

export type Ratio = { done: number; scheduled: number; pct: number };

const ratio = (done: number, scheduled: number): Ratio => ({
  done,
  scheduled,
  pct: scheduled === 0 ? 0 : Math.round((done / scheduled) * 100),
});

/** Prévue ce jour : key >= createdAt et le jour de la semaine fait partie de `days`. */
export function isScheduled(habit: Habit, key: string): boolean {
  return key >= habit.createdAt && habit.days.includes(weekday(key));
}

export function isDone(logs: Logs, habitId: string, key: string): boolean {
  return logs[habitId]?.[key] === true;
}

export function sortHabits(habits: Habit[]): Habit[] {
  return [...habits].sort((a, b) => a.order - b.order);
}

export function scheduledHabits(habits: Habit[], key: string): Habit[] {
  return sortHabits(habits).filter((h) => isScheduled(h, key));
}

/** Score d'un jour : faites / prévues, arrondi en %. 0 prévue → 0 %. */
export function dayScore(habits: Habit[], logs: Logs, key: string): Ratio {
  let done = 0;
  let scheduled = 0;
  for (const h of habits) {
    if (!isScheduled(h, key)) continue;
    scheduled++;
    if (isDone(logs, h.id, key)) done++;
  }
  return ratio(done, scheduled);
}

/**
 * Série en cours : jours prévus consécutifs faits, en remontant depuis aujourd'hui.
 * Les jours non prévus ne cassent pas la série ; aujourd'hui non fait non plus.
 */
export function currentStreak(habit: Habit, logs: Logs, today: string): number {
  let streak = 0;
  for (let key = today; key >= habit.createdAt; key = addDays(key, -1)) {
    if (!isScheduled(habit, key)) continue;
    if (isDone(logs, habit.id, key)) streak++;
    else if (key !== today) break;
  }
  return streak;
}

/** Record : plus longue série de jours prévus faits (jusqu'à aujourd'hui inclus). */
export function bestStreak(habit: Habit, logs: Logs, today: string): number {
  let best = 0;
  let run = 0;
  for (let key = habit.createdAt; key <= today; key = addDays(key, 1)) {
    if (!isScheduled(habit, key)) continue;
    if (isDone(logs, habit.id, key)) {
      run++;
      if (run > best) best = run;
    } else if (key !== today) {
      run = 0;
    }
  }
  return best;
}

/** Plus longue série en cours parmi toutes les habitudes. */
export function longestCurrentStreak(habits: Habit[], logs: Logs, today: string): number {
  return habits.reduce((m, h) => Math.max(m, currentStreak(h, logs, today)), 0);
}

/** Faits / prévus sur une plage [from, today] ; aujourd'hui exclu s'il n'est pas encore fait. */
function rangeRatio(habit: Habit, logs: Logs, from: string, today: string): Ratio {
  let done = 0;
  let scheduled = 0;
  for (let key = from; key <= today; key = addDays(key, 1)) {
    if (!isScheduled(habit, key)) continue;
    const d = isDone(logs, habit.id, key);
    if (key === today && !d) continue;
    scheduled++;
    if (d) done++;
  }
  return ratio(done, scheduled);
}

/** Taux sur les 30 derniers jours (aujourd'hui compris s'il est fait). */
export function rate30(habit: Habit, logs: Logs, today: string): Ratio {
  return rangeRatio(habit, logs, addDays(today, -29), today);
}

/** Taux global, toutes habitudes, depuis leur création. */
export function globalRate(habits: Habit[], logs: Logs, today: string): Ratio {
  let done = 0;
  let scheduled = 0;
  for (const h of habits) {
    const r = rangeRatio(h, logs, h.createdAt, today);
    done += r.done;
    scheduled += r.scheduled;
  }
  return ratio(done, scheduled);
}

export function firstDay(habits: Habit[]): string | null {
  if (habits.length === 0) return null;
  return habits.reduce((m, h) => (h.createdAt < m ? h.createdAt : m), habits[0].createdAt);
}

/** Nombre de jours depuis la première habitude créée (ce jour-là compte pour 1). */
export function daysSinceStart(habits: Habit[], today: string): number {
  const first = firstDay(habits);
  if (!first || first > today) return 0;
  return diffDays(first, today) + 1;
}

/**
 * Jours complets (tout fait, aujourd'hui compris) et jours ratés
 * (au moins une habitude non faite, jours passés uniquement).
 */
export function dayCounts(habits: Habit[], logs: Logs, today: string): { complete: number; missed: number } {
  const first = firstDay(habits);
  let complete = 0;
  let missed = 0;
  if (!first) return { complete, missed };
  for (let key = first; key <= today; key = addDays(key, 1)) {
    const s = dayScore(habits, logs, key);
    if (s.scheduled === 0) continue;
    if (s.done === s.scheduled) complete++;
    else if (key !== today) missed++;
  }
  return { complete, missed };
}

export type DayStatus = 'complete' | 'missed' | 'none';

/** Point de statut d'un jour de la bande de la semaine. */
export function dayStatus(habits: Habit[], logs: Logs, key: string, today: string): DayStatus {
  if (key > today) return 'none';
  const s = dayScore(habits, logs, key);
  if (s.scheduled === 0) return 'none';
  if (s.done === s.scheduled) return 'complete';
  if (key < today) return 'missed';
  return 'none';
}

/** En retard : prévue aujourd'hui, non faite, heure de rappel passée. */
export function isOverdue(habit: Habit, logs: Logs, key: string, now: Date, today: string): boolean {
  if (key !== today || !habit.reminder) return false;
  if (!isScheduled(habit, key) || isDone(logs, habit.id, key)) return false;
  const mins = now.getHours() * 60 + now.getMinutes();
  return mins >= habit.reminder.hour * 60 + habit.reminder.minute;
}

export type CellState = 'done' | 'missed' | 'off';

/** État d'une case d'historique. Aujourd'hui non fait n'est pas (encore) raté. */
export function cellState(habit: Habit, logs: Logs, key: string, today: string): CellState {
  if (key > today || !isScheduled(habit, key)) return 'off';
  if (isDone(logs, habit.id, key)) return 'done';
  return key === today ? 'off' : 'missed';
}

export type DayLevel = 'high' | 'mid' | 'low' | 'off';

/**
 * Niveau d'une journée pour la vue d'ensemble : >= 70 % high, 40–69 % mid, < 40 % low.
 * Futur ou rien de prévu → off. Aujourd'hui sans rien de coché → off (la journée n'est pas finie).
 */
export function dayLevel(habits: Habit[], logs: Logs, key: string, today: string): DayLevel {
  if (key > today) return 'off';
  const s = dayScore(habits, logs, key);
  if (s.scheduled === 0) return 'off';
  if (key === today && s.done === 0) return 'off';
  if (s.pct >= 70) return 'high';
  if (s.pct >= 40) return 'mid';
  return 'low';
}
