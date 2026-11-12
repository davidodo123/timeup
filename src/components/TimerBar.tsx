import { StyleSheet, Text, View } from 'react-native';
import { WARNING_SECONDS } from '../game/constants';
import { radius, space, useTheme } from '../theme/ThemeProvider';

interface Props {
  remainingMs: number;
  totalMs: number;
}

/** Cuenta atrás grande con barra de progreso. Se pone en rojo en los últimos segundos. */
export function TimerBar({ remainingMs, totalMs }: Props) {
  const { colors } = useTheme();
  const seconds = Math.ceil(remainingMs / 1000);
  const warning = seconds <= WARNING_SECONDS;
  const pct = totalMs > 0 ? Math.max(0, Math.min(1, remainingMs / totalMs)) : 0;
  const tint = warning ? colors.danger : colors.primary;

  return (
    <View
      style={styles.wrap}
      accessibilityRole="timer"
      accessibilityLabel={`${seconds} segundos`}
      accessibilityLiveRegion={warning ? 'assertive' : 'none'}
    >
      <Text style={[styles.seconds, { color: tint }]}>{seconds}</Text>
      <View style={[styles.track, { backgroundColor: colors.surfaceAlt }]}>
        <View style={[styles.fill, { width: `${pct * 100}%`, backgroundColor: tint }]} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { alignItems: 'center', gap: space.sm },
  seconds: { fontSize: 64, fontWeight: '900', fontVariant: ['tabular-nums'], lineHeight: 70 },
  track: { height: 14, alignSelf: 'stretch', borderRadius: radius.pill, overflow: 'hidden' },
  fill: { height: '100%', borderRadius: radius.pill },
});
