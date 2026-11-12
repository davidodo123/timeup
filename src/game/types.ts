/**
 * Modelo de datos del juego.
 *
 * Todo el estado de una partida vive en `GameState` y solo lo cambia el
 * reducer (`reducer.ts`). El reducer es puro: el tiempo (`now`) y el azar
 * (órdenes ya barajados) le llegan dentro de las acciones, así se puede
 * probar sin mocks.
 */

export type CategoryId =
  | 'historicos'
  | 'peliculas'
  | 'animales'
  | 'famosos'
  | 'objetos'
  | 'lugares';

export interface Category {
  id: CategoryId;
  name: string;
}

export interface Card {
  id: string;
  text: string;
  category: CategoryId;
}

export interface Team {
  id: string;
  name: string;
  /** Color del equipo (hex). Se usa en marcadores y en la pantalla de turno. */
  color: string;
  players: string[];
  /** Índice del jugador que describirá la próxima vez que juegue el equipo. */
  nextPlayerIndex: number;
}

export type RoundNumber = 1 | 2 | 3;

/** Qué pasa al pulsar "Pasar". */
export type PassMode = 'free' | 'penalty';

export interface GameSettings {
  turnSeconds: number;
  cardCount: number;
  /** Categorías elegidas. Vacío = todas (aleatorio). */
  categories: CategoryId[];
  passMode: PassMode;
  /**
   * Regla clásica: si un equipo acaba el mazo con tiempo de sobra, empieza la
   * ronda siguiente con el tiempo que le quedaba.
   */
  carryOverTime: boolean;
}

export type Phase =
  | 'setup'
  | 'turnIntro'
  | 'playing'
  | 'turnReview'
  | 'roundEnd'
  | 'finished';

/** Lo que pasó con una carta durante un turno. */
export interface CardEvent {
  cardId: string;
  outcome: 'guessed' | 'passed';
  /** Milisegundos que la carta estuvo en pantalla. */
  elapsedMs: number;
}

export interface TurnState {
  teamId: string;
  player: string;
  /** Duración total de este turno (puede ser tiempo arrastrado). */
  durationMs: number;
  /** Momento en que se acaba el turno. `null` antes de empezar. */
  endsAt: number | null;
  /** Momento en que se pausó. `null` si no está en pausa. */
  pausedAt: number | null;
  /** Carta en pantalla. */
  currentCardId: string | null;
  /** Cuándo se mostró la carta actual (descontando pausas). */
  cardShownAt: number | null;
  events: CardEvent[];
  /** Tiempo que sobró si el mazo se vació antes de que acabara. */
  remainingMs: number;
}

/** Turno ya validado por el equipo rival. Alimenta puntuación y estadísticas. */
export interface TurnRecord {
  round: RoundNumber;
  teamId: string;
  player: string;
  guessed: CardEvent[];
  passes: number;
  /** Cartas que el rival anuló en la revisión. */
  rejected: number;
  points: number;
}

export interface GameState {
  phase: Phase;
  settings: GameSettings;
  teams: Team[];
  /** Las cartas de la partida: las mismas en las 3 rondas. */
  cards: Card[];
  /** Orden ya barajado del mazo completo para las rondas 2 y 3. */
  roundOrders: string[][];
  /** Mazo activo: ids de cartas que faltan por acertar en esta ronda. La primera es la de arriba. */
  pile: string[];
  /** Ids acertados y validados en la ronda actual. */
  done: string[];
  round: RoundNumber;
  currentTeamIndex: number;
  turn: TurnState | null;
  /** Tiempo que el equipo actual arrastra a su primer turno de la ronda. */
  carryOverMs: number | null;
  history: TurnRecord[];
}

export interface TeamDraft {
  name: string;
  players: string[];
}

export type GameAction =
  | {
      type: 'START_GAME';
      settings: GameSettings;
      teams: TeamDraft[];
      /** Cartas ya elegidas y barajadas (orden de la ronda 1). */
      cards: Card[];
      /** Órdenes barajados de las rondas 2 y 3. Si faltan, se repite el de la ronda 1. */
      roundOrders?: string[][];
    }
  | { type: 'START_TURN'; now: number }
  | { type: 'GUESS'; now: number }
  | { type: 'PASS'; now: number }
  | { type: 'PAUSE'; now: number }
  | { type: 'RESUME'; now: number }
  | { type: 'TIME_UP'; now: number }
  /** El rival valida el turno. `rejectedCardIds` vuelven al mazo. */
  | { type: 'CONFIRM_REVIEW'; rejectedCardIds: string[] }
  /** Empieza la ronda siguiente con el mazo completo barajado. */
  | { type: 'NEXT_ROUND' }
  | { type: 'RESET' };
