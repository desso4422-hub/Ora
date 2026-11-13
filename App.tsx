import { Inter_400Regular } from '@expo-google-fonts/inter/400Regular';
import { Inter_500Medium } from '@expo-google-fonts/inter/500Medium';
import { Inter_600SemiBold } from '@expo-google-fonts/inter/600SemiBold';
import { Inter_700Bold } from '@expo-google-fonts/inter/700Bold';
import { SpaceGrotesk_500Medium } from '@expo-google-fonts/space-grotesk/500Medium';
import { SpaceGrotesk_700Bold } from '@expo-google-fonts/space-grotesk/700Bold';
import { useFonts } from 'expo-font';
import { StatusBar } from 'expo-status-bar';
import { useCallback, useEffect, useState } from 'react';
import { BackHandler, StyleSheet, View } from 'react-native';
import { SafeAreaProvider, useSafeAreaInsets } from 'react-native-safe-area-context';
import { GridBackground } from './src/components/GridBackground';
import { HabitSheet } from './src/components/HabitSheet';
import { TabBar, type Tab } from './src/components/TabBar';
import { configureNotifications } from './src/notifications';
import { DayScreen } from './src/screens/DayScreen';
import { HistoryScreen } from './src/screens/HistoryScreen';
import { ManageScreen } from './src/screens/ManageScreen';
import { SettingsScreen } from './src/screens/SettingsScreen';
import { StatsScreen } from './src/screens/StatsScreen';
import { StoreProvider, useStore, type HabitInput } from './src/store';
import type { Habit } from './src/types';
import { colors, sizes } from './src/theme';

configureNotifications();

type Screen =
  | { name: 'day' }
  | { name: 'stats' }
  | { name: 'history'; habitId: string | null }
  | { name: 'settings' }
  | { name: 'manage' };

/** Écran parent pour le bouton Retour d'Android. */
const parentOf = (s: Screen): Screen | null => {
  switch (s.name) {
    case 'history': return { name: 'stats' };
    case 'manage': return { name: 'settings' };
    case 'stats':
    case 'settings': return { name: 'day' };
    default: return null;
  }
};

type Sheet = { open: false } | { open: true; habit: Habit | null };

function Root() {
  const insets = useSafeAreaInsets();
  const { ready, today, addHabit, updateHabit, deleteHabit } = useStore();
  const [screen, setScreen] = useState<Screen>({ name: 'day' });
  const [selected, setSelected] = useState(today);
  const [sheet, setSheet] = useState<Sheet>({ open: false });

  useEffect(() => {
    const sub = BackHandler.addEventListener('hardwareBackPress', () => {
      const parent = parentOf(screen);
      if (!parent) return false;
      setScreen(parent);
      return true;
    });
    return () => sub.remove();
  }, [screen]);

  const openEdit = useCallback((habit: Habit) => setSheet({ open: true, habit }), []);
  const onSelect = useCallback((key: string) => setSelected(key > today ? today : key), [today]);
  const close = () => setSheet({ open: false });

  const onSave = (input: HabitInput) => {
    if (sheet.open && sheet.habit) updateHabit(sheet.habit.id, input);
    else addHabit(input);
    close();
  };

  const onDelete = (id: string) => {
    deleteHabit(id);
    close();
  };

  if (!ready) return <View style={styles.root} />;

  const bottomPad = sizes.tabBarH + insets.bottom;
  const tab: Tab | null = screen.name === 'day' ? 'day' : screen.name === 'stats' || screen.name === 'history' ? 'stats' : null;

  return (
    <View style={styles.root}>
      <GridBackground />
      <View style={{ flex: 1, paddingTop: insets.top }}>
        {screen.name === 'day' && (
          <DayScreen
            selected={selected}
            onSelect={onSelect}
            onEdit={openEdit}
            onSettings={() => setScreen({ name: 'settings' })}
            bottomPad={bottomPad}
          />
        )}
        {screen.name === 'stats' && (
          <StatsScreen onOpenHistory={(habitId) => setScreen({ name: 'history', habitId })} bottomPad={bottomPad} />
        )}
        {screen.name === 'history' && (
          <HistoryScreen focusId={screen.habitId} onBack={() => setScreen({ name: 'stats' })} bottomPad={bottomPad} />
        )}
        {screen.name === 'settings' && (
          <SettingsScreen onBack={() => setScreen({ name: 'day' })} onManage={() => setScreen({ name: 'manage' })} bottomPad={bottomPad} />
        )}
        {screen.name === 'manage' && (
          <ManageScreen onBack={() => setScreen({ name: 'settings' })} onEdit={openEdit} bottomPad={bottomPad} />
        )}
      </View>
      <View style={styles.tabBar}>
        <TabBar
          active={tab}
          onTab={(t) => {
            if (t === 'day') setSelected(today);
            setScreen(t === 'day' ? { name: 'day' } : { name: 'stats' });
          }}
          onAdd={() => setSheet({ open: true, habit: null })}
        />
      </View>
      <HabitSheet
        visible={sheet.open}
        habit={sheet.open ? sheet.habit : null}
        onClose={close}
        onSave={onSave}
        onDelete={onDelete}
      />
    </View>
  );
}

export default function App() {
  const [fontsLoaded] = useFonts({
    SpaceGrotesk_500Medium,
    SpaceGrotesk_700Bold,
    Inter_400Regular,
    Inter_500Medium,
    Inter_600SemiBold,
    Inter_700Bold,
  });

  return (
    <SafeAreaProvider style={{ backgroundColor: colors.bg }}>
      <StatusBar style="light" />
      {fontsLoaded ? (
        <StoreProvider>
          <Root />
        </StoreProvider>
      ) : (
        <View style={styles.root} />
      )}
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.bg },
  tabBar: { position: 'absolute', left: 0, right: 0, bottom: 0 },
});
