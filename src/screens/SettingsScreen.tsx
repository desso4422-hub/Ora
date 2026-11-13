import Feather from '@expo/vector-icons/Feather';
import { useEffect, useState } from 'react';
import { Alert, Linking, Platform, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { confirm, notify } from '../confirm';
import { ScreenHeader } from '../components/ScreenHeader';
import { exportBackup, pickBackup } from '../backupIO';
import { hasPermission, requestPermission, rescheduleAll } from '../notifications';
import { useStore } from '../store';
import { colors, fonts, radius, sizes } from '../theme';

type Props = { onBack: () => void; onManage: () => void; bottomPad: number };

export function SettingsScreen({ onBack, onManage, bottomPad }: Props) {
  const { data, habits, replaceAll } = useStore();
  const [granted, setGranted] = useState<boolean | null>(null);

  useEffect(() => {
    hasPermission().then(setGranted).catch(() => setGranted(false));
  }, []);

  const onNotifications = async () => {
    if (Platform.OS === 'web') {
      notify('Notifications', "Les rappels ne fonctionnent que sur l'application Android.");
      return;
    }
    const ok = await requestPermission();
    setGranted(ok);
    if (ok) {
      await rescheduleAll(habits);
      notify('Rappels autorisés', 'Tes rappels seront envoyés aux heures choisies.');
    } else {
      Alert.alert(
        'Autorisation refusée',
        'Active les notifications pour Ora dans les réglages Android.',
        [
          { text: 'Plus tard', style: 'cancel' },
          { text: 'Ouvrir les réglages', onPress: () => Linking.openSettings() },
        ],
      );
    }
  };

  const onExport = async () => {
    try {
      await exportBackup(data);
    } catch (e) {
      notify('Export impossible', e instanceof Error ? e.message : "Une erreur s'est produite.");
    }
  };

  const onImport = async () => {
    try {
      const res = await pickBackup();
      if (!res) return;
      if (!res.ok) {
        notify('Fichier invalide', res.error);
        return;
      }
      const n = res.data.habits.length;
      confirm(
        'Remplacer tes données ?',
        `Ce fichier contient ${n} ${n > 1 ? 'habitudes' : 'habitude'}. Tes habitudes et ton historique actuels seront entièrement remplacés.`,
        'Remplacer',
        () => {
          replaceAll(res.data);
          notify('Import terminé', 'Tes données ont été restaurées.');
        },
      );
    } catch {
      notify('Import impossible', "Le fichier n'a pas pu être ouvert.");
    }
  };

  return (
    <ScrollView contentContainerStyle={{ paddingBottom: bottomPad + 24 }} showsVerticalScrollIndicator={false}>
      <ScreenHeader title="Réglages" onBack={onBack} />
      <View style={styles.banner}>
        <Feather name="shield" size={18} color={colors.greenSoftText} />
        <Text style={styles.bannerText}>
          Tes données restent sur ce téléphone. Pas de compte, pas de serveur, aucune connexion nécessaire.
        </Text>
      </View>
      <View style={styles.list}>
        <Row
          icon="bell"
          title="Notifications"
          subtitle={granted ? 'Rappels autorisés' : 'Autoriser les rappels'}
          onPress={onNotifications}
        />
        <Row icon="upload" title="Exporter une sauvegarde" subtitle="Fichier JSON à partager ou à garder" onPress={onExport} />
        <Row icon="download" title="Importer une sauvegarde" subtitle="Remplace les données actuelles" onPress={onImport} />
        <Row icon="list" title="Gérer les habitudes" subtitle="Modifier, réordonner, supprimer" onPress={onManage} />
      </View>
      <Text style={styles.footer}>Ora v1.0 · com.desso.ora</Text>
    </ScrollView>
  );
}

function Row({ icon, title, subtitle, onPress }: {
  icon: React.ComponentProps<typeof Feather>['name']; title: string; subtitle: string; onPress: () => void;
}) {
  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={`${title}. ${subtitle}`}
      style={({ pressed }) => [styles.row, pressed && { opacity: 0.7 }]}
    >
      <Feather name={icon} size={20} color={colors.textSecondary} />
      <View style={{ flex: 1 }}>
        <Text style={styles.rowTitle}>{title}</Text>
        <Text style={styles.rowSub}>{subtitle}</Text>
      </View>
      <Feather name="chevron-right" size={18} color={colors.textSecondary} />
    </Pressable>
  );
}

const styles = StyleSheet.create({
  banner: {
    flexDirection: 'row',
    gap: 12,
    marginHorizontal: sizes.gutter,
    marginTop: 16,
    padding: 16,
    borderRadius: radius.row,
    backgroundColor: colors.greenSoftBg,
    borderWidth: 1,
    borderColor: colors.greenSoftBorder,
  },
  bannerText: { flex: 1, fontFamily: fonts.body, fontSize: 13, lineHeight: 20, color: colors.greenSoftText },
  list: { gap: 10, marginHorizontal: sizes.gutter, marginTop: 16 },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    minHeight: sizes.settingsRowMin,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: radius.row,
    backgroundColor: colors.card,
    borderWidth: 1,
    borderColor: colors.cardBorder,
  },
  rowTitle: { fontFamily: fonts.bodySemi, fontSize: 15, color: colors.text },
  rowSub: { fontFamily: fonts.body, fontSize: 12, color: colors.textSecondary, marginTop: 2 },
  footer: { textAlign: 'center', marginTop: 24, fontFamily: fonts.body, fontSize: 12, color: colors.textSecondary },
});
