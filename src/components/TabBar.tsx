import Feather from '@expo/vector-icons/Feather';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { colors, fonts, sizes } from '../theme';

export type Tab = 'day' | 'stats';

type Props = { active: Tab | null; onTab: (t: Tab) => void; onAdd: () => void };

export function TabBar({ active, onTab, onAdd }: Props) {
  const insets = useSafeAreaInsets();
  return (
    <View style={[styles.bar, { height: sizes.tabBarH + insets.bottom, paddingBottom: 8 + insets.bottom }]}>
      <TabItem icon="home" label="Jour" active={active === 'day'} onPress={() => onTab('day')} />
      <View style={styles.fabRing}>
        <Pressable
          onPress={onAdd}
          accessibilityRole="button"
          accessibilityLabel="Ajouter une habitude"
          style={({ pressed }) => [styles.fab, pressed && { opacity: 0.85 }]}
        >
          <Feather name="plus" size={26} color={colors.onGreen} />
        </Pressable>
      </View>
      <TabItem icon="bar-chart-2" label="Stats" active={active === 'stats'} onPress={() => onTab('stats')} />
    </View>
  );
}

function TabItem({ icon, label, active, onPress }: { icon: 'home' | 'bar-chart-2'; label: string; active: boolean; onPress: () => void }) {
  const color = active ? colors.green : colors.textSecondary;
  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="tab"
      accessibilityLabel={label}
      accessibilityState={{ selected: active }}
      style={styles.tab}
    >
      <Feather name={icon} size={24} color={color} />
      <Text style={[styles.tabLabel, { color }]}>{label}</Text>
    </Pressable>
  );
}

const ring = sizes.fab + sizes.fabRing * 2;

const styles = StyleSheet.create({
  bar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around',
    paddingHorizontal: sizes.gutter,
    backgroundColor: colors.bar,
    borderTopWidth: 1,
    borderTopColor: colors.cardBorder,
  },
  tab: { minWidth: 64, minHeight: sizes.touch, alignItems: 'center', justifyContent: 'center', gap: 4 },
  tabLabel: { fontFamily: fonts.bodySemi, fontSize: 11 },
  fabRing: {
    width: ring,
    height: ring,
    borderRadius: ring / 2,
    backgroundColor: colors.bg,
    alignItems: 'center',
    justifyContent: 'center',
    transform: [{ translateY: -sizes.fabLift }],
  },
  fab: {
    width: sizes.fab,
    height: sizes.fab,
    borderRadius: sizes.fab / 2,
    backgroundColor: colors.text,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
