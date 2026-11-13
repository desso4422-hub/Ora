import Feather from '@expo/vector-icons/Feather';
import { LinearGradient } from 'expo-linear-gradient';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { formatTime } from '../dates';
import type { Habit } from '../types';
import { colors, fonts, radius, sizes, type } from '../theme';
import { daysSummary } from './daysSummary';

type Props = {
  habit: Habit;
  done: boolean;
  overdue: boolean;
  onToggle: () => void;
  onEdit: () => void;
};

export function HabitCard({ habit, done, overdue, onToggle, onEdit }: Props) {
  const tone = done ? 'done' : overdue ? 'late' : 'neutral';
  const sub = habit.reminder
    ? formatTime(habit.reminder.hour, habit.reminder.minute) + (overdue ? ' · en retard' : '')
    : daysSummary(habit.days);

  const inner = (
    <>
      <View style={[styles.medal, { backgroundColor: tone === 'done' ? colors.greenMedal : tone === 'late' ? colors.redMedal : colors.track }]}>
        {habit.emoji ? (
          <Text style={styles.emoji}>{habit.emoji}</Text>
        ) : (
          <Text style={styles.initial}>{habit.name.charAt(0).toUpperCase()}</Text>
        )}
      </View>
      <View style={styles.texts}>
        <Text style={type.habitName} numberOfLines={1}>{habit.name}</Text>
        <Text style={[styles.sub, overdue && { color: colors.redText }]} numberOfLines={1}>{sub}</Text>
      </View>
      <View
        style={[
          styles.check,
          done ? { backgroundColor: colors.green, borderWidth: 0 }
            : overdue ? { borderColor: colors.red } : { borderColor: colors.outline },
        ]}
      >
        {done ? <Feather name="check" size={22} color={colors.onGreen} />
          : overdue ? <Feather name="x" size={20} color={colors.red} /> : null}
      </View>
    </>
  );

  return (
    <Pressable
      onPress={onToggle}
      onLongPress={onEdit}
      accessibilityRole="checkbox"
      accessibilityState={{ checked: done }}
      accessibilityLabel={`${habit.name} : ${done ? 'faite' : overdue ? 'non faite, en retard' : 'non faite'}`}
      accessibilityHint="Appui pour cocher ou décocher, appui long pour modifier"
      accessibilityActions={[{ name: 'longpress', label: 'Modifier' }]}
      onAccessibilityAction={(e) => e.nativeEvent.actionName === 'longpress' && onEdit()}
      style={({ pressed }) => [pressed && { opacity: 0.85, transform: [{ scale: 0.99 }] }]}
    >
      {tone === 'neutral' ? (
        <View style={[styles.card, { backgroundColor: colors.card, borderColor: colors.cardBorder }]}>{inner}</View>
      ) : (
        <LinearGradient
          colors={tone === 'done' ? [colors.greenBgFrom, colors.greenBgTo] : [colors.redBgFrom, colors.redBgTo]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
          style={[styles.card, { borderColor: tone === 'done' ? colors.green : colors.red }]}
        >
          {inner}
        </LinearGradient>
      )}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    height: sizes.habitCardH,
    paddingLeft: sizes.habitCardPad,
    paddingRight: 12,
    borderRadius: radius.card,
    borderWidth: 1.5,
    overflow: 'hidden',
  },
  medal: {
    width: sizes.medallion,
    height: sizes.medallion,
    borderRadius: sizes.medallion / 2,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emoji: { fontSize: 20 },
  initial: { fontFamily: fonts.display, fontSize: 18, color: colors.text },
  texts: { flex: 1 },
  sub: { fontFamily: fonts.body, fontSize: 12, color: colors.textSecondary, marginTop: 2 },
  check: {
    width: sizes.checkButton,
    height: sizes.checkButton,
    borderRadius: sizes.checkButton / 2,
    borderWidth: 2,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
