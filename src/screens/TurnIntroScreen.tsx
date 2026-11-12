import { StyleSheet, Text, View } from 'react-native';
import { BigButton } from '../components/BigButton';
import { Screen } from '../components/Screen';
import { ROUND_RULES } from '../game/constants';
import { cardsLeft, currentPlayer, currentTeam } from '../game/selectors';
import { haptics } from '../services/haptics';
import { useGame, useGameActions } from '../state/GameProvider';
import { readableInk } from '../theme/contrast';
import { radius, space, type as fontSize } from '../theme/ThemeProvider';

/** "Turno del equipo X. Pásale el móvil a Y." Fondo con el color del equipo. */
export function TurnIntroScreen() {
  const state = useGame();
  const { startTurn } = useGameActions();
  const team = currentTeam(state);
  if (!team) return null;

  const ink = readableInk(team.color);
  const veil = ink === '#FFFFFF' ? 'rgba(0,0,0,0.22)' : 'rgba(255,255,255,0.35)';
  const rule = ROUND_RULES[state.round];
  const player = currentPlayer(state);
  const seconds = Math.round((state.carryOverMs ?? state.settings.turnSeconds * 1000) / 1000);
  const hasPlayer = player !== team.name;
  const text = { color: ink };

  return (
    <Screen
      background={team.color}
      style={styles.content}
      footer={
        <BigButton
          label="¡Empezar!"
          size="xl"
          variant="ghost"
          textColor={ink}
          style={{ backgroundColor: veil, borderColor: ink }}
          onPress={() => {
            haptics.tap();
            startTurn();
          }}
        />
      }
    >
      <View style={[styles.pill, { backgroundColor: veil }]}>
        <Text style={[styles.pillText, text]}>{rule.title}</Text>
      </View>

      <View style={styles.center}>
        <Text style={[styles.label, text]}>Turno de</Text>
        <Text style={[styles.team, text]} adjustsFontSizeToFit numberOfLines={2}>{team.name}</Text>
        <Text style={[styles.label, styles.gap, text]}>
          {hasPlayer ? 'Pásale el móvil a' : 'Pásale el móvil a quien describe'}
        </Text>
        {hasPlayer ? (
          <Text style={[styles.player, text]} adjustsFontSizeToFit numberOfLines={1}>{player}</Text>
        ) : null}
      </View>

      <View style={[styles.info, { backgroundColor: veil }]}>
        <Text style={[styles.rule, text]}>{rule.description}</Text>
        <Text style={[styles.meta, text]}>
          {seconds} s{state.carryOverMs ? ' (el tiempo que te sobró)' : ''} · quedan {cardsLeft(state)} cartas
        </Text>
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  content: { justifyContent: 'space-between' },
  pill: { alignSelf: 'center', borderRadius: radius.pill, paddingHorizontal: space.md, paddingVertical: space.xs },
  pillText: { fontSize: fontSize.body, fontWeight: '800' },
  center: { alignItems: 'center' },
  label: { fontSize: fontSize.heading, fontWeight: '700', textAlign: 'center' },
  gap: { marginTop: space.xl },
  team: { fontSize: fontSize.hero, fontWeight: '900', textAlign: 'center' },
  player: { fontSize: fontSize.hero + 8, fontWeight: '900', textAlign: 'center' },
  info: { borderRadius: radius.lg, padding: space.md, gap: space.xs },
  rule: { fontSize: fontSize.body, fontWeight: '700', textAlign: 'center', lineHeight: 26 },
  meta: { fontSize: fontSize.small, textAlign: 'center' },
});
