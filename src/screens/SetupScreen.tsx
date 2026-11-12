import { useRouter } from 'expo-router';
import { useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { BigButton } from '../components/BigButton';
import { Chip } from '../components/Chip';
import { OptionPicker } from '../components/OptionPicker';
import { Screen } from '../components/Screen';
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
import { space, type as fontSize, useTheme, type ThemeMode } from '../theme/ThemeProvider';

const DEFAULT_TEAMS: TeamDraft[] = [
  { name: '', players: ['', ''] },
  { name: '', players: ['', ''] },
];

const PASS_LABELS: Record<PassMode, string> = { free: 'Sin penalización', penalty: '−1 punto' };
const THEME_LABELS: Record<ThemeMode, string> = { system: 'Automático', light: 'Claro', dark: 'Oscuro' };

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
      footer={<BigButton label="¡A jugar!" size="xl" onPress={start} disabled={teams.length < MIN_TEAMS || cardCount === 0} />}
    >
      <View>
        <Text style={[styles.title, { color: colors.text }]}>Tres Rondas</Text>
        <Text style={[styles.subtitle, { color: colors.textMuted }]}>
          Las mismas cartas, tres maneras de adivinarlas: describir, una palabra y mímica.
        </Text>
      </View>

      <Section title="Equipos">
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

      <Section title="Categorías">
        <View style={styles.chips}>
          <Chip label="Aleatorio" selected={settings.categories.length === 0} onPress={() => set('categories', [])} />
          {CATEGORIES.map((c) => (
            <Chip key={c.id} label={c.name} selected={settings.categories.includes(c.id)} onPress={() => toggleCategory(c.id)} />
          ))}
        </View>
        <Text style={[styles.note, { color: colors.textMuted }]}>{available} cartas disponibles</Text>
      </Section>

      <Section title="Partida">
        <OptionPicker
          label="Segundos por turno"
          options={TURN_SECONDS_OPTIONS}
          value={settings.turnSeconds}
          onChange={(v) => set('turnSeconds', v)}
          format={(v) => `${v} s`}
        />
        <OptionPicker
          label="Cartas en la partida"
          options={CARD_COUNT_OPTIONS}
          value={cardCount}
          onChange={(v) => set('cardCount', v)}
          isDisabled={(v) => v > available}
        />
        <OptionPicker
          label="Al pasar una carta"
          options={['free', 'penalty'] as PassMode[]}
          value={settings.passMode}
          onChange={(v) => set('passMode', v)}
          format={(v) => PASS_LABELS[v]}
        />
        <View style={styles.chips}>
          <Chip
            label="Arrastrar el tiempo sobrante a la ronda siguiente"
            selected={settings.carryOverTime}
            onPress={() => set('carryOverTime', !settings.carryOverTime)}
          />
        </View>
      </Section>

      <Section title="Apariencia">
        <OptionPicker
          label="Tema"
          options={['system', 'light', 'dark'] as ThemeMode[]}
          value={mode}
          onChange={setMode}
          format={(v) => THEME_LABELS[v]}
        />
      </Section>
    </Screen>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  const { colors } = useTheme();
  return (
    <View style={styles.section}>
      <Text style={[styles.sectionTitle, { color: colors.text }]}>{title}</Text>
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  title: { fontSize: fontSize.hero - 8, fontWeight: '900', letterSpacing: -1 },
  subtitle: { fontSize: fontSize.body, marginTop: space.xs, lineHeight: 26 },
  section: { gap: space.md },
  sectionTitle: { fontSize: fontSize.heading, fontWeight: '900' },
  chips: { flexDirection: 'row', flexWrap: 'wrap', gap: space.sm },
  note: { fontSize: fontSize.small },
});
