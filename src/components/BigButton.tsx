import { Pressable, StyleSheet, Text, type ViewStyle } from 'react-native';
import { radius, space, type as fontSize, useTheme } from '../theme/ThemeProvider';

type Variant = 'primary' | 'success' | 'danger' | 'ghost';

interface Props {
  label: string;
  onPress: () => void;
  variant?: Variant;
  size?: 'md' | 'lg' | 'xl';
  disabled?: boolean;
  style?: ViewStyle;
  /** Fuerza el color del texto (p. ej. sobre el color de un equipo). */
  textColor?: string;
  accessibilityHint?: string;
}

export function BigButton({ label, onPress, variant = 'primary', size = 'lg', disabled, style, textColor, accessibilityHint }: Props) {
  const { colors } = useTheme();
  const bg = {
    primary: colors.primary,
    success: colors.success,
    danger: colors.danger,
    ghost: 'transparent',
  }[variant];
  const fg = textColor ?? (variant === 'primary' ? colors.onPrimary : variant === 'ghost' ? colors.text : colors.onColor);

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityState={{ disabled }}
      accessibilityHint={accessibilityHint}
      onPress={onPress}
      disabled={disabled}
      style={({ pressed }) => [
        styles.base,
        sizes[size],
        { backgroundColor: bg, opacity: disabled ? 0.4 : pressed ? 0.85 : 1 },
        variant === 'ghost' && { borderWidth: 2, borderColor: colors.border },
        pressed && { transform: [{ scale: 0.97 }] },
        style,
      ]}
    >
      <Text style={[styles.label, { color: fg, fontSize: labelSize[size] }]}>{label}</Text>
    </Pressable>
  );
}

const sizes = StyleSheet.create({
  md: { minHeight: 52, paddingHorizontal: space.lg },
  lg: { minHeight: 68, paddingHorizontal: space.lg },
  xl: { minHeight: 96, paddingHorizontal: space.xl },
});

const labelSize = { md: fontSize.body, lg: fontSize.heading, xl: fontSize.title };

const styles = StyleSheet.create({
  base: { borderRadius: radius.lg, alignItems: 'center', justifyContent: 'center' },
  label: { fontWeight: '900', textAlign: 'center' },
});
