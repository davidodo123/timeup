import { useRouter } from 'expo-router';
import { StyleSheet, Text, View } from 'react-native';
import { BigButton } from '../components/BigButton';
import { ScoreBoard } from '../components/ScoreBoard';
import { Screen } from '../components/Screen';
import { podium, type PodiumEntry } from '../game/selectors';
import { funStats } from '../game/stats';
import { useGame, useGameActions } from '../state/GameProvider';
import { readableInk } from '../theme/contrast';
import { radius, space, type as fontSize, useTheme } from '../theme/ThemeProvider';

const STEP_HEIGHT: Record<number, number> = { 1: 150, 2: 110, 3: 80 };

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
          <BigButton label="Revancha" size="lg" onPress={rematch} />
          <BigButton label="Nueva partida" variant="ghost" size="md" onPress={newGame} />
        </View>
      }
    >
      <View style={styles.header}>
        <Text style={[styles.kicker, { color: colors.textMuted }]}>{winners.length > 1 ? 'Empate' : 'Gana'}</Text>
        <Text style={[styles.winner, { color: colors.text }]} adjustsFontSizeToFit numberOfLines={2}>
          {winners.map((w) => w.team.name).join(' y ')}
        </Text>
      </View>

      <View style={styles.podium}>
        {visual.map((entry) => (
          <View key={entry.team.id} style={styles.column}>
            <Text style={[styles.colName, { color: colors.text }]} numberOfLines={1}>{entry.team.name}</Text>
            <Text style={[styles.colPoints, { color: colors.textMuted }]}>{entry.total} pts</Text>
            <View style={[styles.step, { height: STEP_HEIGHT[entry.place] ?? 60, backgroundColor: entry.team.color }]}>
              <Text style={[styles.place, { color: readableInk(entry.team.color) }]}>{entry.place}</Text>
            </View>
          </View>
        ))}
      </View>

      <ScoreBoard scores={ranking} upToRound={3} highlightTeamId={winners[0]?.team.id} />

      {stats.length > 0 ? (
        <View style={styles.stats}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>Momentos de la partida</Text>
          {stats.map((s) => (
            <View key={s.id} style={[styles.stat, { backgroundColor: colors.surface, borderLeftColor: s.team.color }]}>
              <Text style={[styles.statTitle, { color: colors.textMuted }]}>{s.title}</Text>
              <Text style={[styles.statTeam, { color: colors.text }]}>{s.team.name}</Text>
              <Text style={[styles.statDetail, { color: colors.text }]}>{s.detail}</Text>
            </View>
          ))}
        </View>
      ) : null}
    </Screen>
  );
}

const styles = StyleSheet.create({
  header: { alignItems: 'center' },
  kicker: { fontSize: fontSize.body, fontWeight: '800', textTransform: 'uppercase', letterSpacing: 2 },
  winner: { fontSize: fontSize.hero, fontWeight: '900', textAlign: 'center' },
  podium: { flexDirection: 'row', alignItems: 'flex-end', justifyContent: 'center', gap: space.sm },
  column: { flex: 1, maxWidth: 130, alignItems: 'center', gap: 2 },
  colName: { fontSize: fontSize.body, fontWeight: '900' },
  colPoints: { fontSize: fontSize.small, fontWeight: '700', marginBottom: space.xs },
  step: { alignSelf: 'stretch', borderTopLeftRadius: radius.md, borderTopRightRadius: radius.md, alignItems: 'center', paddingTop: space.sm },
  place: { fontSize: fontSize.title, fontWeight: '900' },
  stats: { gap: space.sm },
  sectionTitle: { fontSize: fontSize.heading, fontWeight: '900' },
  stat: { borderRadius: radius.md, borderLeftWidth: 6, padding: space.md, gap: 2 },
  statTitle: { fontSize: fontSize.small, fontWeight: '800', textTransform: 'uppercase', letterSpacing: 1 },
  statTeam: { fontSize: fontSize.heading, fontWeight: '900' },
  statDetail: { fontSize: fontSize.body, lineHeight: 24 },
  actions: { gap: space.sm },
});
