import type { GameState, Team } from './types';

export interface FunStat {
  id: string;
  title: string;
  team: Team;
  detail: string;
}

const seconds = (ms: number) => `${(ms / 1000).toFixed(1).replace('.', ',')} s`;

/** Estadísticas para la pantalla final. Solo devuelve las que tienen datos. */
export function funStats(state: GameState): FunStat[] {
  const teamById = new Map(state.teams.map((t) => [t.id, t]));
  const stats: FunStat[] = [];

  // Acierto más rápido de toda la partida.
  let fastest: { ms: number; teamId: string; player: string; cardId: string } | null = null;
  for (const r of state.history) {
    for (const g of r.guessed) {
      if (!fastest || g.elapsedMs < fastest.ms) {
        fastest = { ms: g.elapsedMs, teamId: r.teamId, player: r.player, cardId: g.cardId };
      }
    }
  }
  if (fastest) {
    const card = state.cards.find((c) => c.id === fastest.cardId);
    stats.push({
      id: 'fastest',
      title: 'Acierto relámpago',
      team: teamById.get(fastest.teamId)!,
      detail: `«${card?.text ?? '?'}» en ${seconds(fastest.ms)} (describía ${fastest.player})`,
    });
  }

  // Equipo más rápido de media.
  const perTeam = state.teams.map((team) => {
    const records = state.history.filter((r) => r.teamId === team.id);
    const guesses = records.flatMap((r) => r.guessed);
    const totalMs = guesses.reduce((acc, g) => acc + g.elapsedMs, 0);
    return {
      team,
      guesses: guesses.length,
      avgMs: guesses.length ? totalMs / guesses.length : Infinity,
      passes: records.reduce((acc, r) => acc + r.passes, 0),
      roundThree: records.filter((r) => r.round === 3).reduce((acc, r) => acc + r.points, 0),
    };
  });

  const quickest = minBy(perTeam.filter((t) => t.guesses > 0), (t) => t.avgMs);
  if (quickest) {
    stats.push({
      id: 'quickest-team',
      title: 'Equipo que más rápido adivina',
      team: quickest.team,
      detail: `${seconds(quickest.avgMs)} de media por carta`,
    });
  }

  // Mejor turno.
  const bestTurn = maxBy(state.history, (r) => r.guessed.length);
  if (bestTurn && bestTurn.guessed.length > 0) {
    stats.push({
      id: 'best-turn',
      title: 'Turno de leyenda',
      team: teamById.get(bestTurn.teamId)!,
      detail: `${bestTurn.player} sacó ${bestTurn.guessed.length} cartas en un turno (ronda ${bestTurn.round})`,
    });
  }

  // Más pases.
  const indecisive = maxBy(perTeam, (t) => t.passes);
  if (indecisive && indecisive.passes > 0) {
    stats.push({
      id: 'most-passes',
      title: 'Los más indecisos',
      team: indecisive.team,
      detail: `${indecisive.passes} cartas pasadas`,
    });
  }

  // Mejor en mímica.
  const mimes = maxBy(perTeam, (t) => t.roundThree);
  if (mimes && mimes.roundThree > 0) {
    stats.push({
      id: 'mime',
      title: 'Reyes de la mímica',
      team: mimes.team,
      detail: `${mimes.roundThree} puntos en la ronda 3`,
    });
  }

  return stats;
}

function maxBy<T>(items: T[], score: (t: T) => number): T | undefined {
  return items.reduce<T | undefined>((best, t) => (best === undefined || score(t) > score(best) ? t : best), undefined);
}

function minBy<T>(items: T[], score: (t: T) => number): T | undefined {
  return maxBy(items, (t) => -score(t));
}
