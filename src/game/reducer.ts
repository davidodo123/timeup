import { MIN_CARRY_OVER_MS, MIN_TEAMS, PASS_PENALTY_POINTS, TEAM_COLORS, DEFAULT_SETTINGS } from './constants';
import { drawTop, returnToBottom } from './deck';
import type { GameAction, GameState, RoundNumber, Team, TurnRecord, TurnState } from './types';

export const initialState: GameState = {
  phase: 'setup',
  settings: DEFAULT_SETTINGS,
  teams: [],
  cards: [],
  roundOrders: [],
  pile: [],
  done: [],
  round: 1,
  currentTeamIndex: 0,
  turn: null,
  carryOverMs: null,
  history: [],
};

export function gameReducer(state: GameState, action: GameAction): GameState {
  switch (action.type) {
    case 'START_GAME': {
      if (action.teams.length < MIN_TEAMS || action.cards.length === 0) return state;
      const teams: Team[] = action.teams.map((t, i) => ({
        id: `team-${i}`,
        name: t.name.trim() || `Equipo ${i + 1}`,
        color: TEAM_COLORS[i % TEAM_COLORS.length],
        players: t.players.map((p) => p.trim()).filter(Boolean),
        nextPlayerIndex: 0,
      }));
      return {
        ...initialState,
        phase: 'turnIntro',
        settings: action.settings,
        teams,
        cards: action.cards,
        roundOrders: action.roundOrders ?? [],
        pile: action.cards.map((c) => c.id),
      };
    }

    case 'START_TURN': {
      if (state.phase !== 'turnIntro') return state;
      const team = state.teams[state.currentTeamIndex];
      const durationMs = state.carryOverMs ?? state.settings.turnSeconds * 1000;
      const { cardId, rest } = drawTop(state.pile);
      const turn: TurnState = {
        teamId: team.id,
        player: playerName(team),
        durationMs,
        endsAt: action.now + durationMs,
        pausedAt: null,
        currentCardId: cardId,
        cardShownAt: action.now,
        events: [],
        remainingMs: 0,
      };
      return { ...state, phase: 'playing', pile: rest, turn, carryOverMs: null };
    }

    case 'GUESS':
    case 'PASS': {
      const turn = activeTurn(state);
      if (!turn || turn.currentCardId === null) return state;
      const event = {
        cardId: turn.currentCardId,
        outcome: action.type === 'GUESS' ? ('guessed' as const) : ('passed' as const),
        elapsedMs: action.now - (turn.cardShownAt ?? action.now),
      };
      const pile =
        action.type === 'PASS' ? returnToBottom(state.pile, turn.currentCardId) : state.pile;
      const { cardId, rest } = drawTop(pile);
      const events = [...turn.events, event];

      // Mazo vacío: se acaba el turno antes de tiempo y se guarda lo que sobra.
      if (cardId === null) {
        return {
          ...state,
          phase: 'turnReview',
          pile: rest,
          turn: {
            ...turn,
            events,
            currentCardId: null,
            cardShownAt: null,
            endsAt: null,
            remainingMs: Math.max(0, (turn.endsAt ?? action.now) - action.now),
          },
        };
      }
      return {
        ...state,
        pile: rest,
        turn: { ...turn, events, currentCardId: cardId, cardShownAt: action.now },
      };
    }

    case 'PAUSE': {
      const turn = activeTurn(state);
      if (!turn) return state;
      return { ...state, turn: { ...turn, pausedAt: action.now } };
    }

    case 'RESUME': {
      const turn = state.phase === 'playing' ? state.turn : null;
      if (!turn || turn.pausedAt === null) return state;
      const pausedFor = action.now - turn.pausedAt;
      return {
        ...state,
        turn: {
          ...turn,
          pausedAt: null,
          endsAt: (turn.endsAt ?? action.now) + pausedFor,
          cardShownAt: turn.cardShownAt === null ? null : turn.cardShownAt + pausedFor,
        },
      };
    }

    case 'TIME_UP': {
      const turn = activeTurn(state);
      if (!turn) return state;
      // La carta que estaba en pantalla no se ha resuelto: vuelve al mazo.
      const pile =
        turn.currentCardId === null ? state.pile : returnToBottom(state.pile, turn.currentCardId);
      return {
        ...state,
        phase: 'turnReview',
        pile,
        turn: { ...turn, currentCardId: null, cardShownAt: null, endsAt: null, remainingMs: 0 },
      };
    }

    case 'CONFIRM_REVIEW': {
      if (state.phase !== 'turnReview' || !state.turn) return state;
      const { turn } = state;
      const rejected = new Set(action.rejectedCardIds);
      const guessed = turn.events.filter((e) => e.outcome === 'guessed');
      const accepted = guessed.filter((e) => !rejected.has(e.cardId));
      const rejectedIds = guessed.filter((e) => rejected.has(e.cardId)).map((e) => e.cardId);
      const passes = turn.events.filter((e) => e.outcome === 'passed').length;
      const penalty = state.settings.passMode === 'penalty' ? passes * PASS_PENALTY_POINTS : 0;

      const record: TurnRecord = {
        round: state.round,
        teamId: turn.teamId,
        player: turn.player,
        guessed: accepted,
        passes,
        rejected: rejectedIds.length,
        points: accepted.length - penalty,
      };

      const pile = [...state.pile, ...rejectedIds];
      const done = [...state.done, ...accepted.map((e) => e.cardId)];
      const history = [...state.history, record];
      const roundOver = pile.length === 0;

      // Si sobra tiempo al vaciar el mazo, el mismo jugador sigue en la ronda siguiente.
      const carry =
        roundOver &&
        state.round < 3 &&
        state.settings.carryOverTime &&
        turn.remainingMs >= MIN_CARRY_OVER_MS
          ? turn.remainingMs
          : null;

      const base = { ...state, pile, done, history, turn: null };
      if (roundOver && state.round === 3) return { ...base, phase: 'finished' };
      if (carry !== null) return { ...base, phase: 'roundEnd', carryOverMs: carry };
      return { ...advanceTeam(base), phase: roundOver ? 'roundEnd' : 'turnIntro' };
    }

    case 'NEXT_ROUND': {
      if (state.phase !== 'roundEnd' || state.round === 3) return state;
      const round = (state.round + 1) as RoundNumber;
      // Ronda 2 → roundOrders[0], ronda 3 → roundOrders[1].
      const order = state.roundOrders[round - 2] ?? state.cards.map((c) => c.id);
      return { ...state, phase: 'turnIntro', round, pile: order, done: [] };
    }

    case 'RESET':
      return initialState;

    default:
      return state;
  }
}

/** Turno en juego y no pausado. */
function activeTurn(state: GameState): TurnState | null {
  if (state.phase !== 'playing' || !state.turn || state.turn.pausedAt !== null) return null;
  return state.turn;
}

export function playerName(team: Team): string {
  if (team.players.length === 0) return team.name;
  return team.players[team.nextPlayerIndex % team.players.length];
}

/** El equipo que acaba de jugar rota de jugador y el turno pasa al siguiente equipo. */
function advanceTeam(state: GameState): GameState {
  const i = state.currentTeamIndex;
  const teams = state.teams.map((t, idx) =>
    idx === i ? { ...t, nextPlayerIndex: t.nextPlayerIndex + 1 } : t,
  );
  return { ...state, teams, currentTeamIndex: (i + 1) % teams.length };
}
