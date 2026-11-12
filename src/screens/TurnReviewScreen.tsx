import { useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { BigButton } from '../components/BigButton';
import { Screen } from '../components/Screen';
import { PASS_PENALTY_POINTS } from '../game/constants';
import { cardById, currentTeam, describer } from '../game/selectors';
import { useGame, useGameActions } from '../state/GameProvider';
import { fonts, radius, space, type as fontSize, useTheme } from '../theme/ThemeProvider';

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
  const who = describer(team, turn.player);

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
      footer={<BigButton label="Validar turno" size="xl" onPress={() => confirmReview(rejected)} />}
    >
      <View style={styles.header}>
        <Text style={[styles.title, { color: colors.text }]}>{deckEmpty ? '¡Mazo vacío!' : '¡Tiempo!'}</Text>
        <View style={styles.teamRow}>
          <View style={[styles.dot, { backgroundColor: team.color }]} />
          <Text style={[styles.teamName, { color: colors.text }]} numberOfLines={1}>
            {team.name}
            {who ? <Text style={{ color: colors.textMuted }}> · {who}</Text> : null}
          </Text>
        </View>
      </View>

      <View style={[styles.summary, { backgroundColor: colors.surface }]}>
        <Text style={[styles.points, { color: colors.text }]}>
          {points > 0 ? '+' : ''}
          {points}
        </Text>
        <View style={styles.summaryText}>
          <Text style={[styles.summaryTitle, { color: colors.text }]}>
            {Math.abs(points) === 1 ? 'punto' : 'puntos'}
          </Text>
          <Text style={[styles.summaryHint, { color: colors.textMuted }]}>
            {passes > 0
              ? `${passes} ${passes === 1 ? 'pasada' : 'pasadas'}${penalty > 0 ? ` (−${penalty})` : ''}`
              : 'Sin cartas pasadas'}
          </Text>
        </View>
      </View>

      {guessed.length > 0 ? (
        <Text style={[styles.instructions, { color: colors.textMuted }]}>
          Equipo rival: toca una carta para anularla si no vale.
        </Text>
      ) : (
        <Text style={[styles.instructions, { color: colors.textMuted }]}>
          Ninguna carta acertada en este turno.
        </Text>
      )}

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
              style={[styles.item, { backgroundColor: off ? colors.surface : colors.card }]}
            >
              <View style={[styles.mark, { backgroundColor: off ? colors.danger : colors.success }]}>
                <Text style={styles.markText}>{off ? '✕' : '✓'}</Text>
              </View>
              <Text
                style={[styles.word, { color: off ? colors.textMuted : colors.cardInk }, off && styles.struck]}
                numberOfLines={2}
              >
                {cardById(state, e.cardId)?.text}
              </Text>
              <Text style={[styles.time, { color: off ? colors.textMuted : colors.cardMuted }]}>
                {(e.elapsedMs / 1000).toFixed(1).replace('.', ',')} s
              </Text>
            </Pressable>
          );
        })}
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  header: { gap: space.xs },
  title: { fontFamily: fonts.display, fontSize: 48, lineHeight: 52, letterSpacing: -1 },
  teamRow: { flexDirection: 'row', alignItems: 'center', gap: space.sm },
  dot: { width: 14, height: 14, borderRadius: 7 },
  teamName: { flexShrink: 1, fontFamily: fonts.bold, fontSize: fontSize.body },
  summary: { flexDirection: 'row', alignItems: 'center', gap: space.md, borderRadius: radius.lg, padding: space.md },
  points: { fontFamily: fonts.display, fontSize: 56, lineHeight: 60, fontVariant: ['tabular-nums'] },
  summaryText: { flex: 1 },
  summaryTitle: { fontFamily: fonts.display, fontSize: fontSize.heading },
  summaryHint: { fontFamily: fonts.semibold, fontSize: fontSize.small },
  instructions: { fontFamily: fonts.semibold, fontSize: fontSize.body - 1 },
  list: { gap: space.sm },
  item: { flexDirection: 'row', alignItems: 'center', gap: space.md, borderRadius: radius.md, padding: space.md, minHeight: 64 },
  mark: { width: 32, height: 32, borderRadius: 16, alignItems: 'center', justifyContent: 'center' },
  markText: { color: '#FFFFFF', fontFamily: fonts.display, fontSize: 17 },
  word: { flex: 1, fontFamily: fonts.display, fontSize: 22 },
  struck: { textDecorationLine: 'line-through' },
  time: { fontFamily: fonts.semibold, fontSize: fontSize.small, fontVariant: ['tabular-nums'] },
});
