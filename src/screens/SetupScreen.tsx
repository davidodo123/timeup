import { useRouter } from 'expo-router';
import { useState, type ReactNode } from 'react';
import { Pressable, StyleSheet, Switch, Text, View } from 'react-native';
import { BigButton } from '../components/BigButton';
import { Chip } from '../components/Chip';
import { Screen } from '../components/Screen';
import { Segmented } from '../components/Segmented';
import { TeamEditor } from '../components/TeamEditor';
import { CARD_LIBRARY, CATEGORIES } from '../data/cards';
import {
  CARD_COUNT_OPTIONS,
  DEFAULT_SETTINGS,
  MAX_TEAMS,
  MIN_TEAMS,
  TEAM_COLORS,
  TURN_SECONDS_OPTIONS,
} from '../game/constants';
import { availableCount } from '../game/deck';
import type { CategoryId, GameSettings, PassMode, TeamDraft } from '../game/types';
import { useGameActions } from '../state/GameProvider';
import { fonts, radius, space, type as fontSize, useTheme, type ThemeMode } from '../theme/ThemeProvider';

const DEFAULT_TEAMS: TeamDraft[] = [
  { name: '', players: ['', ''] },
  { name: '', players: ['', ''] },
];

const PASS_LABELS: Record<PassMode, string> = { free: 'Gratis', penalty: '−1 punto' };
const THEME_LABELS: Record<ThemeMode, string> = { system: 'Auto', light: 'Claro', dark: 'Oscuro' };

/** Las tres rondas, en la portada: explican el juego antes de configurarlo. */
const ROUNDS = [
  { n: 1, name: 'Describe' },
  { n: 2, name: 'Una palabra' },
  { n: 3, name: 'Mímica' },
];

export function SetupScreen() {
  const router = useRouter();
  const { startGame } = useGameActions();
  const { colors, mode, setMode } = useTheme();
  const [teams, setTeams] = useState<TeamDraft[]>(DEFAULT_TEAMS);
  const [settings, setSettings] = useState<GameSettings>(DEFAULT_SETTINGS);

  const set = <K extends keyof GameSettings>(key: K, value: GameSettings[K]) =>
    setSettings((s) => ({ ...s, [key]: value }));

  const available = availableCount(CARD_LIBRARY, settings.categories);
  const cardCount = Math.min(settings.cardCount, available);

  const toggleCategory = (id: CategoryId) =>
    set(
      'categories',
      settings.categories.includes(id)
        ? settings.categories.filter((c) => c !== id)
        : [...settings.categories, id],
    );

  const start = () => {
    startGame({ ...settings, cardCount }, teams);
    router.push('/partida');
  };

  return (
    <Screen
      scroll
      footer={
        <BigButton
          label="¡A jugar!"
          size="xl"
          onPress={start}
          disabled={teams.length < MIN_TEAMS || cardCount === 0}
        />
      }
    >
      <View style={styles.hero}>
        <Text style={[styles.title, { color: colors.text }]}>Tres{'\n'}Rondas</Text>
        <View style={styles.fan}>
          {ROUNDS.map((r) => (
            <View
              key={r.n}
              style={[
                styles.mini,
                { backgroundColor: colors.card, borderColor: colors.cardEdge, transform: [{ rotate: `${(r.n - 2) * 7}deg` }, { translateY: r.n === 2 ? -6 : 0 }] },
              ]}
            >
              <Text style={[styles.miniNum, { color: colors.cardInk }]}>{r.n}</Text>
              <Text style={[styles.miniName, { color: colors.cardMuted }]} numberOfLines={2}>{r.name}</Text>
            </View>
          ))}
        </View>
        <Text style={[styles.subtitle, { color: colors.textMuted }]}>
          Las mismas cartas en las tres rondas. Pasaos el móvil y que gane quien mejor se entienda.
        </Text>
      </View>

      <Section title="Equipos" aside={`${teams.length}`}>
        {teams.map((team, i) => (
          <TeamEditor
            key={i}
            index={i}
            team={team}
            color={TEAM_COLORS[i % TEAM_COLORS.length]}
            canRemove={teams.length > MIN_TEAMS}
            onChange={(t) => setTeams((all) => all.map((x, j) => (j === i ? t : x)))}
            onRemove={() => setTeams((all) => all.filter((_, j) => j !== i))}
          />
        ))}
        {teams.length < MAX_TEAMS ? (
          <BigButton
            label="+ Añadir equipo"
            variant="ghost"
            size="md"
            onPress={() => setTeams((all) => [...all, { name: '', players: ['', ''] }])}
          />
        ) : null}
      </Section>

      <Section title="Cartas" aside={`${available} disponibles`}>
        <View style={styles.chips}>
          <Chip label="Todas" selected={settings.categories.length === 0} onPress={() => set('categories', [])} />
          {CATEGORIES.map((c) => (
            <Chip key={c.id} label={c.name} selected={settings.categories.includes(c.id)} onPress={() => toggleCategory(c.id)} />
          ))}
        </View>
        <Segmented
          label="Cartas en la partida"
          options={CARD_COUNT_OPTIONS}
          value={cardCount}
          onChange={(v) => set('cardCount', v)}
          isDisabled={(v) => v > available}
        />
      </Section>

      <Section title="Turnos">
        <Segmented
          label="Segundos por turno"
          options={TURN_SECONDS_OPTIONS}
          value={settings.turnSeconds}
          onChange={(v) => set('turnSeconds', v)}
        />
        <Segmented
          label="Pasar una carta cuesta"
          options={['free', 'penalty'] as PassMode[]}
          value={settings.passMode}
          onChange={(v) => set('passMode', v)}
          format={(v) => PASS_LABELS[v]}
        />
        <Pressable
          onPress={() => set('carryOverTime', !settings.carryOverTime)}
          style={[styles.toggle, { backgroundColor: colors.surfaceAlt }]}
          accessibilityRole="switch"
          accessibilityState={{ checked: settings.carryOverTime }}
        >
          <View style={styles.toggleText}>
            <Text style={[styles.toggleTitle, { color: colors.text }]}>Guardar el tiempo sobrante</Text>
            <Text style={[styles.toggleHint, { color: colors.textMuted }]}>
              Quien vacía el mazo empieza la ronda siguiente con el tiempo que le quedaba.
            </Text>
          </View>
          <Switch
            value={settings.carryOverTime}
            onValueChange={(v) => set('carryOverTime', v)}
            trackColor={{ false: colors.border, true: colors.success }}
            thumbColor="#FFFFFF"
            // En web react-native-web usa su propio color de bola si no se le indica.
            {...({ activeThumbColor: '#FFFFFF' } as object)}
          />
        </Pressable>
      </Section>

      <Section title="Tema">
        <Segmented
          label="Colores de la app"
          options={['system', 'light', 'dark'] as ThemeMode[]}
          value={mode}
          onChange={setMode}
          format={(v) => THEME_LABELS[v]}
        />
      </Section>
    </Screen>
  );
}

function Section({ title, aside, children }: { title: string; aside?: string; children: ReactNode }) {
  const { colors } = useTheme();
  return (
    <View style={styles.section}>
      <View style={styles.sectionHead}>
        <Text style={[styles.sectionTitle, { color: colors.text }]}>{title}</Text>
        {aside ? <Text style={[styles.aside, { color: colors.textMuted }]}>{aside}</Text> : null}
      </View>
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  hero: { gap: space.md, paddingTop: space.sm, paddingBottom: space.sm },
  title: { fontFamily: fonts.display, fontSize: 60, lineHeight: 58, letterSpacing: -2 },
  fan: { flexDirection: 'row', gap: space.sm, paddingVertical: space.sm },
  mini: {
    flex: 1,
    aspectRatio: 0.72,
    maxWidth: 110,
    borderRadius: radius.md,
    borderWidth: 1,
    padding: space.sm,
    justifyContent: 'space-between',
  },
  miniNum: { fontFamily: fonts.display, fontSize: 40, lineHeight: 42 },
  miniName: { fontFamily: fonts.bold, fontSize: 15, lineHeight: 18 },
  subtitle: { fontFamily: fonts.body, fontSize: fontSize.body, lineHeight: 26 },
  section: { gap: space.md, marginTop: space.md },
  sectionHead: { flexDirection: 'row', alignItems: 'baseline', justifyContent: 'space-between' },
  sectionTitle: { fontFamily: fonts.display, fontSize: 30 },
  aside: { fontFamily: fonts.semibold, fontSize: fontSize.small },
  chips: { flexDirection: 'row', flexWrap: 'wrap', gap: space.sm },
  toggle: { flexDirection: 'row', alignItems: 'center', gap: space.md, borderRadius: radius.md, padding: space.md },
  toggleText: { flex: 1, gap: 2 },
  toggleTitle: { fontFamily: fonts.bold, fontSize: 17 },
  toggleHint: { fontFamily: fonts.body, fontSize: fontSize.small, lineHeight: 20 },
});
