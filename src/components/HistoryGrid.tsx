import { StyleSheet, Text, View } from 'react-native';
import { addDays, DAY_LETTER, startOfWeek, WEEK_ORDER } from '../dates';
import { colors, fonts, radius, sizes } from '../theme';

type Props = {
  today: string;
  cell: number;
  /** Couleur de la case d'un jour. */
  colorOf: (key: string) => string;
  accessibilityLabel: string;
};

/** 16 colonnes (semaines, lun → dim) × 7 lignes ; la dernière colonne est la semaine en cours. */
export function HistoryGrid({ today, cell, colorOf, accessibilityLabel }: Props) {
  const gap = sizes.historyGap;
  const first = addDays(startOfWeek(today), -7 * (sizes.historyWeeks - 1));
  const cols = Array.from({ length: sizes.historyWeeks }, (_, w) =>
    Array.from({ length: 7 }, (_, d) => addDays(first, w * 7 + d)),
  );
  return (
    <View style={styles.row} accessible accessibilityLabel={accessibilityLabel}>
      <View style={{ gap, width: 10 }}>
        {WEEK_ORDER.map((d, i) => (
          <Text key={i} style={[styles.letter, { height: cell, lineHeight: cell }]}>{DAY_LETTER[d]}</Text>
        ))}
      </View>
      <View style={{ flexDirection: 'row', gap }}>
        {cols.map((col, i) => (
          <View key={i} style={{ gap }}>
            {col.map((key) => (
              <View key={key} style={{ width: cell, height: cell, borderRadius: radius.cell, backgroundColor: colorOf(key) }} />
            ))}
          </View>
        ))}
      </View>
    </View>
  );
}

export function Legend({ items }: { items: [string, string][] }) {
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
  legend: { flexDirection: 'row', flexWrap: 'wrap', columnGap: 16, rowGap: 8, alignItems: 'center' },
  legendItem: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  legendText: { fontFamily: fonts.body, fontSize: 11, color: colors.textSecondary },
});
