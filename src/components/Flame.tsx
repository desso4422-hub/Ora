import Svg, { Path } from 'react-native-svg';
import { colors } from '../theme';

/** Flamme au trait (style Feather, absente du jeu Feather d'origine). */
export function Flame({ size = 16, color = colors.streak }: { size?: number; color?: string }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
      <Path d="M12 3c1 4 5 5 5 10a5 5 0 0 1-10 0c0-2 1-3 2-4 0 2 1 3 2 3 0-3-1-5 1-9z" />
    </Svg>
  );
}
