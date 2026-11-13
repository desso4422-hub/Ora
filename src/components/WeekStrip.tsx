import { Pressable, StyleSheet, Text, View } from 'react-native';
import { DAY_FULL, DAY_SHORT, fromKey, weekday, weekKeys } from '../dates';
import type { DayStatus } from '../stats';
import { colors, fonts, sizes } from '../theme';

type Props = {
  selected: string;
  today: string;
  statusOf: (key: string) => DayStatus;
  onSelect: (key: string) => void;
};

const dotColor: Record<DayStatus, string> = { complete: colors.green, missed: colors.red, none: colors.outline };
const statusLabel: Record<DayStatus, string> = { complete: 'journée complète', missed: 'habitude ratée', none: '' };

export function WeekStrip({ selected, today, statusOf, onSelect }: Props) {
  return (
    <View style={styles.row}>
      {weekKeys(selected).map((key) => {
        const future = key > today;
        const isSel = key === selected;
        const wd = weekday(key);
        const status = statusOf(key);
        const label = [DAY_FULL[wd], fromKey(key).getDate(), key === today ? "aujourd'hui" : '', statusLabel[status]]
          .filter(Boolean).join(', ');
        return (
          <Pressable
            key={key}
            disabled={future}
            onPress={() => onSelect(key)}
            accessibilityRole="button"
            accessibilityLabel={label}
            accessibilityState={{ selected: isSel, disabled: future }}
            style={[styles.cell, isSel && styles.cellSel, future && { opacity: 0.45 }]}
          >
            <Text style={[styles.dayName, isSel && { color: colors.green }]}>{DAY_SHORT[wd]}</Text>
            <Text style={[styles.dayNum, isSel && { fontFamily: fonts.bodyBold }]}>{fromKey(key).getDate()}</Text>
            <View style={[styles.dot, { backgroundColor: dotColor[status] }]} />
          </Pressable>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', gap: 6, marginHorizontal: sizes.gutter, marginTop: 8 },
  cell: {
    flex: 1,
    alignItems: 'center',
    gap: 4,
    paddingVertical: 8,
    minHeight: sizes.touch,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: 'transparent',
  },
  cellSel: { backgroundColor: colors.track, borderColor: colors.green },
  dayName: { fontFamily: fonts.body, fontSize: 10, letterSpacing: 1, color: colors.textSecondary },
  dayNum: { fontFamily: fonts.bodySemi, fontSize: 15, color: colors.text },
  dot: { width: 6, height: 6, borderRadius: 3 },
});
