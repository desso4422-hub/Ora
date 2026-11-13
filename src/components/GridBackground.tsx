import { StyleSheet, View } from 'react-native';
import Svg, { Defs, Path, Pattern, Rect } from 'react-native-svg';
import { colors, sizes } from '../theme';

/** Fond sombre avec une grille très discrète (1 px, blanc 3 %, cases de 32 px). */
export function GridBackground() {
  const s = sizes.gridCell;
  return (
    <View style={[StyleSheet.absoluteFill, { backgroundColor: colors.bg }]} pointerEvents="none">
      <Svg width="100%" height="100%">
        <Defs>
          <Pattern id="ora-grid" width={s} height={s} patternUnits="userSpaceOnUse">
            <Path d={`M ${s} 0 L 0 0 0 ${s}`} stroke={colors.gridLine} strokeWidth={1} fill="none" />
          </Pattern>
        </Defs>
        <Rect width="100%" height="100%" fill="url(#ora-grid)" />
      </Svg>
    </View>
  );
}
