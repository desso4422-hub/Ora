import Feather from '@expo/vector-icons/Feather';
import { Pressable, StyleSheet, type StyleProp, type ViewStyle } from 'react-native';
import { colors, sizes } from '../theme';

type Props = {
  icon: React.ComponentProps<typeof Feather>['name'];
  label: string;
  onPress: () => void;
  color?: string;
  background?: string;
  size?: number;
  disabled?: boolean;
  style?: StyleProp<ViewStyle>;
};

/** Bouton icône rond, zone tactile 44 px, libellé d'accessibilité obligatoire. */
export function IconButton({ icon, label, onPress, color = colors.text, background = 'transparent', size = 20, disabled, style }: Props) {
  return (
    <Pressable
      onPress={onPress}
      disabled={disabled}
      accessibilityRole="button"
      accessibilityLabel={label}
      accessibilityState={{ disabled: !!disabled }}
      style={({ pressed }) => [
        styles.btn,
        { backgroundColor: background, opacity: disabled ? 0.3 : pressed ? 0.6 : 1 },
        style,
      ]}
    >
      <Feather name={icon} size={size} color={color} />
    </Pressable>
  );
}

const styles = StyleSheet.create({
  btn: {
    width: sizes.touch,
    height: sizes.touch,
    borderRadius: sizes.touch / 2,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
