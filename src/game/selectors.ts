import { playerName } from './reducer';
import type { Card, GameState, RoundNumber, Team } from './types';

export function currentTeam(state: GameState): Team | null {
  return state.teams[state.currentTeamIndex] ?? null;
}

/** Quién describe en el próximo turno (o en el actual). */
export function currentPlayer(state: GameState): string {
  if (state.turn) return state.turn.player;
  const team = currentTeam(state);
  return team ? playerName(team) : '';
}

/**
 * Nombre de quien describe, o `null` si el equipo no tiene jugadores con
 * nombre (entonces el "jugador" es el propio equipo y no hay que repetirlo).
 */
export function describer(team: Team, player: string): string | null {
  return player && player !== team.name ? player : null;
}

export function cardById(state: GameState, id: string | null): Card | null {
  if (!id) return null;
  return state.cards.find((c) => c.id === id) ?? null;
}

export type RoundScores = Record<RoundNumber, number>;

export interface TeamScore {
  team: Team;
  rounds: RoundScores;
  total: number;
}

export function scores(state: GameState): TeamScore[] {
  return state.teams.map((team) => {
    const rounds: RoundScores = { 1: 0, 2: 0, 3: 0 };
    for (const r of state.history) {
      if (r.teamId === team.id) rounds[r.round] += r.points;
    }
    return { team, rounds, total: rounds[1] + rounds[2] + rounds[3] };
  });
}

export interface PodiumEntry extends TeamScore {
  /** Puesto con empates: 1, 1, 3… */
  place: number;
}

export function podium(state: GameState): PodiumEntry[] {
  const sorted = scores(state).sort((a, b) => b.total - a.total);
  return sorted.map((s, i) => ({
    ...s,
    place: i > 0 && sorted[i - 1].total === s.total ? placeOf(sorted, i) : i + 1,
  }));
}

function placeOf(sorted: TeamScore[], i: number): number {
  let j = i;
  while (j > 0 && sorted[j - 1].total === sorted[i].total) j--;
  return j + 1;
}

/** Cartas que quedan en el mazo, contando la que está en pantalla. */
export function cardsLeft(state: GameState): number {
  return state.pile.length + (state.turn?.currentCardId ? 1 : 0);
}
