import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { Ring } from '../components/Ring';
import { ScreenHeader } from '../components/ScreenHeader';
import { DAY_FULL, DAY_SHORT, weekday, weekKeys } from '../dates';
import { dayCounts, dayScore, daysSinceStart, globalRate, rate30 } from '../stats';
import { useStore } from '../store';
import { colors, fonts, radius, rateColor, sizes, type } from '../theme';

type Props = { onOpenHistory: (habitId: string) => void; bottomPad: number };

const plural = (n: number, one: string, many: string) => `${n} ${n > 1 ? many : one}`;

export function StatsScreen({ onOpenHistory, bottomPad }: Props) {
  const { habits, data, today } = useStore();
  const { logs } = data;
  const since = daysSinceStart(habits, today);
  const global = globalRate(habits, logs, today);
  const counts = dayCounts(habits, logs, today);

  return (
    <ScrollView contentContainerStyle={{ paddingBottom: bottomPad + 24 }} showsVerticalScrollIndicator={false}>
      <ScreenHeader title="Statistiques" />

      <View style={[styles.row, { marginTop: 20 }]}>
        <View style={[styles.card, styles.sinceCard]} accessible accessibilityLabel={`${plural(since, 'jour', 'jours')} depuis le début`}>
          <Text style={styles.big}>{plural(since, 'jour', 'jours')}</Text>
          <Text style={[type.overline, { fontSize: 11, letterSpacing: 1.4, marginTop: 2 }]}>Depuis le début</Text>
        </View>
        <View style={[styles.card, styles.ringCard]}>
          <Ring pct={global.pct} />
        </View>
      </View>

      <View style={[styles.row, { marginTop: 12 }]}>
        <View style={[styles.pill, { backgroundColor: colors.redBgTo, borderColor: colors.redSoftBorder }]}>
          <Text style={[styles.pillText, { color: colors.redText }]}>{plural(counts.missed, 'jour raté', 'jours ratés')}</Text>
        </View>
        <View style={[styles.pill, { backgroundColor: colors.greenSoftBg, borderColor: colors.greenSoftBorder }]}>
          <Text style={[styles.pillText, { color: colors.green }]}>{plural(counts.complete, 'jour complet', 'jours complets')}</Text>
        </View>
      </View>

      <View style={[styles.card, styles.weekCard]}>
        <Text style={[type.overline, { marginBottom: 14 }]}>Cette semaine</Text>
        <View style={{ flexDirection: 'row' }}>
          {weekKeys(today).map((key) => {
            const s = dayScore(habits, logs, key);
            const show = key <= today && s.scheduled > 0;
            const wd = weekday(key);
            return (
              <View
                key={key}
                style={styles.barCol}
                accessible
                accessibilityLabel={`${DAY_FULL[wd]} : ${show ? `${s.pct} %` : 'rien de prévu'}`}
              >
                <View style={styles.barTrack}>
                  {show && s.pct > 0 && (
                    <View style={{ height: `${s.pct}%`, borderRadius: radius.bar, backgroundColor: rateColor(s.pct) }} />
                  )}
                </View>
                <Text style={styles.barLabel}>{DAY_SHORT[wd]}</Text>
              </View>
            );
          })}
        </View>
      </View>

      <View style={styles.list}>
        {habits.length === 0 && (
          <Text style={styles.empty}>Crée une habitude pour voir tes statistiques.</Text>
        )}
        {habits.map((h) => {
          const r = rate30(h, logs, today);
          const c = rateColor(r.pct);
          return (
            <Pressable
              key={h.id}
              onPress={() => onOpenHistory(h.id)}
              accessibilityRole="button"
              accessibilityLabel={`${h.name} : ${r.pct} % sur 30 jours. Voir l'historique`}
              style={({ pressed }) => [styles.habitRow, pressed && { opacity: 0.7 }]}
            >
              <Text style={styles.habitName} numberOfLines={1}>{h.name}</Text>
              <View style={styles.progressTrack}>
                <View style={{ width: `${r.pct}%`, height: sizes.progressH, borderRadius: sizes.progressH / 2, backgroundColor: c }} />
              </View>
              <Text style={[styles.habitPct, { color: c }]}>{r.pct}%</Text>
            </Pressable>
          );
        })}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', gap: 12, marginHorizontal: sizes.gutter },
  card: { borderRadius: radius.card, backgroundColor: colors.card, borderWidth: 1, borderColor: colors.cardBorder },
  sinceCard: { flex: 1, height: sizes.statCardH, alignItems: 'center', justifyContent: 'center' },
  ringCard: { width: sizes.statCardH, height: sizes.statCardH, alignItems: 'center', justifyContent: 'center' },
  big: { fontFamily: fonts.display, fontSize: 34, letterSpacing: -1, color: colors.text },
  pill: { flex: 1, height: sizes.statPillH, borderRadius: radius.button, borderWidth: 1, alignItems: 'center', justifyContent: 'center' },
  pillText: { fontFamily: fonts.bodyBold, fontSize: 14 },
  weekCard: { marginHorizontal: sizes.gutter, marginTop: 12, paddingTop: 18, paddingHorizontal: 16, paddingBottom: 14 },
  barCol: { flex: 1, alignItems: 'center', gap: 8 },
  barTrack: {
    width: sizes.weekBarW,
    height: sizes.weekBarH,
    borderRadius: radius.bar,
    backgroundColor: colors.track,
    justifyContent: 'flex-end',
    overflow: 'hidden',
  },
  barLabel: { fontFamily: fonts.body, fontSize: 10, letterSpacing: 1, color: colors.textSecondary },
  list: { gap: 8, marginHorizontal: sizes.gutter, marginTop: 12 },
  empty: { fontFamily: fonts.body, fontSize: 14, color: colors.textSecondary, textAlign: 'center', paddingVertical: 12 },
  habitRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    height: sizes.habitRowH,
    paddingHorizontal: 16,
    borderRadius: radius.button,
    backgroundColor: colors.card,
    borderWidth: 1,
    borderColor: colors.cardBorder,
  },
  habitName: { width: 112, fontFamily: fonts.bodySemi, fontSize: 14, color: colors.text },
  progressTrack: { flex: 1, height: sizes.progressH, borderRadius: sizes.progressH / 2, backgroundColor: colors.track, overflow: 'hidden' },
  habitPct: { width: 44, textAlign: 'right', fontFamily: fonts.bodySemi, fontSize: 14 },
});
