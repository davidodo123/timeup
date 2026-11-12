import { useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { BigButton } from '../components/BigButton';
import { Screen } from '../components/Screen';
import { PASS_PENALTY_POINTS } from '../game/constants';
import { cardById, currentTeam } from '../game/selectors';
import { useGame, useGameActions } from '../state/GameProvider';
import { radius, space, type as fontSize, useTheme } from '../theme/ThemeProvider';

/**
 * Fin del turno: el equipo rival repasa las cartas acertadas y puede anular
 * las que no valgan (p. ej. si se dijo parte de la palabra). Las anuladas vuelven al mazo.
 */
export function TurnReviewScreen() {
  const state = useGame();
  const { confirmReview } = useGameActions();
  const { colors } = useTheme();
  const [rejected, setRejected] = useState<string[]>([]);
  const turn = state.turn!;
  const team = currentTeam(state)!;

  const guessed = turn.events.filter((e) => e.outcome === 'guessed');
  const passes = turn.events.length - guessed.length;
  const penalty = state.settings.passMode === 'penalty' ? passes * PASS_PENALTY_POINTS : 0;
  const points = guessed.length - rejected.length - penalty;
  // El turno acabó antes de tiempo solo si se vació el mazo.
  const deckEmpty = turn.remainingMs > 0;

  const toggle = (id: string) =>
    setRejected((r) => (r.includes(id) ? r.filter((x) => x !== id) : [...r, id]));

  return (
    <Screen
      scroll
      footer={
        <BigButton
          label={`Confirmar ${points} ${Math.abs(points) === 1 ? 'punto' : 'puntos'}`}
          size="xl"
          onPress={() => confirmReview(rejected)}
        />
      }
    >
      <View style={styles.header}>
        <Text style={[styles.title, { color: colors.text }]}>{deckEmpty ? '¡Mazo vacío!' : '¡Tiempo!'}</Text>
        <Text style={[styles.subtitle, { color: colors.textMuted }]}>
          {team.name} · {turn.player}. Que el equipo rival revise: toca una carta para anularla.
        </Text>
      </View>

      {guessed.length === 0 ? (
        <Text style={[styles.empty, { color: colors.textMuted }]}>Ninguna carta acertada en este turno.</Text>
      ) : (
        <View style={styles.list}>
          {guessed.map((e) => {
            const off = rejected.includes(e.cardId);
            return (
              <Pressable
                key={e.cardId}
                onPress={() => toggle(e.cardId)}
                accessibilityRole="checkbox"
                accessibilityState={{ checked: !off }}
                accessibilityHint="Toca para anular o validar"
                style={[
                  styles.item,
                  { backgroundColor: colors.surface, borderColor: off ? colors.danger : colors.success },
                ]}
              >
                <Text style={[styles.mark, { color: off ? colors.danger : colors.success }]}>{off ? '✕' : '✓'}</Text>
                <Text
                  style={[
                    styles.word,
                    { color: off ? colors.textMuted : colors.text },
                    off && styles.struck,
                  ]}
                  numberOfLines={2}
                >
                  {cardById(state, e.cardId)?.text}
                </Text>
                <Text style={[styles.time, { color: colors.textMuted }]}>{(e.elapsedMs / 1000).toFixed(1)} s</Text>
              </Pressable>
            );
          })}
        </View>
      )}

      {passes > 0 ? (
        <Text style={[styles.note, { color: colors.textMuted }]}>
          {passes} {passes === 1 ? 'carta pasada' : 'cartas pasadas'}
          {penalty > 0 ? ` (−${penalty})` : ''}
        </Text>
      ) : null}
    </Screen>
  );
}

const styles = StyleSheet.create({
  header: { gap: space.xs },
  title: { fontSize: fontSize.hero, fontWeight: '900' },
  subtitle: { fontSize: fontSize.body, lineHeight: 26 },
  empty: { fontSize: fontSize.body, textAlign: 'center', marginTop: space.xl },
  list: { gap: space.sm },
  item: { flexDirection: 'row', alignItems: 'center', gap: space.md, borderWidth: 2, borderRadius: radius.md, padding: space.md, minHeight: 64 },
  mark: { fontSize: fontSize.heading, fontWeight: '900', width: 28, textAlign: 'center' },
  word: { flex: 1, fontSize: fontSize.heading, fontWeight: '800' },
  struck: { textDecorationLine: 'line-through' },
  time: { fontSize: fontSize.small, fontVariant: ['tabular-nums'] },
  note: { fontSize: fontSize.body, textAlign: 'center' },
});
