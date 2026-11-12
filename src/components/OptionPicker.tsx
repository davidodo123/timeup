import { StyleSheet, Text, View } from 'react-native';
import { space, type as fontSize, useTheme } from '../theme/ThemeProvider';
import { Chip } from './Chip';

interface Props<T extends string | number> {
  label: string;
  options: readonly T[];
  value: T;
  onChange: (value: T) => void;
  format?: (value: T) => string;
  /** Opciones que no se pueden elegir (p. ej. más cartas de las disponibles). */
  isDisabled?: (value: T) => boolean;
}

/** Selector de una opción entre varias, en fila de chips. */
export function OptionPicker<T extends string | number>({ label, options, value, onChange, format, isDisabled }: Props<T>) {
  const { colors } = useTheme();
  return (
    <View style={styles.wrap}>
      <Text style={[styles.label, { color: colors.textMuted }]}>{label}</Text>
      <View style={styles.row} accessibilityRole="radiogroup">
        {options
          .filter((o) => !isDisabled?.(o))
          .map((o) => (
            <Chip key={String(o)} label={format ? format(o) : String(o)} selected={o === value} onPress={() => onChange(o)} />
          ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { gap: space.sm },
  label: { fontSize: fontSize.small, fontWeight: '800', textTransform: 'uppercase', letterSpacing: 1 },
  row: { flexDirection: 'row', flexWrap: 'wrap', gap: space.sm },
});
