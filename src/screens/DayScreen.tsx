import * as Haptics from 'expo-haptics';
import { useEffect } from 'react';
import { Platform, ScrollView, StyleSheet, Text, View } from 'react-native';
import { Flame } from '../components/Flame';
import { HabitCard } from '../components/HabitCard';
import { IconButton } from '../components/IconButton';
import { ScorePill } from '../components/ScorePill';
import { WeekStrip } from '../components/WeekStrip';
import { addDays, formatLongDate } from '../dates';
import { dayScore, dayStatus, isDone, isOverdue, longestCurrentStreak, scheduledHabits } from '../stats';
import { useStore } from '../store';
import type { Habit } from '../types';
import { colors, fonts, radius, sizes, type } from '../theme';

type Props = {
  selected: string;
  onSelect: (key: string) => void;
  onEdit: (h: Habit) => void;
  onSettings: () => void;
  bottomPad: number;
};

export function DayScreen({ selected, onSelect, onEdit, onSettings, bottomPad }: Props) {
  const { habits, data, today, now, toggle } = useStore();
  const { logs } = data;

  // Si le jour change pendant que l'app est ouverte, ne reste pas dans le futur.
  useEffect(() => {
    if (selected > today) onSelect(today);
  }, [selected, today, onSelect]);

  const streak = longestCurrentStreak(habits, logs, today);
  const score = dayScore(habits, logs, selected);
  const list = scheduledHabits(habits, selected);
  const isToday = selected === today;

  const onToggle = (h: Habit) => {
    if (Platform.OS !== 'web') {
      Haptics.impactAsync(isDone(logs, h.id, selected) ? Haptics.ImpactFeedbackStyle.Light : Haptics.ImpactFeedbackStyle.Medium).catch(() => {});
    }
    toggle(h.id, selected);
  };

  const dateLabel = formatLongDate(selected);

  return (
    <ScrollView contentContainerStyle={{ paddingBottom: bottomPad + 24 }} showsVerticalScrollIndicator={false}>
      <View style={styles.header}>
        <Text style={type.wordmark} accessibilityRole="header" accessibilityLabel="Ora">ora</Text>
        <View style={styles.headerRight}>
          <View
            style={styles.streak}
            accessible
            accessibilityLabel={`Plus longue série en cours : ${streak} ${streak > 1 ? 'jours' : 'jour'}`}
          >
            <Flame size={16} />
            <Text style={styles.streakText}>{streak} {streak > 1 ? 'jours' : 'jour'}</Text>
          </View>
          <IconButton icon="settings" label="Réglages" onPress={onSettings} color={colors.textSecondary} />
        </View>
      </View>

      <ScorePill score={score} isToday={isToday} />

      <View style={styles.dateNav}>
        <IconButton icon="chevron-left" label="Jour précédent" onPress={() => onSelect(addDays(selected, -1))} color={colors.textSecondary} />
        <Text
          style={[styles.dateText, isToday && { color: colors.text }]}
          onPress={isToday ? undefined : () => onSelect(today)}
          accessibilityRole={isToday ? 'text' : 'button'}
          accessibilityLabel={isToday ? `Aujourd'hui, ${dateLabel}` : `${dateLabel}. Revenir à aujourd'hui`}
        >
          {isToday ? `Aujourd'hui · ${dateLabel}` : dateLabel}
        </Text>
        <IconButton
          icon="chevron-right"
          label="Jour suivant"
          onPress={() => onSelect(addDays(selected, 1))}
          disabled={isToday}
          color={colors.textSecondary}
        />
      </View>

      <WeekStrip selected={selected} today={today} statusOf={(k) => dayStatus(habits, logs, k, today)} onSelect={onSelect} />

      <View style={styles.list}>
        {habits.length === 0 ? (
          <View style={styles.empty}>
            <Text style={styles.emptyText}>Aucune habitude pour l'instant. Appuie sur + pour créer la première.</Text>
          </View>
        ) : list.length === 0 ? (
          <View style={styles.empty}>
            <Text style={styles.emptyText}>Aucune habitude prévue ce jour.</Text>
          </View>
        ) : (
          list.map((h) => (
            <HabitCard
              key={h.id}
              habit={h}
              done={isDone(logs, h.id, selected)}
              overdue={isOverdue(h, logs, selected, now, today)}
              onToggle={() => onToggle(h)}
              onEdit={() => onEdit(h)}
            />
          ))
        )}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: sizes.gutter, paddingTop: 12 },
  headerRight: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  streak: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingVertical: 8,
    paddingHorizontal: 14,
    borderRadius: radius.pill,
    backgroundColor: colors.streakBg,
    borderWidth: 1,
    borderColor: colors.streakBorder,
  },
  streakText: { fontFamily: fonts.bodySemi, fontSize: 14, color: colors.streak },
  dateNav: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginHorizontal: sizes.gutter - 10, marginTop: 20 },
  dateText: { flex: 1, textAlign: 'center', fontFamily: fonts.bodyMedium, fontSize: 14, color: colors.textSecondary },
  list: { gap: 10, marginHorizontal: sizes.gutter, marginTop: 20 },
  empty: {
    padding: 20,
    borderRadius: radius.card,
    borderWidth: 1,
    borderStyle: 'dashed',
    borderColor: colors.outline,
    backgroundColor: colors.card,
  },
  emptyText: { fontFamily: fonts.body, fontSize: 15, lineHeight: 22, color: colors.textSecondary, textAlign: 'center' },
});
