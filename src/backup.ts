// Validation stricte d'une sauvegarde (logique pure, testable).
import { isValidKey } from './dates';
import type { AppData, Habit, Logs } from './types';

export type ValidationResult = { ok: true; data: AppData } | { ok: false; error: string };

const isObj = (v: unknown): v is Record<string, unknown> =>
  typeof v === 'object' && v !== null && !Array.isArray(v);
const isInt = (v: unknown, min: number, max: number): v is number =>
  typeof v === 'number' && Number.isInteger(v) && v >= min && v <= max;

function validateHabit(v: unknown, i: number): Habit | string {
  const where = `Habitude n° ${i + 1}`;
  if (!isObj(v)) return `${where} : format invalide.`;
  const { id, name, emoji, days, reminder, createdAt, order } = v;
  if (typeof id !== 'string' || id.length === 0) return `${where} : identifiant manquant.`;
  if (typeof name !== 'string' || name.trim().length === 0) return `${where} : nom manquant.`;
  if (typeof emoji !== 'string') return `${where} : emoji invalide.`;
  if (!Array.isArray(days) || days.length === 0 || !days.every((d) => isInt(d, 0, 6)))
    return `${where} : jours invalides (0 à 6 attendus).`;
  if (new Set(days).size !== days.length) return `${where} : jours en double.`;
  let rem: Habit['reminder'] = null;
  if (reminder !== null) {
    if (!isObj(reminder) || !isInt(reminder.hour, 0, 23) || !isInt(reminder.minute, 0, 59))
      return `${where} : rappel invalide.`;
    rem = { hour: reminder.hour, minute: reminder.minute };
  }
  if (typeof createdAt !== 'string' || !isValidKey(createdAt)) return `${where} : date de création invalide.`;
  if (typeof order !== 'number' || !Number.isFinite(order)) return `${where} : ordre invalide.`;
  return { id, name: name.trim(), emoji, days: [...(days as number[])].sort((a, b) => a - b), reminder: rem, createdAt, order };
}

export function validateBackup(input: unknown): ValidationResult {
  if (!isObj(input)) return { ok: false, error: "Ce fichier n'est pas une sauvegarde Ora." };
  if (input.version !== 1) return { ok: false, error: 'Version de sauvegarde non prise en charge.' };
  if (!Array.isArray(input.habits)) return { ok: false, error: 'Liste des habitudes manquante.' };
  if (!isObj(input.logs)) return { ok: false, error: 'Historique manquant.' };

  const habits: Habit[] = [];
  const ids = new Set<string>();
  for (let i = 0; i < input.habits.length; i++) {
    const h = validateHabit(input.habits[i], i);
    if (typeof h === 'string') return { ok: false, error: h };
    if (ids.has(h.id)) return { ok: false, error: `Habitude n° ${i + 1} : identifiant en double.` };
    ids.add(h.id);
    habits.push(h);
  }

  const logs: Logs = {};
  for (const [habitId, entries] of Object.entries(input.logs)) {
    if (!ids.has(habitId)) return { ok: false, error: 'Historique lié à une habitude inconnue.' };
    if (!isObj(entries)) return { ok: false, error: 'Historique invalide.' };
    const clean: Record<string, true> = {};
    for (const [key, val] of Object.entries(entries)) {
      if (!isValidKey(key) || val !== true) return { ok: false, error: `Historique invalide (entrée « ${key} »).` };
      clean[key] = true;
    }
    logs[habitId] = clean;
  }
  return { ok: true, data: { version: 1, habits, logs } };
}

/** Parse un texte JSON puis valide. */
export function parseBackup(text: string): ValidationResult {
  let json: unknown;
  try {
    json = JSON.parse(text);
  } catch {
    return { ok: false, error: "Le fichier n'est pas un JSON lisible." };
  }
  return validateBackup(json);
}

export function backupFileName(today: string): string {
  return `ora-backup-${today}.json`;
}
