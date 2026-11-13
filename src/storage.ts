import AsyncStorage from '@react-native-async-storage/async-storage';
import { validateBackup } from './backup';
import { emptyData, type AppData } from './types';

export const STORAGE_KEY = 'ora:data:v1';

export async function loadData(): Promise<AppData> {
  try {
    const raw = await AsyncStorage.getItem(STORAGE_KEY);
    if (!raw) return emptyData();
    const res = validateBackup(JSON.parse(raw));
    if (res.ok) return res.data;
    console.warn('[ora] données locales invalides :', res.error);
  } catch (e) {
    console.warn('[ora] lecture impossible', e);
  }
  return emptyData();
}

export async function saveData(data: AppData): Promise<void> {
  await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(data));
}
