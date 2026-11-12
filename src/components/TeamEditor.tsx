import { Pressable, StyleSheet, Text, TextInput, View } from 'react-native';
import type { TeamDraft } from '../game/types';
import { readableInk } from '../theme/contrast';
import { fonts, radius, space, type as fontSize, useTheme } from '../theme/ThemeProvider';

interface Props {
  index: number;
  team: TeamDraft;
  color: string;
  canRemove: boolean;
  onChange: (team: TeamDraft) => void;
  onRemove: () => void;
}

const MAX_PLAYERS = 6;

/** Tarjeta para nombrar un equipo y a sus jugadores. La cabecera lleva el color del equipo. */
export function TeamEditor({ index, team, color, canRemove, onChange, onRemove }: Props) {
  const { colors } = useTheme();
  const ink = readableInk(color);

  const setPlayer = (i: number, name: string) =>
    onChange({ ...team, players: team.players.map((p, j) => (j === i ? name : p)) });

  return (
    <View style={[styles.card, { backgroundColor: colors.surface }]}>
      <View style={[styles.header, { backgroundColor: color }]}>
        <TextInput
          value={team.name}
          onChangeText={(name) => onChange({ ...team, name })}
          placeholder={`Equipo ${index + 1}`}
          placeholderTextColor={ink === '#FFFFFF' ? 'rgba(255,255,255,0.75)' : 'rgba(20,16,31,0.6)'}
          style={[styles.teamName, { color: ink }]}
          accessibilityLabel={`Nombre del equipo ${index + 1}`}
          maxLength={24}
        />
        {canRemove ? (
          <Pressable onPress={onRemove} accessibilityRole="button" accessibilityLabel="Quitar equipo" style={styles.icon} hitSlop={8}>
            <Text style={[styles.iconText, { color: ink }]}>✕</Text>
          </Pressable>
        ) : null}
      </View>

      <View style={styles.body}>
        {team.players.map((p, i) => (
          <View key={i} style={[styles.playerRow, { backgroundColor: colors.surfaceAlt }]}>
            <TextInput
              value={p}
              onChangeText={(name) => setPlayer(i, name)}
              placeholder={`Jugador ${i + 1}`}
              placeholderTextColor={colors.textMuted}
              style={[styles.player, { color: colors.text }]}
              accessibilityLabel={`Jugador ${i + 1} del equipo ${index + 1}`}
              maxLength={20}
            />
            {team.players.length > 1 ? (
              <Pressable
                onPress={() => onChange({ ...team, players: team.players.filter((_, j) => j !== i) })}
                accessibilityRole="button"
                accessibilityLabel={`Quitar jugador ${i + 1}`}
                style={styles.icon}
                hitSlop={4}
              >
                <Text style={[styles.iconText, { color: colors.textMuted }]}>✕</Text>
              </Pressable>
            ) : null}
          </View>
        ))}

        {team.players.length < MAX_PLAYERS ? (
          <Pressable
            onPress={() => onChange({ ...team, players: [...team.players, ''] })}
            accessibilityRole="button"
            style={styles.add}
          >
            <Text style={[styles.addText, { color: colors.text }]}>+ Jugador</Text>
          </Pressable>
        ) : null}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: { borderRadius: radius.lg, overflow: 'hidden' },
  header: { flexDirection: 'row', alignItems: 'center', paddingLeft: space.md, paddingRight: space.xs, minHeight: 60 },
  // minWidth: 0 evita que el input se salga de la tarjeta en web.
  teamName: { flex: 1, minWidth: 0, fontFamily: fonts.display, fontSize: fontSize.heading, paddingVertical: space.sm },
  body: { padding: space.sm, gap: space.xs },
  playerRow: { flexDirection: 'row', alignItems: 'center', borderRadius: radius.md, paddingLeft: space.md },
  player: { flex: 1, minWidth: 0, minHeight: 48, fontFamily: fonts.semibold, fontSize: fontSize.body },
  icon: { width: 44, height: 44, alignItems: 'center', justifyContent: 'center' },
  iconText: { fontFamily: fonts.bold, fontSize: 18 },
  add: { minHeight: 44, justifyContent: 'center', paddingHorizontal: space.sm },
  addText: { fontFamily: fonts.bold, fontSize: 16 },
});
