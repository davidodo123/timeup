import { StyleSheet, Text, View } from 'react-native';
import type { TeamScore } from '../game/selectors';
import type { RoundNumber } from '../game/types';
import { radius, space, type as fontSize, useTheme } from '../theme/ThemeProvider';

interface Props {
  scores: TeamScore[];
  /** Hasta qué ronda se enseñan columnas. */
  upToRound: RoundNumber;
  highlightTeamId?: string;
}

export function ScoreBoard({ scores, upToRound, highlightTeamId }: Props) {
  const { colors } = useTheme();
  const rounds = ([1, 2, 3] as RoundNumber[]).filter((r) => r <= upToRound);

  return (
    <View style={[styles.table, { backgroundColor: colors.surface, borderColor: colors.border }]}>
      <View style={styles.row}>
        <Text style={[styles.name, styles.head, { color: colors.textMuted }]}>Equipo</Text>
        {rounds.map((r) => (
          <Text key={r} style={[styles.cell, styles.head, { color: colors.textMuted }]}>R{r}</Text>
        ))}
        <Text style={[styles.cell, styles.head, { color: colors.textMuted }]}>Total</Text>
      </View>
      {scores.map(({ team, rounds: pts, total }) => (
        <View
          key={team.id}
          style={[styles.row, team.id === highlightTeamId && { backgroundColor: colors.surfaceAlt }]}
        >
          <View style={[styles.name, styles.nameWrap]}>
            <View style={[styles.dot, { backgroundColor: team.color }]} />
            <Text style={[styles.text, { color: colors.text }]} numberOfLines={1}>{team.name}</Text>
          </View>
          {rounds.map((r) => (
            <Text key={r} style={[styles.cell, styles.text, { color: colors.text }]}>{pts[r]}</Text>
          ))}
          <Text style={[styles.cell, styles.total, { color: colors.text }]}>{total}</Text>
        </View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  table: { borderRadius: radius.md, borderWidth: 2, overflow: 'hidden' },
  row: { flexDirection: 'row', alignItems: 'center', paddingVertical: space.sm, paddingHorizontal: space.md },
  head: { fontSize: fontSize.small, fontWeight: '800' },
  name: { flex: 1 },
  nameWrap: { flexDirection: 'row', alignItems: 'center', gap: space.sm },
  dot: { width: 14, height: 14, borderRadius: 7 },
  cell: { width: 52, textAlign: 'center', fontVariant: ['tabular-nums'] },
  text: { fontSize: fontSize.body, fontWeight: '700' },
  total: { fontSize: fontSize.heading, fontWeight: '900' },
});
