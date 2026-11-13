import { Alert, ScrollView, StyleSheet, Text, View } from 'react-native';
import { IconButton } from '../components/IconButton';
import { ScreenHeader } from '../components/ScreenHeader';
import { daysSummary } from '../components/daysSummary';
import { useStore } from '../store';
import type { Habit } from '../types';
import { colors, fonts, radius, sizes } from '../theme';

type Props = { onBack: () => void; onEdit: (h: Habit) => void; bottomPad: number };

export function ManageScreen({ onBack, onEdit, bottomPad }: Props) {
  const { habits, moveHabit, deleteHabit } = useStore();

  const confirmDelete = (h: Habit) =>
    Alert.alert(
      'Supprimer cette habitude ?',
      `« ${h.name} » et tout son historique seront effacés. Cette action est définitive.`,
      [
        { text: 'Annuler', style: 'cancel' },
        { text: 'Supprimer', style: 'destructive', onPress: () => deleteHabit(h.id) },
      ],
    );

  return (
    <ScrollView contentContainerStyle={{ paddingBottom: bottomPad + 24 }} showsVerticalScrollIndicator={false}>
      <ScreenHeader title="Gérer les habitudes" onBack={onBack} />
      <View style={styles.list}>
        {habits.length === 0 && <Text style={styles.empty}>Aucune habitude pour l'instant.</Text>}
        {habits.map((h, i) => (
          <View key={h.id} style={styles.row}>
            <View style={{ flex: 1 }}>
              <Text style={styles.name} numberOfLines={1}>{h.emoji ? `${h.emoji}  ` : ''}{h.name}</Text>
              <Text style={styles.sub} numberOfLines={1}>{daysSummary(h.days)}</Text>
            </View>
            <IconButton icon="arrow-up" label={`Monter ${h.name}`} onPress={() => moveHabit(h.id, -1)} disabled={i === 0} color={colors.textSecondary} />
            <IconButton icon="arrow-down" label={`Descendre ${h.name}`} onPress={() => moveHabit(h.id, 1)} disabled={i === habits.length - 1} color={colors.textSecondary} />
            <IconButton icon="edit-2" label={`Modifier ${h.name}`} onPress={() => onEdit(h)} color={colors.text} size={18} />
            <IconButton icon="trash-2" label={`Supprimer ${h.name}`} onPress={() => confirmDelete(h)} color={colors.red} size={18} />
          </View>
        ))}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  list: { gap: 10, marginHorizontal: sizes.gutter, marginTop: 20 },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    minHeight: sizes.settingsRowMin,
    paddingLeft: 16,
    paddingRight: 4,
    borderRadius: radius.row,
    backgroundColor: colors.card,
    borderWidth: 1,
    borderColor: colors.cardBorder,
  },
  name: { fontFamily: fonts.bodySemi, fontSize: 15, color: colors.text },
  sub: { fontFamily: fonts.body, fontSize: 12, color: colors.textSecondary, marginTop: 2 },
  empty: { fontFamily: fonts.body, fontSize: 14, color: colors.textSecondary, textAlign: 'center', paddingVertical: 12 },
});
