import { createContext, useContext, useMemo, useReducer, type ReactNode } from 'react';
import { CARD_LIBRARY } from '../data/cards';
import { pickCards, shuffle } from '../game/deck';
import { gameReducer, initialState } from '../game/reducer';
import type { GameSettings, GameState, TeamDraft } from '../game/types';

/**
 * Las acciones que usan las pantallas. Aquí se inyectan `Date.now()` y el
 * azar para que el reducer siga siendo puro.
 */
export interface GameActions {
  startGame(settings: GameSettings, teams: TeamDraft[]): void;
  startTurn(): void;
  guess(): void;
  pass(): void;
  pause(): void;
  resume(): void;
  timeUp(): void;
  confirmReview(rejectedCardIds: string[]): void;
  nextRound(): void;
  reset(): void;
}

const StateContext = createContext<GameState | null>(null);
const ActionsContext = createContext<GameActions | null>(null);

export function GameProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(gameReducer, initialState);

  // Las acciones no dependen del estado: se crean una vez y no provocan renders.
  const actions = useMemo<GameActions>(
    () => ({
      startGame: (settings, teams) => {
        const cards = pickCards(CARD_LIBRARY, settings.categories, settings.cardCount);
        const ids = cards.map((c) => c.id);
        // Las tres rondas usan las mismas cartas, cada una barajada de nuevo.
        dispatch({ type: 'START_GAME', settings, teams, cards, roundOrders: [shuffle(ids), shuffle(ids)] });
      },
      startTurn: () => dispatch({ type: 'START_TURN', now: Date.now() }),
      guess: () => dispatch({ type: 'GUESS', now: Date.now() }),
      pass: () => dispatch({ type: 'PASS', now: Date.now() }),
      pause: () => dispatch({ type: 'PAUSE', now: Date.now() }),
      resume: () => dispatch({ type: 'RESUME', now: Date.now() }),
      timeUp: () => dispatch({ type: 'TIME_UP', now: Date.now() }),
      confirmReview: (rejectedCardIds) => dispatch({ type: 'CONFIRM_REVIEW', rejectedCardIds }),
      nextRound: () => dispatch({ type: 'NEXT_ROUND' }),
      reset: () => dispatch({ type: 'RESET' }),
    }),
    [],
  );

  return (
    <ActionsContext.Provider value={actions}>
      <StateContext.Provider value={state}>{children}</StateContext.Provider>
    </ActionsContext.Provider>
  );
}

export function useGame(): GameState {
  const ctx = useContext(StateContext);
  if (!ctx) throw new Error('useGame debe usarse dentro de <GameProvider>');
  return ctx;
}

export function useGameActions(): GameActions {
  const ctx = useContext(ActionsContext);
  if (!ctx) throw new Error('useGameActions debe usarse dentro de <GameProvider>');
  return ctx;
}
