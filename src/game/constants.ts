import type { GameSettings, RoundNumber } from './types';

export const DEFAULT_SETTINGS: GameSettings = {
  turnSeconds: 40,
  cardCount: 40,
  categories: [],
  passMode: 'free',
  carryOverTime: true,
};

export const TURN_SECONDS_OPTIONS = [30, 40, 45, 60, 90];
export const CARD_COUNT_OPTIONS = [20, 30, 40, 50, 60];

export const MIN_TEAMS = 2;
export const MAX_TEAMS = 6;

/** Por debajo de esto no merece la pena arrastrar tiempo a la ronda siguiente. */
export const MIN_CARRY_OVER_MS = 3000;

/** A partir de aquí el temporizador avisa con vibración fuerte. */
export const WARNING_SECONDS = 5;

export const PASS_PENALTY_POINTS = 1;

export interface RoundRule {
  title: string;
  short: string;
  description: string;
}

export const ROUND_RULES: Record<RoundNumber, RoundRule> = {
  1: {
    title: 'Ronda 1 · Descripción libre',
    short: 'Describe como quieras',
    description:
      'Usa todas las palabras que quieras, salvo las de la carta. Puedes pasar cartas.',
  },
  2: {
    title: 'Ronda 2 · Una palabra',
    short: 'Solo UNA palabra',
    description:
      'Di una sola palabra. Tu equipo tiene un único intento: si falla, pasa la carta.',
  },
  3: {
    title: 'Ronda 3 · Mímica',
    short: 'Sin hablar: mímica',
    description: 'Ni una palabra. Solo gestos y sonidos. Puedes pasar cartas.',
  },
};

export const TEAM_COLORS = ['#FF4D6D', '#3A86FF', '#FFBE0B', '#2EC4B6', '#9B5DE5', '#FB5607'];
