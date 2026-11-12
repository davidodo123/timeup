import { Pressable, StyleSheet, Text, View } from 'react-native';
import { fonts, radius, space, type as fontSize, useTheme } from '../theme/ThemeProvider';

interface Props<T extends string | number> {
  label: string;
  options: readonly T[];
  value: T;
  onChange: (value: T) => void;
  format?: (value: T) => string;
  /** Opciones que no se pueden elegir (p. ej. más cartas de las disponibles). */
  isDisabled?: (value: T) => boolean;
}

/** Control segmentado: una fila de opciones del mismo ancho, una elegida. */
export function Segmented<T extends string | number>({ label, options, value, onChange, format, isDisabled }: Props<T>) {
  const { colors } = useTheme();
  return (
    <View style={styles.wrap}>
      <Text style={[styles.label, { color: colors.textMuted }]}>{label}</Text>
      <View style={[styles.track, { backgroundColor: colors.surfaceAlt }]} accessibilityRole="radiogroup">
        {options.map((o) => {
          const selected = o === value;
          const disabled = isDisabled?.(o) ?? false;
          return (
            <Pressable
              key={String(o)}
              onPress={() => onChange(o)}
              disabled={disabled}
              accessibilityRole="radio"
              accessibilityState={{ checked: selected, disabled }}
              style={[styles.option, selected && { backgroundColor: colors.text }, disabled && styles.disabled]}
            >
              <Text
                style={[styles.optionText, { color: selected ? colors.bg : colors.text }]}
                numberOfLines={1}
              >
                {format ? format(o) : String(o)}
              </Text>
            </Pressable>
          );
        })}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { gap: space.xs },
  label: { fontFamily: fonts.semibold, fontSize: fontSize.small },
  track: { flexDirection: 'row', borderRadius: radius.md, padding: 4, gap: 4 },
  option: {
    flex: 1,
    minHeight: 46,
    borderRadius: radius.sm + 2,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 4,
  },
  optionText: { fontFamily: fonts.bold, fontSize: 16 },
  disabled: { opacity: 0.3 },
});
