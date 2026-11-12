import { useCallback, useEffect } from 'react';
import { AppState, Pressable, StyleSheet, Text, View } from 'react-native';
import { BigButton } from '../components/BigButton';
import { RoundPips } from '../components/RoundPips';
import { Screen } from '../components/Screen';
import { SwipeCard } from '../components/SwipeCard';
import { TimerBar } from '../components/TimerBar';
import { CATEGORIES } from '../data/cards';
import { ROUND_RULES, WARNING_SECONDS } from '../game/constants';
import { cardById } from '../game/selectors';
import { useCountdown } from '../hooks/useCountdown';
import { haptics } from '../services/haptics';
import { useGameSounds } from '../services/useGameSounds';
import { useGame, useGameActions } from '../state/GameProvider';
import { fonts, radius, space, type as fontSize, useTheme } from '../theme/ThemeProvider';

const categoryName = new Map(CATEGORIES.map((c) => [c.id, c.name]));

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
      if (sec > 0 && sec <= WARNING_SECONDS) {
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
        <RoundPips round={state.round} />
        <TimerBar remainingMs={remainingMs} totalMs={turn.durationMs} />
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

      <View style={styles.cardArea}>
        {paused ? (
          // En pausa se tapa la palabra para que nadie la vea.
          <Pressable
            onPress={actions.resume}
            style={[styles.pausedCard, { backgroundColor: colors.surface }]}
            accessibilityRole="button"
            accessibilityLabel="Reanudar"
          >
            <Text style={[styles.pausedTitle, { color: colors.text }]}>Pausa</Text>
            <Text style={[styles.pausedHint, { color: colors.textMuted }]}>Toca para seguir</Text>
          </Pressable>
        ) : card ? (
          <SwipeCard
            key={`${card.id}-${turn.events.length}`}
            text={card.text}
            category={categoryName.get(card.category) ?? ''}
            hint={rule.short}
            deckDepth={state.pile.length}
            onGuess={guess}
            onPass={pass}
          />
        ) : null}
      </View>

      <Text style={[styles.status, { color: colors.textMuted }]}>
        <Text style={[styles.statusStrong, { color: colors.text }]}>{guessedCount}</Text>
        {guessedCount === 1 ? ' acertada' : ' acertadas'} · desliza o pulsa
      </Text>

      <View style={styles.buttons}>
        <BigButton label="Pasar" glyph="✕" variant="danger" size="lg" onPress={pass} disabled={paused} style={styles.button} />
        <BigButton label="Acertada" glyph="✓" variant="success" size="lg" onPress={guess} disabled={paused} style={styles.button} />
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  content: { flex: 1, gap: space.md },
  top: { flexDirection: 'row', alignItems: 'center', gap: space.md },
  pause: { width: 48, height: 48, borderRadius: 24, alignItems: 'center', justifyContent: 'center' },
  pauseText: { fontFamily: fonts.display, fontSize: 18 },
  cardArea: { flex: 1 },
  pausedCard: { flex: 1, borderRadius: radius.lg, alignItems: 'center', justifyContent: 'center', gap: space.sm },
  pausedTitle: { fontFamily: fonts.display, fontSize: fontSize.hero },
  pausedHint: { fontFamily: fonts.semibold, fontSize: fontSize.body },
  status: { fontFamily: fonts.semibold, fontSize: fontSize.small + 1, textAlign: 'center' },
  statusStrong: { fontFamily: fonts.display },
  buttons: { flexDirection: 'row', gap: space.md },
  button: { flex: 1, minHeight: 112 },
});
