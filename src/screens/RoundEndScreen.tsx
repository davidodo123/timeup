import { StyleSheet, Text, View } from 'react-native';
import { BigButton } from '../components/BigButton';
import { RoundPips } from '../components/RoundPips';
import { ScoreBoard } from '../components/ScoreBoard';
import { Screen } from '../components/Screen';
import { ROUND_RULES } from '../game/constants';
import { currentPlayer, currentTeam, describer, scores } from '../game/selectors';
import type { RoundNumber } from '../game/types';
import { useGame, useGameActions } from '../state/GameProvider';
import { fonts, radius, space, type as fontSize, useTheme } from '../theme/ThemeProvider';

/** Entre rondas: marcador y la carta de la ronda que viene. */
export function RoundEndScreen() {
  const state = useGame();
  const { nextRound } = useGameActions();
  const { colors } = useTheme();
  const next = (state.round + 1) as RoundNumber;
  const rule = ROUND_RULES[next];
  const team = currentTeam(state);
  const sorted = scores(state).sort((a, b) => b.total - a.total);
  const who = team ? describer(team, currentPlayer(state)) : null;

  return (
    <Screen scroll footer={<BigButton label={`Empezar ronda ${next}`} size="xl" onPress={nextRound} />}>
      <View style={styles.header}>
        <RoundPips round={state.round} />
        <Text style={[styles.title, { color: colors.text }]}>Ronda {state.round}{'\n'}terminada</Text>
      </View>

      <ScoreBoard scores={sorted} upToRound={state.round} />

      <View style={[styles.next, { backgroundColor: colors.card }]}>
        <Text style={[styles.nextNum, { color: colors.cardInk }]}>{next}</Text>
        <View style={styles.nextText}>
          <Text style={[styles.kicker, { color: colors.cardMuted }]}>Siguiente ronda</Text>
          <Text style={[styles.ruleTitle, { color: colors.cardInk }]}>{rule.short}</Text>
          <Text style={[styles.rule, { color: colors.cardInk }]}>{rule.description}</Text>
          <Text style={[styles.rule, { color: colors.cardMuted }]}>
            Se barajan otra vez las {state.cards.length} cartas.
          </Text>
        </View>
      </View>

      {state.carryOverMs && team ? (
        <Text style={[styles.carry, { color: colors.text }]}>
          Empieza {who ? `${who} (${team.name})` : team.name} con los {Math.round(state.carryOverMs / 1000)} s que le sobraron.
        </Text>
      ) : null}
    </Screen>
  );
}

const styles = StyleSheet.create({
  header: { gap: space.md },
  title: { fontFamily: fonts.display, fontSize: 48, lineHeight: 50, letterSpacing: -1 },
  next: { flexDirection: 'row', gap: space.md, borderRadius: radius.lg, padding: space.lg },
  nextNum: { fontFamily: fonts.display, fontSize: 80, lineHeight: 80 },
  nextText: { flex: 1, gap: 4 },
  kicker: { fontFamily: fonts.bold, fontSize: fontSize.small },
  ruleTitle: { fontFamily: fonts.display, fontSize: fontSize.heading },
  rule: { fontFamily: fonts.body, fontSize: fontSize.body - 1, lineHeight: 23 },
  carry: { fontFamily: fonts.semibold, fontSize: fontSize.body, lineHeight: 25 },
});
