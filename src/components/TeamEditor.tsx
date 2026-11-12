import { Pressable, StyleSheet, Text, TextInput, View } from 'react-native';
import type { TeamDraft } from '../game/types';
import { readableInk } from '../theme/contrast';
import { radius, space, type as fontSize, useTheme } from '../theme/ThemeProvider';

interface Props {
  index: number;
  team: TeamDraft;
  color: string;
  canRemove: boolean;
  onChange: (team: TeamDraft) => void;
  onRemove: () => void;
}

const MAX_PLAYERS = 6;

/** Tarjeta para nombrar un equipo y a sus jugadores. */
export function TeamEditor({ index, team, color, canRemove, onChange, onRemove }: Props) {
  const { colors } = useTheme();
  const inputStyle = [styles.input, { color: colors.text, backgroundColor: colors.surfaceAlt }];

  const setPlayer = (i: number, name: string) =>
    onChange({ ...team, players: team.players.map((p, j) => (j === i ? name : p)) });

  return (
    <View style={[styles.card, { backgroundColor: colors.surface, borderColor: color }]}>
      <View style={styles.header}>
        <View style={[styles.badge, { backgroundColor: color }]}>
          <Text style={[styles.badgeText, { color: readableInk(color) }]}>{index + 1}</Text>
        </View>
        <TextInput
          value={team.name}
          onChangeText={(name) => onChange({ ...team, name })}
          placeholder={`Equipo ${index + 1}`}
          placeholderTextColor={colors.textMuted}
          style={[inputStyle, styles.teamName]}
          accessibilityLabel={`Nombre del equipo ${index + 1}`}
          maxLength={24}
        />
        {canRemove ? (
          <Pressable onPress={onRemove} accessibilityRole="button" accessibilityLabel="Quitar equipo" style={styles.icon} hitSlop={8}>
            <Text style={[styles.iconText, { color: colors.textMuted }]}>✕</Text>
          </Pressable>
        ) : null}
      </View>

      {team.players.map((p, i) => (
        <View key={i} style={styles.playerRow}>
          <TextInput
            value={p}
            onChangeText={(name) => setPlayer(i, name)}
            placeholder={`Jugador ${i + 1}`}
            placeholderTextColor={colors.textMuted}
            style={[inputStyle, styles.player]}
            accessibilityLabel={`Jugador ${i + 1} del equipo ${index + 1}`}
            maxLength={20}
          />
          {team.players.length > 1 ? (
            <Pressable
              onPress={() => onChange({ ...team, players: team.players.filter((_, j) => j !== i) })}
              accessibilityRole="button"
              accessibilityLabel={`Quitar jugador ${i + 1}`}
              style={styles.icon}
              hitSlop={8}
            >
              <Text style={[styles.iconText, { color: colors.textMuted }]}>−</Text>
            </Pressable>
          ) : null}
        </View>
      ))}

      {team.players.length < MAX_PLAYERS ? (
        <Pressable onPress={() => onChange({ ...team, players: [...team.players, ''] })} accessibilityRole="button" style={styles.add}>
          <Text style={[styles.addText, { color: colors.accent }]}>+ Añadir jugador</Text>
        </Pressable>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  card: { borderRadius: radius.lg, borderWidth: 3, padding: space.md, gap: space.sm },
  header: { flexDirection: 'row', alignItems: 'center', gap: space.sm },
  badge: { width: 40, height: 40, borderRadius: 20, alignItems: 'center', justifyContent: 'center' },
  badgeText: { fontSize: fontSize.body, fontWeight: '900' },
  input: { borderRadius: radius.md, paddingHorizontal: space.md, minHeight: 48, fontSize: fontSize.body },
  teamName: { flex: 1, fontWeight: '800', fontSize: fontSize.heading - 2 },
  playerRow: { flexDirection: 'row', alignItems: 'center', gap: space.sm },
  player: { flex: 1 },
  icon: { width: 44, height: 44, alignItems: 'center', justifyContent: 'center' },
  iconText: { fontSize: 22, fontWeight: '800' },
  add: { minHeight: 44, justifyContent: 'center' },
  addText: { fontSize: fontSize.body, fontWeight: '800' },
});
