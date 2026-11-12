import { useRouter } from 'expo-router';
import { StyleSheet, Text, View } from 'react-native';
import Animated, { FadeInUp } from 'react-native-reanimated';
import { BigButton } from '../components/BigButton';
import { ScoreBoard } from '../components/ScoreBoard';
import { Screen } from '../components/Screen';
import { podium, type PodiumEntry } from '../game/selectors';
import { funStats } from '../game/stats';
import { useGame, useGameActions } from '../state/GameProvider';
import { readableInk } from '../theme/contrast';
import { fonts, radius, space, type as fontSize, useTheme } from '../theme/ThemeProvider';

const STEP_HEIGHT: Record<number, number> = { 1: 140, 2: 100, 3: 70 };
/** El podio se revela de abajo arriba: 3.º, 2.º y por último el ganador. */
const REVEAL_DELAY: Record<number, number> = { 3: 0, 2: 250, 1: 550 };

/** Pantalla final: podio, marcador por rondas y estadísticas divertidas. */
export function PodiumScreen() {
  const state = useGame();
  const { startGame, reset } = useGameActions();
  const { colors } = useTheme();
  const router = useRouter();
  const ranking = podium(state);
  const winners = ranking.filter((r) => r.place === 1);
  const stats = funStats(state);

  // Orden visual del podio: 2.º, 1.º, 3.º.
  const top = ranking.slice(0, 3);
  const visual = [top[1], top[0], top[2]].filter(Boolean) as PodiumEntry[];

  const rematch = () =>
    startGame(
      state.settings,
      state.teams.map((t) => ({ name: t.name, players: t.players })),
    );

  const newGame = () => {
    reset();
    router.replace('/');
  };

  return (
    <Screen
      scroll
      footer={
        <View style={styles.actions}>
          <BigButton label="Nueva partida" variant="ghost" size="lg" onPress={newGame} style={styles.flex} />
          <BigButton label="Revancha" size="lg" onPress={rematch} style={styles.flex} />
        </View>
      }
    >
      <View style={styles.header}>
        <Text style={[styles.kicker, { color: colors.textMuted }]}>{winners.length > 1 ? 'Empate entre' : 'Ha ganado'}</Text>
        <Text style={[styles.winner, { color: colors.text }]} adjustsFontSizeToFit numberOfLines={2}>
          {winners.map((w) => w.team.name).join(' y ')}
        </Text>
      </View>

      <View style={styles.podium}>
        {visual.map((entry) => (
          <Animated.View
            key={entry.team.id}
            entering={FadeInUp.delay(REVEAL_DELAY[entry.place] ?? 0).springify().damping(14)}
            style={styles.column}
          >
            <Text style={[styles.colName, { color: colors.text }]} numberOfLines={1}>{entry.team.name}</Text>
            <Text style={[styles.colPoints, { color: colors.textMuted }]}>{entry.total} pts</Text>
            <View style={[styles.step, { height: STEP_HEIGHT[entry.place] ?? 60, backgroundColor: entry.team.color }]}>
              <Text style={[styles.place, { color: readableInk(entry.team.color) }]}>{entry.place}</Text>
            </View>
          </Animated.View>
        ))}
      </View>

      <ScoreBoard scores={ranking} upToRound={3} />

      {stats.length > 0 ? (
        <View style={styles.stats}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>Lo mejor de la partida</Text>
          {stats.map((s) => (
            <View key={s.id} style={[styles.stat, { backgroundColor: colors.surface }]}>
              <Text style={[styles.statTitle, { color: colors.textMuted }]}>{s.title}</Text>
              <View style={styles.statTeam}>
                <View style={[styles.dot, { backgroundColor: s.team.color }]} />
                <Text style={[styles.statTeamName, { color: colors.text }]} numberOfLines={1}>{s.team.name}</Text>
              </View>
              <Text style={[styles.statDetail, { color: colors.text }]}>{s.detail}</Text>
            </View>
          ))}
        </View>
      ) : null}
    </Screen>
  );
}

const styles = StyleSheet.create({
  header: { alignItems: 'center', gap: 2 },
  kicker: { fontFamily: fonts.bold, fontSize: fontSize.body },
  winner: { fontFamily: fonts.display, fontSize: 58, lineHeight: 62, textAlign: 'center', letterSpacing: -1.5 },
  podium: { flexDirection: 'row', alignItems: 'flex-end', justifyContent: 'center', gap: space.sm, marginTop: space.sm },
  column: { flex: 1, maxWidth: 130, alignItems: 'center', gap: 2 },
  colName: { fontFamily: fonts.display, fontSize: fontSize.body, maxWidth: '100%' },
  colPoints: { fontFamily: fonts.semibold, fontSize: fontSize.small, marginBottom: space.xs },
  step: { alignSelf: 'stretch', borderTopLeftRadius: radius.md, borderTopRightRadius: radius.md, alignItems: 'center', paddingTop: space.sm },
  place: { fontFamily: fonts.display, fontSize: 40 },
  stats: { gap: space.sm, marginTop: space.sm },
  sectionTitle: { fontFamily: fonts.display, fontSize: 28 },
  stat: { borderRadius: radius.lg, padding: space.md, gap: 4 },
  statTitle: { fontFamily: fonts.bold, fontSize: fontSize.small },
  statTeam: { flexDirection: 'row', alignItems: 'center', gap: space.sm },
  dot: { width: 14, height: 14, borderRadius: 7 },
  statTeamName: { flexShrink: 1, fontFamily: fonts.display, fontSize: fontSize.heading - 2 },
  statDetail: { fontFamily: fonts.body, fontSize: fontSize.body - 1, lineHeight: 23 },
  actions: { flexDirection: 'row', gap: space.sm },
  flex: { flex: 1 },
});
