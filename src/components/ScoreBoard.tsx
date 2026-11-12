import { StyleSheet, Text, View } from 'react-native';
import type { TeamScore } from '../game/selectors';
import type { RoundNumber } from '../game/types';
import { fonts, radius, space, type as fontSize, useTheme } from '../theme/ThemeProvider';

interface Props {
  scores: TeamScore[];
  /** Hasta qué ronda se enseñan columnas. */
  upToRound: RoundNumber;
}

/** Marcador por rondas. El total va en grande: es lo único que se mira de lejos. */
export function ScoreBoard({ scores, upToRound }: Props) {
  const { colors } = useTheme();
  const rounds = ([1, 2, 3] as RoundNumber[]).filter((r) => r <= upToRound);
  const showRounds = upToRound > 1;

  return (
    <View style={[styles.table, { backgroundColor: colors.surface }]}>
      {showRounds ? (
        <View style={[styles.row, styles.headRow]}>
          <View style={styles.name} />
          {rounds.map((r) => (
            <Text key={r} style={[styles.cell, styles.head, { color: colors.textMuted }]}>R{r}</Text>
          ))}
          <Text style={[styles.totalCell, styles.head, { color: colors.textMuted }]}>Total</Text>
        </View>
      ) : null}
      {scores.map(({ team, rounds: pts, total }, i) => (
        <View key={team.id} style={[styles.row, i > 0 && { borderTopWidth: 1, borderTopColor: colors.border }]}>
          <View style={[styles.name, styles.nameWrap]}>
            <View style={[styles.dot, { backgroundColor: team.color }]} />
            <Text style={[styles.teamName, { color: colors.text }]} numberOfLines={1}>{team.name}</Text>
          </View>
          {showRounds
            ? rounds.map((r) => (
                <Text key={r} style={[styles.cell, styles.pts, { color: colors.textMuted }]}>{pts[r]}</Text>
              ))
            : null}
          <Text style={[styles.totalCell, styles.total, { color: colors.text }]}>{total}</Text>
        </View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  table: { borderRadius: radius.lg, paddingHorizontal: space.md, paddingVertical: space.xs },
  row: { flexDirection: 'row', alignItems: 'center', minHeight: 52 },
  headRow: { minHeight: 0, paddingTop: space.sm },
  head: { fontFamily: fonts.semibold, fontSize: fontSize.small - 1 },
  name: { flex: 1, minWidth: 0 },
  nameWrap: { flexDirection: 'row', alignItems: 'center', gap: space.sm },
  dot: { width: 14, height: 14, borderRadius: 7 },
  teamName: { flexShrink: 1, fontFamily: fonts.bold, fontSize: fontSize.body },
  cell: { width: 38, textAlign: 'center', fontVariant: ['tabular-nums'] },
  totalCell: { width: 60, textAlign: 'right', fontVariant: ['tabular-nums'] },
  pts: { fontFamily: fonts.semibold, fontSize: 16 },
  total: { fontFamily: fonts.display, fontSize: 28 },
});
