import { StyleSheet, Text, View } from 'react-native';
import { WARNING_SECONDS } from '../game/constants';
import { fonts, radius, space, useTheme } from '../theme/ThemeProvider';

interface Props {
  remainingMs: number;
  totalMs: number;
}

/** Cuenta atrás grande con barra. En los últimos segundos todo se pone rojo. */
export function TimerBar({ remainingMs, totalMs }: Props) {
  const { colors } = useTheme();
  const seconds = Math.ceil(remainingMs / 1000);
  const warning = seconds <= WARNING_SECONDS;
  const pct = totalMs > 0 ? Math.max(0, Math.min(1, remainingMs / totalMs)) : 0;
  const tint = warning ? colors.danger : colors.text;

  return (
    <View
      style={styles.wrap}
      accessibilityRole="timer"
      accessibilityLabel={`${seconds} segundos`}
      accessibilityLiveRegion={warning ? 'assertive' : 'none'}
    >
      <Text style={[styles.seconds, { color: tint }, warning && styles.big]}>{seconds}</Text>
      <View style={[styles.track, { backgroundColor: colors.surfaceAlt }]}>
        <View style={[styles.fill, { width: `${pct * 100}%`, backgroundColor: warning ? colors.danger : colors.primary }]} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { flex: 1, flexDirection: 'row', alignItems: 'center', gap: space.md },
  seconds: { fontFamily: fonts.display, fontSize: 44, fontVariant: ['tabular-nums'], minWidth: 58, textAlign: 'right' },
  big: { fontSize: 52 },
  track: { flex: 1, height: 12, borderRadius: radius.pill, overflow: 'hidden' },
  fill: { height: '100%', borderRadius: radius.pill },
});
