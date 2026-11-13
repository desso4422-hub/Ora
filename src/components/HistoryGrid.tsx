import { StyleSheet, Text, View } from 'react-native';
import { addDays, DAY_LETTER, startOfWeek, WEEK_ORDER } from '../dates';
import { cellState, type CellState } from '../stats';
import type { Habit, Logs } from '../types';
import { colors, fonts, radius, sizes } from '../theme';

const cellColor: Record<CellState, string> = { done: colors.green, missed: colors.historyRed, off: colors.notPlanned };

type Props = { habit: Habit; logs: Logs; today: string; cell: number };

/** 16 colonnes (semaines, lun → dim) × 7 lignes ; la dernière colonne est la semaine en cours. */
export function HistoryGrid({ habit, logs, today, cell }: Props) {
  const gap = sizes.historyGap;
  const first = addDays(startOfWeek(today), -7 * (sizes.historyWeeks - 1));
  let done = 0;
  let missed = 0;
  const cols = Array.from({ length: sizes.historyWeeks }, (_, w) =>
    Array.from({ length: 7 }, (_, d) => {
      const key = addDays(first, w * 7 + d);
      const s = cellState(habit, logs, key, today);
      if (s === 'done') done++;
      if (s === 'missed') missed++;
      return { key, s };
    }),
  );
  return (
    <View
      style={styles.row}
      accessible
      accessibilityLabel={`Grille des 16 dernières semaines : ${done} jours faits, ${missed} jours ratés`}
    >
      <View style={{ gap, width: 10 }}>
        {WEEK_ORDER.map((d, i) => (
          <Text key={i} style={[styles.letter, { height: cell, lineHeight: cell }]}>{DAY_LETTER[d]}</Text>
        ))}
      </View>
      <View style={{ flexDirection: 'row', gap }}>
        {cols.map((col, i) => (
          <View key={i} style={{ gap }}>
            {col.map(({ key, s }) => (
              <View key={key} style={{ width: cell, height: cell, borderRadius: radius.cell, backgroundColor: cellColor[s] }} />
            ))}
          </View>
        ))}
      </View>
    </View>
  );
}

export function HistoryLegend() {
  const items: [string, string][] = [[colors.green, 'Fait'], [colors.historyRed, 'Raté'], [colors.notPlanned, 'Non prévu']];
  return (
    <View style={styles.legend}>
      {items.map(([c, l]) => (
        <View key={l} style={styles.legendItem}>
          <View style={{ width: 12, height: 12, borderRadius: radius.cell, backgroundColor: c }} />
          <Text style={styles.legendText}>{l}</Text>
        </View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', gap: 8 },
  letter: { fontFamily: fonts.body, fontSize: 9, color: colors.textSecondary },
  legend: { flexDirection: 'row', gap: 16, alignItems: 'center' },
  legendItem: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  legendText: { fontFamily: fonts.body, fontSize: 11, color: colors.textSecondary },
});
