import { StyleSheet, Text, View } from 'react-native';
import { BigButton } from '../components/BigButton';
import { ScoreBoard } from '../components/ScoreBoard';
import { Screen } from '../components/Screen';
import { ROUND_RULES } from '../game/constants';
import { currentPlayer, currentTeam, scores } from '../game/selectors';
import type { RoundNumber } from '../game/types';
import { useGame, useGameActions } from '../state/GameProvider';
import { radius, space, type as fontSize, useTheme } from '../theme/ThemeProvider';

/** Entre rondas: marcador y reglas de la ronda que viene. */
export function RoundEndScreen() {
  const state = useGame();
  const { nextRound } = useGameActions();
  const { colors } = useTheme();
  const next = (state.round + 1) as RoundNumber;
  const rule = ROUND_RULES[next];
  const team = currentTeam(state);

  return (
    <Screen scroll footer={<BigButton label={`Empezar ronda ${next}`} size="xl" onPress={nextRound} />}>
      <Text style={[styles.title, { color: colors.text }]}>Fin de la ronda {state.round}</Text>
      <ScoreBoard scores={scores(state)} upToRound={state.round} />

      <View style={[styles.next, { backgroundColor: colors.surface, borderColor: colors.accent }]}>
        <Text style={[styles.kicker, { color: colors.accent }]}>Siguiente</Text>
        <Text style={[styles.ruleTitle, { color: colors.text }]}>{rule.title}</Text>
        <Text style={[styles.rule, { color: colors.text }]}>{rule.description}</Text>
        <Text style={[styles.rule, { color: colors.textMuted }]}>
          Se barajan otra vez las {state.cards.length} cartas.
        </Text>
        {state.carryOverMs && team ? (
          <Text style={[styles.rule, { color: colors.text }]}>
            Empieza {currentPlayer(state)} ({team.name}) con los {Math.round(state.carryOverMs / 1000)} s que le sobraron.
          </Text>
        ) : null}
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  title: { fontSize: fontSize.title + 4, fontWeight: '900' },
  next: { borderRadius: radius.lg, borderWidth: 3, padding: space.lg, gap: space.sm },
  kicker: { fontSize: fontSize.small, fontWeight: '900', textTransform: 'uppercase', letterSpacing: 1 },
  ruleTitle: { fontSize: fontSize.heading, fontWeight: '900' },
  rule: { fontSize: fontSize.body, lineHeight: 26 },
});
