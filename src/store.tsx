import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState, type ReactNode } from 'react';
import { AppState } from 'react-native';
import { todayKey } from './dates';
import { rescheduleAll, requestPermission } from './notifications';
import { sortHabits } from './stats';
import { loadData, saveData } from './storage';
import { emptyData, type AppData, type Habit } from './types';

export type HabitInput = Pick<Habit, 'name' | 'emoji' | 'days' | 'reminder'>;

type Store = {
  ready: boolean;
  data: AppData;
  habits: Habit[]; // triées par ordre
  today: string;
  now: Date;
  toggle: (habitId: string, key: string) => void;
  addHabit: (input: HabitInput) => void;
  updateHabit: (id: string, input: HabitInput) => void;
  deleteHabit: (id: string) => void;
  moveHabit: (id: string, dir: -1 | 1) => void;
  replaceAll: (data: AppData) => void;
};

const Ctx = createContext<Store | null>(null);

const newId = () => `${Date.now().toString(36)}${Math.random().toString(36).slice(2, 8)}`;

export function StoreProvider({ children }: { children: ReactNode }) {
  const [ready, setReady] = useState(false);
  const [data, setData] = useState<AppData>(emptyData);
  const [now, setNow] = useState(() => new Date());
  const loaded = useRef(false);

  useEffect(() => {
    loadData().then((d) => {
      setData(d);
      loaded.current = true;
      setReady(true);
    });
  }, []);

  // Sauvegarde à chaque changement.
  useEffect(() => {
    if (loaded.current) saveData(data).catch((e) => console.warn('[ora] sauvegarde', e));
  }, [data]);

  // Horloge : rafraîchit « en retard » et le changement de jour.
  useEffect(() => {
    const id = setInterval(() => setNow(new Date()), 30_000);
    const sub = AppState.addEventListener('change', (s) => s === 'active' && setNow(new Date()));
    return () => {
      clearInterval(id);
      sub.remove();
    };
  }, []);

  const commit = useCallback((next: AppData, reschedule: boolean, askPermission = false) => {
    setData(next);
    if (reschedule) {
      const go = askPermission ? requestPermission() : Promise.resolve(true);
      go.then(() => rescheduleAll(next.habits));
    }
  }, []);

  const dataRef = useRef(data);
  dataRef.current = data;

  const toggle = useCallback((habitId: string, key: string) => {
    if (key > todayKey()) return; // jamais les jours futurs
    setData((d) => {
      const entries = { ...(d.logs[habitId] ?? {}) };
      if (entries[key]) delete entries[key];
      else entries[key] = true;
      return { ...d, logs: { ...d.logs, [habitId]: entries } };
    });
  }, []);

  const addHabit = useCallback((input: HabitInput) => {
    const d = dataRef.current;
    const order = d.habits.reduce((m, h) => Math.max(m, h.order), -1) + 1;
    const habit: Habit = { ...input, id: newId(), createdAt: todayKey(), order };
    commit({ ...d, habits: [...d.habits, habit] }, true, input.reminder !== null);
  }, [commit]);

  const updateHabit = useCallback((id: string, input: HabitInput) => {
    const d = dataRef.current;
    commit({ ...d, habits: d.habits.map((h) => (h.id === id ? { ...h, ...input } : h)) }, true, input.reminder !== null);
  }, [commit]);

  const deleteHabit = useCallback((id: string) => {
    const d = dataRef.current;
    const logs = { ...d.logs };
    delete logs[id];
    commit({ ...d, habits: d.habits.filter((h) => h.id !== id), logs }, true);
  }, [commit]);

  const moveHabit = useCallback((id: string, dir: -1 | 1) => {
    const d = dataRef.current;
    const sorted = sortHabits(d.habits);
    const i = sorted.findIndex((h) => h.id === id);
    const j = i + dir;
    if (i < 0 || j < 0 || j >= sorted.length) return;
    [sorted[i], sorted[j]] = [sorted[j], sorted[i]];
    commit({ ...d, habits: sorted.map((h, order) => ({ ...h, order })) }, false);
  }, [commit]);

  const replaceAll = useCallback((next: AppData) => commit(next, true), [commit]);

  const value = useMemo<Store>(() => ({
    ready, data, habits: sortHabits(data.habits), today: todayKey(now), now,
    toggle, addHabit, updateHabit, deleteHabit, moveHabit, replaceAll,
  }), [ready, data, now, toggle, addHabit, updateHabit, deleteHabit, moveHabit, replaceAll]);

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export function useStore(): Store {
  const s = useContext(Ctx);
  if (!s) throw new Error('useStore hors de StoreProvider');
  return s;
}
