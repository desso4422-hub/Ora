import { Platform } from 'react-native';
import * as Notifications from 'expo-notifications';
import type { Habit } from './types';

export const CHANNEL_ID = 'ora-reminders';
const enabled = Platform.OS !== 'web';

const BODIES = [
  "C'est l'heure. Une coche de plus pour ta série.",
  "Petit rappel : c'est le moment.",
  'Garde le rythme, fais-le maintenant.',
];

export function configureNotifications(): void {
  if (!enabled) return;
  Notifications.setNotificationHandler({
    handleNotification: async () => ({
      shouldShowBanner: true,
      shouldShowList: true,
      shouldPlaySound: true,
      shouldSetBadge: false,
    }),
  });
}

async function ensureChannel(): Promise<void> {
  if (Platform.OS !== 'android') return;
  await Notifications.setNotificationChannelAsync(CHANNEL_ID, {
    name: 'Rappels des habitudes',
    importance: Notifications.AndroidImportance.HIGH,
    lightColor: '#3DDC84',
  });
}

export async function hasPermission(): Promise<boolean> {
  if (!enabled) return false;
  const s = await Notifications.getPermissionsAsync();
  return s.granted;
}

/** Demande l'autorisation (crée d'abord le canal : Android 13+ l'exige). */
export async function requestPermission(): Promise<boolean> {
  if (!enabled) return false;
  try {
    await ensureChannel();
    const current = await Notifications.getPermissionsAsync();
    if (current.granted) return true;
    if (!current.canAskAgain) return false;
    const res = await Notifications.requestPermissionsAsync();
    return res.granted;
  } catch (e) {
    console.warn('[ora] permission notifications', e);
    return false;
  }
}

/** Annule tout puis recrée une notification hebdomadaire par jour prévu et par habitude. */
export async function rescheduleAll(habits: Habit[]): Promise<void> {
  if (!enabled) return;
  try {
    await Notifications.cancelAllScheduledNotificationsAsync();
    const withReminder = habits.filter((h) => h.reminder);
    if (withReminder.length === 0) return;
    await ensureChannel();
    if (!(await hasPermission())) return;
    let i = 0;
    for (const h of withReminder) {
      const r = h.reminder!;
      for (const day of h.days) {
        await Notifications.scheduleNotificationAsync({
          content: {
            title: h.emoji ? `${h.emoji} ${h.name}` : h.name,
            body: BODIES[i++ % BODIES.length],
            data: { habitId: h.id },
          },
          trigger: {
            type: Notifications.SchedulableTriggerInputTypes.WEEKLY,
            weekday: day + 1, // Expo : 1 = dimanche
            hour: r.hour,
            minute: r.minute,
            channelId: CHANNEL_ID,
          },
        });
      }
    }
  } catch (e) {
    console.warn('[ora] planification des rappels', e);
  }
}
