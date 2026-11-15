import { ScrollView, StyleSheet, Text, useWindowDimensions, View } from 'react-native';
import { HistoryGrid, Legend } from '../components/HistoryGrid';
import { ScreenHeader } from '../components/ScreenHeader';
import { addDays, startOfWeek } from '../dates';
import { bestStreak, cellState, currentStreak, dayLevel, rate30, type CellState, type DayLevel } from '../stats';
import { useStore } from '../store';
import { colors, fonts, radius, rateColor, sizes } from '../theme';

type Props = { focusId: string | null; onBack?: () => void; bottomPad: number };

const days = (n: number) => `${n} ${n > 1 ? 'jours' : 'jour'}`;
const cellColor: Record<CellState, string> = { done: colors.green, missed: colors.historyRed, off: colors.notPlanned };
const levelColor: Record<DayLevel, string> = { high: colors.green, mid: colors.amber, low: colors.historyRed, off: colors.notPlanned };

export function HistoryScreen({ focusId, onBack, bottomPad }: Props) {
  const { habits, data, today } = useStore();
  const { logs } = data;
  const { width } = useWindowDimensions();
  // Taille de case : 14 px, réduite si l'écran est trop étroit.
  const avail = width - sizes.gutter * 2 - 16 * 2 - 18 - sizes.historyGap * (sizes.historyWeeks - 1);
  const cell = Math.max(8, Math.min(sizes.historyCell, Math.floor(avail / sizes.historyWeeks)));

  // L'habitude choisie depuis Stats en premier, puis les autres.
  const ordered = focusId ? [...habits.filter((h) => h.id === focusId), ...habits.filter((h) => h.id !== focusId)] : habits;

  // Compte des journées sur la période affichée, pour la vue d'ensemble.
  const first = addDays(startOfWeek(today), -7 * (sizes.historyWeeks - 1));
  const counts: Record<DayLevel, number> = { high: 0, mid: 0, low: 0, off: 0 };
  for (let k = first; k <= today; k = addDays(k, 1)) counts[dayLevel(habits, logs, k, today)]++;

  return (
    <ScrollView contentContainerStyle={{ paddingBottom: bottomPad + 24 }} showsVerticalScrollIndicator={false}>
      <ScreenHeader title="Historique" subtitle="16 dernières semaines, une case par jour" onBack={onBack} />
      <View style={styles.list}>
        {habits.length === 0 ? (
          <Text style={styles.empty}>Aucune habitude pour l'instant. Appuie sur + pour créer la première.</Text>
        ) : (
          <>
            {!focusId && (
              <View style={styles.card}>
                <Text style={styles.name}>Vue d'ensemble</Text>
                <Text style={styles.streaks}>Score de chaque journée, toutes habitudes confondues</Text>
                <HistoryGrid
                  today={today}
                  cell={cell}
                  colorOf={(k) => levelColor[dayLevel(habits, logs, k, today)]}
                  accessibilityLabel={`Vue d'ensemble : ${days(counts.high)} à 70 % ou plus, ${days(counts.mid)} entre 40 et 69 %, ${days(counts.low)} sous 40 %`}
                />
                <View style={{ marginTop: 14 }}>
                  <Legend items={[[colors.green, '70 % et plus'], [colors.amber, '40 à 69 %'], [colors.historyRed, 'Moins de 40 %'], [colors.notPlanned, 'Rien de prévu']]} />
                </View>
              </View>
            )}
            {ordered.map((h) => {
              const r = rate30(h, logs, today);
              const c = rateColor(r.pct);
              let done = 0;
              let missed = 0;
              for (let k = first; k <= today; k = addDays(k, 1)) {
                const s = cellState(h, logs, k, today);
                if (s === 'done') done++;
                if (s === 'missed') missed++;
              }
              return (
                <View key={h.id} style={styles.card}>
                  <View style={styles.head}>
                    <Text style={styles.name} numberOfLines={1}>{h.emoji ? `${h.emoji}  ` : ''}{h.name}</Text>
                    <View style={[styles.pct, { borderColor: c }]} accessible accessibilityLabel={`${r.pct} % sur 30 jours`}>
                      <Text style={[styles.pctText, { color: c }]}>{r.pct}%</Text>
                    </View>
                  </View>
                  <Text style={styles.streaks}>
                    Série en cours : {days(currentStreak(h, logs, today))} · Record : {days(bestStreak(h, logs, today))}
                  </Text>
                  <HistoryGrid
                    today={today}
                    cell={cell}
                    colorOf={(k) => cellColor[cellState(h, logs, k, today)]}
                    accessibilityLabel={`${h.name}, 16 dernières semaines : ${days(done)} faits, ${days(missed)} ratés`}
                  />
                </View>
              );
            })}
            <Legend items={[[colors.green, 'Fait'], [colors.historyRed, 'Raté'], [colors.notPlanned, 'Non prévu']]} />
          </>
        )}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  list: { gap: 12, marginHorizontal: sizes.gutter, marginTop: 20 },
  card: { padding: 16, borderRadius: radius.card, backgroundColor: colors.card, borderWidth: 1, borderColor: colors.cardBorder },
  head: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', gap: 12 },
  name: { flex: 1, fontFamily: fonts.bodySemi, fontSize: 16, color: colors.text },
  pct: { paddingVertical: 4, paddingHorizontal: 12, borderRadius: radius.pill, borderWidth: 1 },
  pctText: { fontFamily: fonts.bodyBold, fontSize: 13 },
  streaks: { fontFamily: fonts.body, fontSize: 12, color: colors.textSecondary, marginTop: 6, marginBottom: 12 },
  empty: { fontFamily: fonts.body, fontSize: 15, lineHeight: 22, color: colors.textSecondary, textAlign: 'center', paddingVertical: 12 },
});
