import { Pressable, StyleSheet, Text, View, type ViewStyle } from 'react-native';
import { fonts, radius, space, useTheme } from '../theme/ThemeProvider';

type Variant = 'primary' | 'success' | 'danger' | 'ghost';

interface Props {
  label: string;
  onPress: () => void;
  variant?: Variant;
  size?: 'md' | 'lg' | 'xl';
  /** Glifo grande encima del texto (botones de juego). */
  glyph?: string;
  disabled?: boolean;
  style?: ViewStyle;
  /** Fuerza los colores (p. ej. sobre el color de un equipo). */
  textColor?: string;
  backgroundColor?: string;
  accessibilityHint?: string;
}

export function BigButton({
  label,
  onPress,
  variant = 'primary',
  size = 'lg',
  glyph,
  disabled,
  style,
  textColor,
  backgroundColor,
  accessibilityHint,
}: Props) {
  const { colors } = useTheme();
  const bg =
    backgroundColor ??
    { primary: colors.primary, success: colors.success, danger: colors.danger, ghost: 'transparent' }[variant];
  const fg =
    textColor ?? (variant === 'primary' ? colors.onPrimary : variant === 'ghost' ? colors.text : colors.onColor);

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={label}
      accessibilityState={{ disabled }}
      accessibilityHint={accessibilityHint}
      onPress={onPress}
      disabled={disabled}
      style={({ pressed }) => [
        styles.base,
        sizes[size],
        { backgroundColor: bg, opacity: disabled ? 0.4 : 1 },
        variant === 'ghost' && { borderWidth: 2, borderColor: colors.border },
        pressed && styles.pressed,
        style,
      ]}
    >
      <View style={styles.inner}>
        {glyph ? <Text style={[styles.glyph, { color: fg }]}>{glyph}</Text> : null}
        <Text style={[styles.label, { color: fg, fontSize: labelSize[size] }]} numberOfLines={1}>
          {label}
        </Text>
      </View>
    </Pressable>
  );
}

const sizes = StyleSheet.create({
  md: { minHeight: 52, paddingHorizontal: space.lg },
  lg: { minHeight: 64, paddingHorizontal: space.lg },
  xl: { minHeight: 76, paddingHorizontal: space.lg },
});

const labelSize = { md: 17, lg: 21, xl: 25 };

const styles = StyleSheet.create({
  base: { borderRadius: radius.lg, alignItems: 'center', justifyContent: 'center', paddingVertical: space.sm },
  inner: { alignItems: 'center' },
  pressed: { transform: [{ scale: 0.97 }], opacity: 0.9 },
  glyph: { fontFamily: fonts.display, fontSize: 38, lineHeight: 42 },
  label: { fontFamily: fonts.display, textAlign: 'center' },
});
