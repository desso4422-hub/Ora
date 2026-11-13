// Export / import de fichiers (dépend d'Expo ; la validation pure est dans backup.ts).
import { File, Paths } from 'expo-file-system';
import * as Sharing from 'expo-sharing';
import * as DocumentPicker from 'expo-document-picker';
import { backupFileName, parseBackup, type ValidationResult } from './backup';
import { todayKey } from './dates';
import type { AppData } from './types';

export async function exportBackup(data: AppData): Promise<void> {
  const file = new File(Paths.cache, backupFileName(todayKey()));
  if (file.exists) file.delete();
  file.create();
  await file.write(JSON.stringify(data, null, 2));
  if (!(await Sharing.isAvailableAsync())) {
    throw new Error("Le partage n'est pas disponible sur cet appareil.");
  }
  await Sharing.shareAsync(file.uri, {
    mimeType: 'application/json',
    dialogTitle: 'Exporter la sauvegarde Ora',
  });
}

/** Ouvre le sélecteur, lit et valide le fichier. `null` si l'utilisateur annule. */
export async function pickBackup(): Promise<ValidationResult | null> {
  const res = await DocumentPicker.getDocumentAsync({
    type: ['application/json', 'text/plain', '*/*'],
    copyToCacheDirectory: true,
    multiple: false,
  });
  if (res.canceled || !res.assets?.[0]) return null;
  try {
    const text = await new File(res.assets[0].uri).text();
    return parseBackup(text);
  } catch {
    return { ok: false, error: 'Impossible de lire ce fichier.' };
  }
}
