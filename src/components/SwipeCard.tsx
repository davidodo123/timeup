import { useEffect } from 'react';
import { StyleSheet, Text, useWindowDimensions, View } from 'react-native';
import { GestureDetector, usePanGesture } from 'react-native-gesture-handler';
import Animated, {
  Extrapolation,
  interpolate,
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  withTiming,
} from 'react-native-reanimated';
import { scheduleOnRN } from 'react-native-worklets';
import { fonts, radius, space, useTheme } from '../theme/ThemeProvider';

interface Props {
  text: string;
  /** Categoría de la carta, arriba. */
  category: string;
  /** Regla de la ronda, abajo. */
  hint: string;
  /** Cartas que quedan debajo: se dibujan como bordes asomando (0, 1 o 2+). */
  deckDepth: number;
  /** Deslizar a la derecha. */
  onGuess: () => void;
  /** Deslizar a la izquierda. */
  onPass: () => void;
}

/**
 * La carta en juego. Derecha = acertada, izquierda = pasar. Hay que darle una
 * `key` distinta por carta para que cada carta nueva entre desde el mazo.
 */
export function SwipeCard({ text, category, hint, deckDepth, onGuess, onPass }: Props) {
  const { colors } = useTheme();
  const { width } = useWindowDimensions();
  const threshold = Math.min(width, 500) * 0.28;
  const x = useSharedValue(0);
  const enter = useSharedValue(0);
  const done = useSharedValue(false);

  // Entrada: la carta sube del mazo con un muelle corto (marca que es una carta nueva).
  useEffect(() => {
    enter.value = withSpring(1, { damping: 16, stiffness: 260 });
  }, [enter]);

  const pan = usePanGesture({
    activeOffsetX: [-12, 12],
    failOffsetY: [-40, 40],
    onUpdate: (e) => {
      'worklet';
      if (!done.value) x.value = e.translationX;
    },
    onDeactivate: (e) => {
      'worklet';
      if (done.value) return;
      const flung = Math.abs(e.velocityX) > 900;
      if (e.translationX > threshold || (flung && e.velocityX > 0)) {
        done.value = true;
        x.value = withTiming(width * 1.3, { duration: 160 });
        scheduleOnRN(onGuess);
      } else if (e.translationX < -threshold || (flung && e.velocityX < 0)) {
        done.value = true;
        x.value = withTiming(-width * 1.3, { duration: 160 });
        scheduleOnRN(onPass);
      } else {
        x.value = withSpring(0);
      }
    },
  });

  const cardStyle = useAnimatedStyle(() => ({
    transform: [
      { translateX: x.value },
      { translateY: interpolate(enter.value, [0, 1], [18, 0]) },
      { scale: interpolate(enter.value, [0, 1], [0.94, 1]) },
      { rotate: `${interpolate(x.value, [-width, width], [-14, 14], Extrapolation.CLAMP)}deg` },
    ],
  }));
  const guessStamp = useAnimatedStyle(() => ({
    opacity: interpolate(x.value, [20, threshold], [0, 1], Extrapolation.CLAMP),
  }));
  const passStamp = useAnimatedStyle(() => ({
    opacity: interpolate(x.value, [-threshold, -20], [1, 0], Extrapolation.CLAMP),
  }));

  return (
    <View style={styles.wrap}>
      {/* El mazo que queda: bordes de cartas asomando por debajo. */}
      {deckDepth >= 2 ? (
        <View style={[styles.under, styles.under2, { backgroundColor: colors.cardEdge }]} />
      ) : null}
      {deckDepth >= 1 ? (
        <View style={[styles.under, styles.under1, { backgroundColor: colors.cardEdge, borderColor: colors.card }]} />
      ) : null}

      <GestureDetector gesture={pan}>
        <Animated.View
          style={[styles.card, { backgroundColor: colors.card, borderColor: colors.cardEdge }, cardStyle]}
          accessible
          accessibilityRole="text"
          accessibilityLabel={text}
          accessibilityHint="Desliza a la derecha si la han adivinado, a la izquierda para pasar"
        >
          <Text style={[styles.category, { color: colors.cardMuted }]}>{category}</Text>

          <View style={styles.wordBox}>
            <Text style={[styles.word, { color: colors.cardInk }]} adjustsFontSizeToFit numberOfLines={3} minimumFontScale={0.5}>
              {text}
            </Text>
          </View>

          <Text style={[styles.hint, { color: colors.cardMuted }]}>{hint}</Text>

          {/* Sellos que aparecen al deslizar: confirman la acción antes de soltar. */}
          <Animated.View style={[styles.stamp, styles.stampLeft, { borderColor: colors.success }, guessStamp]}>
            <Text style={[styles.stampText, { color: colors.success }]}>¡SÍ!</Text>
          </Animated.View>
          <Animated.View style={[styles.stamp, styles.stampRight, { borderColor: colors.danger }, passStamp]}>
            <Text style={[styles.stampText, { color: colors.danger }]}>PASO</Text>
          </Animated.View>
        </Animated.View>
      </GestureDetector>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { flex: 1, paddingBottom: 14 },
  under: { position: 'absolute', left: 0, right: 0, top: 0, borderRadius: radius.lg },
  under1: { bottom: 7, marginHorizontal: 10, borderWidth: 0 },
  under2: { bottom: 0, marginHorizontal: 22, opacity: 0.6 },
  card: {
    flex: 1,
    borderRadius: radius.lg,
    borderWidth: 1,
    paddingHorizontal: space.lg,
    paddingVertical: space.md,
    overflow: 'hidden',
    // Única sombra de la app: la carta es lo único que "flota" sobre la mesa.
    shadowColor: '#000',
    shadowOpacity: 0.25,
    shadowRadius: 18,
    shadowOffset: { width: 0, height: 8 },
    elevation: 8,
  },
  category: { fontFamily: fonts.bold, fontSize: 17, textAlign: 'center' },
  wordBox: { flex: 1, justifyContent: 'center' },
  word: { fontFamily: fonts.display, fontSize: 58, textAlign: 'center', lineHeight: 64, letterSpacing: -1 },
  hint: { fontFamily: fonts.semibold, fontSize: 16, textAlign: 'center' },
  stamp: {
    position: 'absolute',
    top: 54,
    borderWidth: 4,
    borderRadius: radius.sm,
    paddingHorizontal: space.sm,
    paddingVertical: 2,
  },
  stampLeft: { left: 20, transform: [{ rotate: '-12deg' }] },
  stampRight: { right: 20, transform: [{ rotate: '12deg' }] },
  stampText: { fontFamily: fonts.display, fontSize: 30 },
});
