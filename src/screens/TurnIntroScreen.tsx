import { StyleSheet, Text, View } from 'react-native';
import { BigButton } from '../components/BigButton';
import { RoundPips } from '../components/RoundPips';
import { Screen } from '../components/Screen';
import { ROUND_RULES } from '../game/constants';
import { cardsLeft, currentPlayer, currentTeam, describer } from '../game/selectors';
import { haptics } from '../services/haptics';
import { useGame, useGameActions } from '../state/GameProvider';
import { readableInk } from '../theme/contrast';
import { fonts, radius, space, type as fontSize } from '../theme/ThemeProvider';

/** "Turno de X. Pásale el móvil a Y." Toda la pantalla con el color del equipo. */
export function TurnIntroScreen() {
  const state = useGame();
  const { startTurn } = useGameActions();
  const team = currentTeam(state);
  if (!team) return null;

  const ink = readableInk(team.color);
  const veil = ink === '#FFFFFF' ? 'rgba(0,0,0,0.18)' : 'rgba(255,255,255,0.4)';
  const rule = ROUND_RULES[state.round];
  const who = describer(team, currentPlayer(state));
  const seconds = Math.round((state.carryOverMs ?? state.settings.turnSeconds * 1000) / 1000);
  const text = { color: ink };

  return (
    <Screen
      background={team.color}
      style={styles.content}
      footer={
        <BigButton
          label="¡Empezar!"
          size="xl"
          // Botón en tinta sólida con el color del equipo: máximo contraste en cualquier color.
          backgroundColor={ink}
          textColor={team.color}
          style={styles.start}
          onPress={() => {
            haptics.tap();
            startTurn();
          }}
        />
      }
    >
      <View style={styles.top}>
        <RoundPips round={state.round} ink={ink} />
        <Text style={[styles.meta, text]}>
          {seconds} s{state.carryOverMs ? ' sobrantes' : ''} · {cardsLeft(state)} cartas
        </Text>
      </View>

      <View style={styles.center}>
        <Text style={[styles.label, text]}>Turno de</Text>
        <Text style={[styles.team, text]} adjustsFontSizeToFit numberOfLines={2}>{team.name}</Text>

        <View style={[styles.ticket, { backgroundColor: veil }]}>
          <Text style={[styles.label, text]}>Pásale el móvil a</Text>
          {who ? (
            <Text style={[styles.player, text]} adjustsFontSizeToFit numberOfLines={1}>{who}</Text>
          ) : (
            <Text style={[styles.playerGeneric, text]}>quien vaya a describir</Text>
          )}
        </View>
      </View>

      <View style={styles.rule}>
        <Text style={[styles.ruleTitle, text]}>{rule.title}</Text>
        <Text style={[styles.ruleText, text]}>{rule.description}</Text>
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  content: { justifyContent: 'space-between' },
  top: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  meta: { fontFamily: fonts.bold, fontSize: fontSize.small + 1 },
  center: { alignItems: 'center', gap: space.xs },
  label: { fontFamily: fonts.semibold, fontSize: fontSize.body + 2, textAlign: 'center' },
  team: { fontFamily: fonts.display, fontSize: 64, lineHeight: 68, textAlign: 'center', letterSpacing: -1.5 },
  ticket: {
    marginTop: space.lg,
    alignSelf: 'stretch',
    borderRadius: radius.lg,
    paddingVertical: space.md,
    paddingHorizontal: space.lg,
    alignItems: 'center',
  },
  player: { fontFamily: fonts.display, fontSize: 44, lineHeight: 50, textAlign: 'center' },
  playerGeneric: { fontFamily: fonts.display, fontSize: 30, lineHeight: 34, textAlign: 'center' },
  rule: { gap: 4 },
  ruleTitle: { fontFamily: fonts.display, fontSize: fontSize.heading, textAlign: 'center' },
  ruleText: { fontFamily: fonts.semibold, fontSize: fontSize.body - 1, textAlign: 'center', lineHeight: 24 },
  start: { borderRadius: radius.lg },
});
