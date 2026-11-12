import { Pressable, StyleSheet, Text } from 'react-native';
import { fonts, radius, space, useTheme } from '../theme/ThemeProvider';

interface Props {
  label: string;
  selected: boolean;
  onPress: () => void;
}

/** Opción que se puede marcar y desmarcar (selección múltiple). */
export function Chip({ label, selected, onPress }: Props) {
  const { colors } = useTheme();
  return (
    <Pressable
      accessibilityRole="checkbox"
      accessibilityState={{ checked: selected }}
      onPress={onPress}
      style={[
        styles.chip,
        {
          backgroundColor: selected ? colors.text : 'transparent',
          borderColor: selected ? colors.text : colors.border,
        },
      ]}
    >
      <Text style={[styles.label, { color: selected ? colors.bg : colors.text }]}>
        {selected ? '✓ ' : ''}
        {label}
      </Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  chip: {
    minHeight: 44,
    paddingHorizontal: space.md,
    borderRadius: radius.pill,
    borderWidth: 2,
    justifyContent: 'center',
  },
  label: { fontFamily: fonts.bold, fontSize: 16 },
});
