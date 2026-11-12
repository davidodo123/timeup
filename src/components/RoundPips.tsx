import { StyleSheet, Text, View } from 'react-native';
import type { RoundNumber } from '../game/types';
import { fonts, useTheme } from '../theme/ThemeProvider';

interface Props {
  round: RoundNumber;
  /** Color de la tinta cuando va sobre un fondo de equipo. */
  ink?: string;
}

/**
 * Las tres rondas como tres cartitas: hechas, actual y por jugar.
 * Es el hilo visual del juego: aparece en el turno, en la partida y entre rondas.
 */
export function RoundPips({ round, ink }: Props) {
  const { colors } = useTheme();
  const color = ink ?? colors.text;
  return (
    <View style={styles.row} accessibilityLabel={`Ronda ${round} de 3`} accessible>
      {([1, 2, 3] as RoundNumber[]).map((r) => {
        const current = r === round;
        const done = r < round;
        return (
          <View
            key={r}
            style={[
              styles.pip,
              { borderColor: color, transform: [{ rotate: `${(r - 2) * 6}deg` }] },
              current && { backgroundColor: color },
              done && { opacity: 0.45 },
            ]}
          >
            <Text style={[styles.num, { color: current ? (ink ? invert(ink) : colors.bg) : color }]}>
              {done ? '✓' : r}
            </Text>
          </View>
        );
      })}
    </View>
  );
}

const invert = (ink: string) => (ink === '#FFFFFF' ? '#14101F' : '#FFFFFF');

const styles = StyleSheet.create({
  row: { flexDirection: 'row', gap: 4 },
  pip: {
    width: 26,
    height: 34,
    borderRadius: 6,
    borderWidth: 2,
    alignItems: 'center',
    justifyContent: 'center',
  },
  num: { fontFamily: fonts.display, fontSize: 15 },
});
