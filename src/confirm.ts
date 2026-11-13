import { Alert, Platform } from 'react-native';

/** Boîte de confirmation (Alert natif ; window.confirm sur le web où Alert n'a pas de boutons). */
export function confirm(title: string, message: string, okText: string, onOk: () => void): void {
  if (Platform.OS === 'web') {
    if (globalThis.confirm?.(`${title}\n\n${message}`)) onOk();
    return;
  }
  Alert.alert(title, message, [
    { text: 'Annuler', style: 'cancel' },
    { text: okText, style: 'destructive', onPress: onOk },
  ]);
}

/** Message d'information simple. */
export function notify(title: string, message: string): void {
  if (Platform.OS === 'web') {
    globalThis.alert?.(`${title}\n\n${message}`);
    return;
  }
  Alert.alert(title, message);
}
