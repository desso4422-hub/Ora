import { LinearGradient } from 'expo-linear-gradient';
import { StyleSheet, Text, View } from 'react-native';
import type { Ratio } from '../stats';
import { colors, radius, sizes, type } from '../theme';

type Props = { score: Ratio; isToday: boolean };

export function ScorePill({ score, isToday }: Props) {
  const empty = score.scheduled === 0;
  return (
    <View style={styles.wrap} accessible accessibilityLabel={
      empty ? 'Score 0 %, rien de prévu ce jour' : `Score ${score.pct} %, ${score.done} sur ${score.scheduled} habitudes faites`
    }>
      <View style={styles.halo}>
        <LinearGradient colors={[colors.greenBgFrom, colors.greenPillTo]} style={styles.pill}>
          <Text style={type.score}>{score.pct}%</Text>
        </LinearGradient>
      </View>
      {empty ? (
        <Text style={styles.count}>Rien de prévu ce jour</Text>
      ) : (
        <>
          <Text style={styles.count}>{score.done} sur {score.scheduled}</Text>
          <Text style={styles.caption}>{isToday ? "Habitudes faites aujourd'hui" : 'Habitudes faites ce jour'}</Text>
        </>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { alignItems: 'center', marginTop: 28 },
  halo: {
    borderRadius: radius.pill,
    boxShadow: `0 0 ${sizes.scoreHalo}px ${colors.greenHalo}`,
  },
  pill: {
    width: sizes.scorePillW,
    height: sizes.scorePillH,
    borderRadius: radius.pill,
    borderWidth: 1.5,
    borderColor: colors.green,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  count: { ...type.body, fontFamily: 'Inter_600SemiBold', fontSize: 22, marginTop: 16 },
  caption: { ...type.overline, fontSize: 11, letterSpacing: 1.4, marginTop: 2 },
});
