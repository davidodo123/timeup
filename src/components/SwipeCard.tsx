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
import { radius, space, useTheme } from '../theme/ThemeProvider';

interface Props {
  text: string;
  hint: string;
  disabled?: boolean;
  /** Deslizar a la derecha. */
  onGuess: () => void;
  /** Deslizar a la izquierda. */
  onPass: () => void;
}

/**
 * Carta con la palabra. Se puede deslizar: derecha = acertada, izquierda =
 * pasar. Hay que darle `key={card.id}` para que cada carta nueva vuelva al centro.
 */
export function SwipeCard({ text, hint, disabled, onGuess, onPass }: Props) {
  const { colors } = useTheme();
  const { width } = useWindowDimensions();
  const threshold = width * 0.28;
  const x = useSharedValue(0);
  const done = useSharedValue(false);

  const pan = usePanGesture({
    enabled: !disabled,
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
      { rotate: `${interpolate(x.value, [-width, width], [-12, 12], Extrapolation.CLAMP)}deg` },
    ],
  }));
  const guessTint = useAnimatedStyle(() => ({
    opacity: interpolate(x.value, [0, threshold], [0, 0.9], Extrapolation.CLAMP),
  }));
  const passTint = useAnimatedStyle(() => ({
    opacity: interpolate(x.value, [-threshold, 0], [0.9, 0], Extrapolation.CLAMP),
  }));

  return (
    <GestureDetector gesture={pan}>
      <Animated.View
        style={[styles.card, { backgroundColor: colors.surface, borderColor: colors.border }, cardStyle]}
        accessible
        accessibilityRole="text"
        accessibilityLabel={text}
        accessibilityHint="Desliza a la derecha si la han adivinado, a la izquierda para pasar"
      >
        <Animated.View style={[styles.tint, { backgroundColor: colors.success }, guessTint]} />
        <Animated.View style={[styles.tint, { backgroundColor: colors.danger }, passTint]} />
        <Text style={[styles.hint, { color: colors.textMuted }]}>{hint}</Text>
        <View style={styles.wordBox}>
          <Text
            style={[styles.word, { color: colors.text }]}
            adjustsFontSizeToFit
            numberOfLines={3}
            minimumFontScale={0.5}
          >
            {text}
          </Text>
        </View>
      </Animated.View>
    </GestureDetector>
  );
}

const styles = StyleSheet.create({
  card: {
    flex: 1,
    borderRadius: radius.lg,
    borderWidth: 2,
    padding: space.lg,
    overflow: 'hidden',
  },
  tint: { ...StyleSheet.absoluteFill },
  hint: { fontSize: 16, fontWeight: '800', textAlign: 'center', textTransform: 'uppercase', letterSpacing: 1 },
  wordBox: { flex: 1, justifyContent: 'center' },
  word: { fontSize: 56, fontWeight: '900', textAlign: 'center', lineHeight: 64 },
});
