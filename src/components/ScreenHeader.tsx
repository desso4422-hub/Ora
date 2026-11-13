import { StyleSheet, Text, View } from 'react-native';
import { IconButton } from './IconButton';
import { colors, fonts, sizes, type } from '../theme';

type Props = { title: string; subtitle?: string; onBack?: () => void };

export function ScreenHeader({ title, subtitle, onBack }: Props) {
  return (
    <View style={styles.wrap}>
      {onBack && (
        <IconButton icon="chevron-left" label="Retour" onPress={onBack} size={24} style={styles.back} />
      )}
      <Text style={type.screenTitle} accessibilityRole="header">{title}</Text>
      {subtitle ? <Text style={styles.subtitle}>{subtitle}</Text> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { paddingHorizontal: sizes.gutter, paddingTop: 16 },
  back: { marginLeft: -12, marginBottom: 4 },
  subtitle: { fontFamily: fonts.body, fontSize: 13, color: colors.textSecondary, marginTop: 4 },
});
