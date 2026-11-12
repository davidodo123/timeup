import { useCallback, useEffect } from 'react';
import { AppState, Pressable, StyleSheet, Text, View } from 'react-native';
import { BigButton } from '../components/BigButton';
import { Screen } from '../components/Screen';
import { SwipeCard } from '../components/SwipeCard';
import { TimerBar } from '../components/TimerBar';
import { ROUND_RULES, WARNING_SECONDS } from '../game/constants';
import { cardById, cardsLeft } from '../game/selectors';
import { useCountdown } from '../hooks/useCountdown';
import { haptics } from '../services/haptics';
import { useGameSounds } from '../services/useGameSounds';
import { useGame, useGameActions } from '../state/GameProvider';
import { radius, space, type as fontSize, useTheme } from '../theme/ThemeProvider';

/** El turno en juego: temporizador, carta y botones de acertar / pasar. */
export function PlayScreen() {
  const state = useGame();
  const actions = useGameActions();
  const { colors } = useTheme();
  const { play } = useGameSounds();
  const turn = state.turn!;
  const paused = turn.pausedAt !== null;
  const card = cardById(state, turn.currentCardId);
  const rule = ROUND_RULES[state.round];

  const remainingMs = useCountdown({
    endsAt: turn.endsAt,
    pausedAt: turn.pausedAt,
    onExpire: () => {
      play('alarm');
      haptics.timeUp();
      actions.timeUp();
    },
    onSecond: (sec) => {
      if (sec > 0 && sec <= WARNING_SECONDS && turn.pausedAt === null) {
        play('tick');
        haptics.warning();
      }
    },
  });

  // Si alguien sale de la app (llamada, notificación…), el turno se pausa.
  useEffect(() => {
    const sub = AppState.addEventListener('change', (s) => {
      if (s !== 'active') actions.pause();
    });
    return () => sub.remove();
  }, [actions]);

  const guess = useCallback(() => {
    play('guess');
    haptics.guess();
    actions.guess();
  }, [actions, play]);

  const pass = useCallback(() => {
    play('pass');
    haptics.pass();
    actions.pass();
  }, [actions, play]);

  const guessedCount = turn.events.filter((e) => e.outcome === 'guessed').length;

  return (
    <Screen style={styles.content}>
      <View style={styles.top}>
        <View style={styles.topRow}>
          <Text style={[styles.meta, { color: colors.textMuted }]}>{rule.short}</Text>
          <Pressable
            onPress={paused ? actions.resume : actions.pause}
            accessibilityRole="button"
            accessibilityLabel={paused ? 'Reanudar' : 'Pausar'}
            style={[styles.pause, { backgroundColor: colors.surfaceAlt }]}
            hitSlop={8}
          >
            <Text style={[styles.pauseText, { color: colors.text }]}>{paused ? '▶' : 'II'}</Text>
          </Pressable>
        </View>
        <TimerBar remainingMs={remainingMs} totalMs={turn.durationMs} />
      </View>

      <View style={styles.cardArea}>
        {paused ? (
          <Pressable
            onPress={actions.resume}
            style={[styles.pausedCard, { backgroundColor: colors.surface, borderColor: colors.border }]}
            accessibilityRole="button"
          >
            <Text style={[styles.pausedTitle, { color: colors.text }]}>Pausa</Text>
            <Text style={[styles.meta, { color: colors.textMuted }]}>Toca para seguir</Text>
          </Pressable>
        ) : card ? (
          <SwipeCard key={`${card.id}-${turn.events.length}`} text={card.text} hint={rule.short} onGuess={guess} onPass={pass} />
        ) : null}
      </View>

      <Text style={[styles.meta, styles.center, { color: colors.textMuted }]}>
        {guessedCount} acertadas · quedan {cardsLeft(state)} en el mazo
      </Text>

      <View style={styles.buttons}>
        <BigButton label="Pasar" variant="danger" size="xl" onPress={pass} disabled={paused} style={styles.flex} />
        <BigButton label="¡Adivinada!" variant="success" size="xl" onPress={guess} disabled={paused} style={styles.flex} />
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  content: { flex: 1, gap: space.md },
  top: { gap: space.xs },
  topRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  meta: { fontSize: fontSize.small + 1, fontWeight: '700' },
  center: { textAlign: 'center' },
  pause: { width: 48, height: 48, borderRadius: 24, alignItems: 'center', justifyContent: 'center' },
  pauseText: { fontSize: 18, fontWeight: '900' },
  cardArea: { flex: 1 },
  pausedCard: { flex: 1, borderRadius: radius.lg, borderWidth: 2, alignItems: 'center', justifyContent: 'center', gap: space.sm },
  pausedTitle: { fontSize: fontSize.hero, fontWeight: '900' },
  buttons: { flexDirection: 'row', gap: space.md },
  flex: { flex: 1 },
});
