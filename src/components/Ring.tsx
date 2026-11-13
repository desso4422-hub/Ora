import Svg, { Circle, Text as SvgText } from 'react-native-svg';
import { colors, fonts, sizes } from '../theme';

export function Ring({ pct, size = sizes.ring, stroke = sizes.ringStroke }: { pct: number; size?: number; stroke?: number }) {
  const r = (size - stroke) / 2;
  const c = size / 2;
  const circ = 2 * Math.PI * r;
  const len = (Math.max(0, Math.min(100, pct)) / 100) * circ;
  return (
    <Svg width={size} height={size} accessibilityRole="image" accessibilityLabel={`Taux global ${pct} %`}>
      <Circle cx={c} cy={c} r={r} fill="none" stroke={colors.track} strokeWidth={stroke} />
      {len > 0 && (
        <Circle
          cx={c} cy={c} r={r} fill="none" stroke={colors.green} strokeWidth={stroke}
          strokeLinecap="round" strokeDasharray={`${len} ${circ}`}
          transform={`rotate(-90 ${c} ${c})`}
        />
      )}
      <SvgText x={c} y={c + 7} textAnchor="middle" fontFamily={fonts.display} fontSize={20} fill={colors.text}>
        {`${pct}%`}
      </SvgText>
    </Svg>
  );
}
