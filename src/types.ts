export type Reminder = { hour: number; minute: number };

export type Habit = {
  id: string;
  name: string;
  emoji: string; // choisi par l'utilisateur
  days: number[]; // jours prévus, 0 = dimanche … 6 = samedi
  reminder: Reminder | null;
  createdAt: string; // yyyy-mm-dd, les jours avant ne comptent pas
  order: number; // ordre d'affichage
};

export type Logs = Record<string /* habitId */, Record<string /* yyyy-mm-dd */, true>>;

export type AppData = { version: 1; habits: Habit[]; logs: Logs };

export const emptyData = (): AppData => ({ version: 1, habits: [], logs: {} });
