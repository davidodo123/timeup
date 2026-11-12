import type { ReactNode } from 'react';
import { ScrollView, StyleSheet, View, type ViewStyle } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { space, useTheme } from '../theme/ThemeProvider';

interface Props {
  children: ReactNode;
  scroll?: boolean;
  /** Color de fondo distinto al del tema (p. ej. el del equipo). */
  background?: string;
  footer?: ReactNode;
  style?: ViewStyle;
}

/** Contenedor de pantalla con zona segura y pie fijo opcional para el botón principal. */
export function Screen({ children, scroll, background, footer, style }: Props) {
  const { colors } = useTheme();
  const body = scroll ? (
    <ScrollView contentContainerStyle={[styles.content, style]} keyboardShouldPersistTaps="handled">
      {children}
    </ScrollView>
  ) : (
    <View style={[styles.content, styles.fill, style]}>{children}</View>
  );
  return (
    <SafeAreaView style={[styles.fill, { backgroundColor: background ?? colors.bg }]}>
      {body}
      {footer ? <View style={styles.footer}>{footer}</View> : null}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  fill: { flex: 1 },
  content: { padding: space.lg, gap: space.lg },
  footer: { paddingHorizontal: space.lg, paddingBottom: space.md, paddingTop: space.sm },
});
