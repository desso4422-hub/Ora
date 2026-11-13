import Feather from '@expo/vector-icons/Feather';
import { useEffect, useState } from 'react';
import {
  Alert, KeyboardAvoidingView, Modal, Platform, Pressable, ScrollView, StyleSheet, Text, TextInput, View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { DAY_FULL, DAY_LETTER, WEEK_ORDER } from '../dates';
import type { HabitInput } from '../store';
import type { Habit } from '../types';
import { colors, fonts, radius, sizes, type } from '../theme';
import { IconButton } from './IconButton';

export const EMOJIS = [
  '💪', '🏃', '🚴', '🧘', '🏋️', '🚶', '📚', '📖', '✍️', '🎓',
  '💧', '🥗', '🍎', '🥦', '😴', '🛏️', '🙏', '🕌', '🧠', '💻',
  '🎯', '🧹', '💊', '🚿', '🦷', '🌞', '🎸', '💰', '📵', '❤️',
];

type Props = {
  visible: boolean;
  habit: Habit | null; // null = création
  onClose: () => void;
  onSave: (input: HabitInput) => void;
  onDelete: (id: string) => void;
};

const ALL_DAYS = [0, 1, 2, 3, 4, 5, 6];

export function HabitSheet({ visible, habit, onClose, onSave, onDelete }: Props) {
  const insets = useSafeAreaInsets();
  const [name, setName] = useState('');
  const [emoji, setEmoji] = useState('');
  const [days, setDays] = useState<number[]>(ALL_DAYS);
  const [remind, setRemind] = useState(false);
  const [hour, setHour] = useState(8);
  const [minute, setMinute] = useState(0);
  const [picker, setPicker] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!visible) return;
    setName(habit?.name ?? '');
    setEmoji(habit?.emoji ?? '');
    setDays(habit?.days ?? ALL_DAYS);
    setRemind(!!habit?.reminder);
    setHour(habit?.reminder?.hour ?? 8);
    setMinute(habit?.reminder?.minute ?? 0);
    setPicker(false);
    setError(null);
  }, [visible, habit]);

  const toggleDay = (d: number) =>
    setDays((cur) => (cur.includes(d) ? cur.filter((x) => x !== d) : [...cur, d].sort((a, b) => a - b)));

  const submit = () => {
    const n = name.trim();
    if (!n) return setError('Donne un nom à ton habitude.');
    if (days.length === 0) return setError('Choisis au moins un jour.');
    onSave({ name: n, emoji, days, reminder: remind ? { hour, minute } : null });
  };

  const confirmDelete = () => {
    if (!habit) return;
    Alert.alert(
      'Supprimer cette habitude ?',
      `« ${habit.name} » et tout son historique seront effacés. Cette action est définitive.`,
      [
        { text: 'Annuler', style: 'cancel' },
        { text: 'Supprimer', style: 'destructive', onPress: () => onDelete(habit.id) },
      ],
    );
  };

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose} statusBarTranslucent navigationBarTranslucent>
      <View style={styles.backdrop}>
        <Pressable style={{ height: sizes.sheetTop }} onPress={onClose} accessibilityLabel="Fermer" accessibilityRole="button" />
        <KeyboardAvoidingView style={styles.sheet} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
          <View style={styles.handle} />
          <View style={styles.titleRow}>
            <Text style={styles.title} accessibilityRole="header">
              {habit ? "Modifier l'habitude" : 'Nouvelle habitude'}
            </Text>
            <IconButton icon="x" label="Fermer" onPress={onClose} background={colors.track} size={18} />
          </View>

          <ScrollView
            style={{ flex: 1 }}
            contentContainerStyle={{ flexGrow: 1, paddingBottom: 24 + insets.bottom }}
            keyboardShouldPersistTaps="handled"
            showsVerticalScrollIndicator={false}
          >
            <Text style={[type.overline, styles.section]} nativeID="label-nom">Emoji et nom</Text>
            <View style={styles.nameRow}>
              <Pressable
                onPress={() => setPicker((p) => !p)}
                accessibilityRole="button"
                accessibilityLabel={emoji ? `Emoji choisi : ${emoji}. Changer d'emoji` : 'Choisir un emoji'}
                accessibilityState={{ expanded: picker }}
                style={styles.emojiBtn}
              >
                {emoji ? <Text style={{ fontSize: 26 }}>{emoji}</Text> : <Text style={styles.emojiHint}>Emoji</Text>}
              </Pressable>
              <TextInput
                value={name}
                onChangeText={(t) => { setName(t); setError(null); }}
                placeholder="Ex. Lecture 20 min"
                placeholderTextColor={colors.textSecondary}
                style={styles.input}
                maxLength={40}
                accessibilityLabel="Nom de l'habitude"
                accessibilityLabelledBy="label-nom"
                returnKeyType="done"
              />
            </View>

            {picker && (
              <View style={styles.emojiGrid}>
                {EMOJIS.map((e) => (
                  <Pressable
                    key={e}
                    onPress={() => { setEmoji(e === emoji ? '' : e); setPicker(false); }}
                    accessibilityRole="button"
                    accessibilityLabel={`Emoji ${e}`}
                    accessibilityState={{ selected: e === emoji }}
                    style={[styles.emojiCell, e === emoji && { borderColor: colors.green, backgroundColor: colors.greenSoftBg }]}
                  >
                    <Text style={{ fontSize: 22 }}>{e}</Text>
                  </Pressable>
                ))}
              </View>
            )}

            <Text style={[type.overline, styles.section]}>Jours prévus</Text>
            <View style={styles.daysRow}>
              {WEEK_ORDER.map((d) => {
                const on = days.includes(d);
                return (
                  <Pressable
                    key={d}
                    onPress={() => { toggleDay(d); setError(null); }}
                    accessibilityRole="togglebutton"
                    accessibilityLabel={DAY_FULL[d]}
                    accessibilityState={{ selected: on, checked: on }}
                    aria-pressed={on}
                    style={[styles.dayChip, on ? styles.dayOn : styles.dayOff]}
                  >
                    <Text style={[styles.dayText, { color: on ? colors.onGreen : colors.textSecondary, fontFamily: on ? fonts.bodyBold : fonts.bodySemi }]}>
                      {DAY_LETTER[d]}
                    </Text>
                  </Pressable>
                );
              })}
            </View>

            <View style={[styles.reminderRow, styles.section]}>
              <Text style={type.overline}>Rappel</Text>
              <Pressable
                onPress={() => setRemind((r) => !r)}
                accessibilityRole="switch"
                accessibilityLabel="Rappel"
                accessibilityState={{ checked: remind }}
                hitSlop={8}
                style={[styles.switch, { backgroundColor: remind ? colors.green : colors.outline, justifyContent: remind ? 'flex-end' : 'flex-start' }]}
              >
                <View style={[styles.knob, { backgroundColor: remind ? colors.onGreen : colors.textSecondary }]} />
              </Pressable>
            </View>

            {remind && (
              <>
                <View style={styles.timeBox}>
                  <TimeBlock label="Heures" value={hour} onChange={(v) => setHour((v + 24) % 24)} step={1} />
                  <Text style={styles.colon}>:</Text>
                  <TimeBlock label="Minutes" value={minute} onChange={(v) => setMinute((v + 60) % 60)} step={5} />
                </View>
                <Text style={styles.note}>Notification locale, chaque jour prévu à cette heure.</Text>
              </>
            )}

            <View style={{ flex: 1, minHeight: 24 }} />

            {error && <Text style={styles.error} accessibilityLiveRegion="polite">{error}</Text>}

            <Pressable
              onPress={submit}
              accessibilityRole="button"
              style={({ pressed }) => [styles.primary, pressed && { opacity: 0.85 }]}
            >
              <Text style={styles.primaryText}>{habit ? 'Enregistrer' : 'Ajouter à ma routine'}</Text>
            </Pressable>
            {habit && (
              <Pressable
                onPress={confirmDelete}
                accessibilityRole="button"
                style={({ pressed }) => [styles.danger, pressed && { opacity: 0.7 }]}
              >
                <Feather name="trash-2" size={18} color={colors.red} />
                <Text style={styles.dangerText}>Supprimer</Text>
              </Pressable>
            )}
          </ScrollView>
        </KeyboardAvoidingView>
      </View>
    </Modal>
  );
}

function TimeBlock({ label, value, onChange, step }: { label: string; value: number; onChange: (v: number) => void; step: number }) {
  const shown = String(value).padStart(2, '0');
  return (
    <View
      style={styles.timeCol}
      accessible
      accessibilityRole="adjustable"
      accessibilityLabel={label}
      accessibilityValue={{ text: shown }}
      accessibilityActions={[{ name: 'increment' }, { name: 'decrement' }]}
      onAccessibilityAction={(e) => onChange(value + (e.nativeEvent.actionName === 'increment' ? step : -step))}
    >
      <IconButton icon="chevron-up" label={`${label} plus`} onPress={() => onChange(value + step)} color={colors.textSecondary} />
      <View style={styles.timeBlock}>
        <Text style={styles.timeText}>{shown}</Text>
      </View>
      <IconButton icon="chevron-down" label={`${label} moins`} onPress={() => onChange(value - step)} color={colors.textSecondary} />
    </View>
  );
}

const styles = StyleSheet.create({
  backdrop: { flex: 1, backgroundColor: colors.backdrop },
  sheet: {
    flex: 1,
    backgroundColor: colors.bar,
    borderTopLeftRadius: radius.sheet,
    borderTopRightRadius: radius.sheet,
    borderTopWidth: 1,
    borderColor: colors.outline,
    paddingHorizontal: sizes.gutter,
    paddingTop: 20,
  },
  handle: { width: sizes.handleW, height: sizes.handleH, borderRadius: 3, backgroundColor: colors.outline, alignSelf: 'center' },
  titleRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 18 },
  title: { fontFamily: fonts.display, fontSize: 26, letterSpacing: -0.5, color: colors.text, flex: 1 },
  section: { marginTop: 24, marginBottom: 8 },
  nameRow: { flexDirection: 'row', gap: 10 },
  emojiBtn: {
    width: sizes.emojiButton,
    height: sizes.emojiButton,
    borderRadius: radius.button,
    borderWidth: 1,
    borderStyle: 'dashed',
    borderColor: colors.green,
    backgroundColor: colors.greenSoftBg,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emojiHint: { fontFamily: fonts.bodySemi, fontSize: 11, color: colors.green },
  input: {
    flex: 1,
    minWidth: 0,
    height: sizes.input,
    paddingHorizontal: 16,
    borderRadius: radius.button,
    borderWidth: 1,
    borderColor: colors.outline,
    backgroundColor: colors.card,
    color: colors.text,
    fontFamily: fonts.body,
    fontSize: 16,
  },
  emojiGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
    marginTop: 10,
    padding: 10,
    borderRadius: 20,
    backgroundColor: colors.card,
    borderWidth: 1,
    borderColor: colors.cardBorder,
  },
  emojiCell: {
    width: sizes.touch,
    height: sizes.touch,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: 'transparent',
  },
  daysRow: { flexDirection: 'row', justifyContent: 'space-between' },
  dayChip: { width: sizes.dayChip, height: sizes.dayChip, borderRadius: sizes.dayChip / 2, alignItems: 'center', justifyContent: 'center' },
  dayOn: { backgroundColor: colors.green },
  dayOff: { borderWidth: 1, borderColor: colors.outline, backgroundColor: colors.card },
  dayText: { fontSize: 14 },
  reminderRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 0 },
  switch: { width: 52, height: 30, borderRadius: 15, padding: 3, flexDirection: 'row' },
  knob: { width: 24, height: 24, borderRadius: 12 },
  timeBox: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
    marginTop: 14,
    paddingVertical: 4,
    borderRadius: 20,
    backgroundColor: colors.card,
    borderWidth: 1,
    borderColor: colors.cardBorder,
  },
  timeCol: { alignItems: 'center' },
  timeBlock: {
    width: sizes.timeBlockW,
    height: sizes.timeBlockH,
    borderRadius: 16,
    backgroundColor: colors.track,
    alignItems: 'center',
    justifyContent: 'center',
  },
  timeText: { fontFamily: fonts.display, fontSize: 36, color: colors.text },
  colon: { fontFamily: fonts.display, fontSize: 30, color: colors.textSecondary },
  note: { fontFamily: fonts.body, fontSize: 12, color: colors.textSecondary, marginTop: 10, textAlign: 'center' },
  error: { fontFamily: fonts.bodySemi, fontSize: 14, color: colors.redText, textAlign: 'center', marginBottom: 12 },
  primary: {
    height: sizes.primaryButton,
    borderRadius: radius.button,
    backgroundColor: colors.green,
    alignItems: 'center',
    justifyContent: 'center',
  },
  primaryText: { fontFamily: fonts.bodyBold, fontSize: 16, color: colors.onGreen },
  danger: {
    flexDirection: 'row',
    gap: 8,
    height: sizes.primaryButton,
    marginTop: 10,
    borderRadius: radius.button,
    borderWidth: 1,
    borderColor: colors.redSoftBorder,
    backgroundColor: colors.redBgTo,
    alignItems: 'center',
    justifyContent: 'center',
  },
  dangerText: { fontFamily: fonts.bodyBold, fontSize: 16, color: colors.red },
});
