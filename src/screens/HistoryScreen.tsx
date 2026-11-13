import { ScrollView, StyleSheet, Text, useWindowDimensions, View } from 'react-native';
import { HistoryGrid, HistoryLegend } from '../components/HistoryGrid';
import { ScreenHeader } from '../components/ScreenHeader';
import { bestStreak, currentStreak, rate30 } from '../stats';
import { useStore } from '../store';
import { colors, fonts, radius, rateColor, sizes } from '../theme';

type Props = { focusId: string | null; onBack: () => void; bottomPad: number };

const days = (n: number) => `${n} ${n > 1 ? 'jours' : 'jour'}`;

export function HistoryScreen({ focusId, onBack, bottomPad }: Props) {
  const { habits, data, today } = useStore();
  const { width } = useWindowDimensions();
  // Taille de case : 14 px, réduite si l'écran est trop étroit.
  const avail = width - sizes.gutter * 2 - 16 * 2 - 18 - sizes.historyGap * (sizes.historyWeeks - 1);
  const cell = Math.max(8, Math.min(sizes.historyCell, Math.floor(avail / sizes.historyWeeks)));

  // L'habitude choisie depuis Stats en premier, puis les autres.
  const ordered = focusId ? [...habits.filter((h) => h.id === focusId), ...habits.filter((h) => h.id !== focusId)] : habits;

  return (
    <ScrollView contentContainerStyle={{ paddingBottom: bottomPad + 24 }} showsVerticalScrollIndicator={false}>
      <ScreenHeader title="Historique" subtitle="16 dernières semaines, une case par jour" onBack={onBack} />
      <View style={styles.list}>
        {ordered.map((h) => {
          const r = rate30(h, data.logs, today);
          const c = rateColor(r.pct);
          return (
            <View key={h.id} style={[styles.card, h.id === focusId && { borderColor: colors.outline }]}>
              <View style={styles.head}>
                <Text style={styles.name} numberOfLines={1}>{h.emoji ? `${h.emoji}  ` : ''}{h.name}</Text>
                <View style={[styles.pct, { borderColor: c }]} accessible accessibilityLabel={`${r.pct} % sur 30 jours`}>
                  <Text style={[styles.pctText, { color: c }]}>{r.pct}%</Text>
                </View>
              </View>
              <Text style={styles.streaks}>
                Série en cours : {days(currentStreak(h, data.logs, today))} · Record : {days(bestStreak(h, data.logs, today))}
              </Text>
              <HistoryGrid habit={h} logs={data.logs} today={today} cell={cell} />
            </View>
          );
        })}
        {habits.length === 0 && <Text style={styles.streaks}>Aucune habitude pour l'instant.</Text>}
        <HistoryLegend />
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
});
