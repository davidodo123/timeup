import { CARD_LIBRARY } from '../../data/cards';
import { DEFAULT_SETTINGS } from '../constants';
import { pickCards, shuffle } from '../deck';
import { gameReducer, initialState } from '../reducer';
import { podium, scores } from '../selectors';
import { funStats } from '../stats';
import type { Card, GameAction, GameSettings, GameState } from '../types';

const cards: Card[] = [
  { id: 'a', text: 'A', category: 'animales' },
  { id: 'b', text: 'B', category: 'animales' },
  { id: 'c', text: 'C', category: 'animales' },
];

function start(settings: Partial<GameSettings> = {}): GameState {
  return gameReducer(initialState, {
    type: 'START_GAME',
    settings: { ...DEFAULT_SETTINGS, ...settings },
    teams: [
      { name: 'Rojos', players: ['Ana', 'Luis'] },
      { name: 'Azules', players: ['Eva'] },
    ],
    cards,
    roundOrders: [
      ['c', 'b', 'a'],
      ['b', 'a', 'c'],
    ],
  });
}

const run = (state: GameState, ...actions: GameAction[]) => actions.reduce(gameReducer, state);

describe('mazo', () => {
  it('pickCards respeta categorías y cantidad', () => {
    const picked = pickCards(CARD_LIBRARY, ['animales'], 10);
    expect(picked).toHaveLength(10);
    expect(picked.every((c) => c.category === 'animales')).toBe(true);
  });

  it('no hay textos repetidos en la biblioteca', () => {
    const texts = CARD_LIBRARY.map((c) => c.text.toLowerCase());
    expect(new Set(texts).size).toBe(texts.length);
  });

  it('shuffle no pierde ni duplica cartas', () => {
    const ids = CARD_LIBRARY.map((c) => c.id);
    expect(shuffle(ids).sort()).toEqual([...ids].sort());
  });
});

describe('turnos', () => {
  it('empieza con el primer equipo y su primer jugador', () => {
    const s = run(start(), { type: 'START_TURN', now: 0 });
    expect(s.phase).toBe('playing');
    expect(s.turn?.player).toBe('Ana');
    expect(s.turn?.currentCardId).toBe('a');
    expect(s.turn?.endsAt).toBe(40_000);
  });

  it('pasar devuelve la carta al fondo del mazo', () => {
    const s = run(start(), { type: 'START_TURN', now: 0 }, { type: 'PASS', now: 1000 });
    expect(s.turn?.currentCardId).toBe('b');
    expect(s.pile).toEqual(['c', 'a']);
  });

  it('al acabar el tiempo la carta en pantalla vuelve al mazo y se revisa', () => {
    const s = run(
      start(),
      { type: 'START_TURN', now: 0 },
      { type: 'GUESS', now: 2000 },
      { type: 'TIME_UP', now: 40_000 },
    );
    expect(s.phase).toBe('turnReview');
    expect(s.pile).toEqual(['c', 'b']);
  });

  it('el rival puede anular una carta y vuelve al mazo', () => {
    const s = run(
      start(),
      { type: 'START_TURN', now: 0 },
      { type: 'GUESS', now: 2000 },
      { type: 'GUESS', now: 3000 },
      { type: 'TIME_UP', now: 40_000 },
      { type: 'CONFIRM_REVIEW', rejectedCardIds: ['b'] },
    );
    expect(s.phase).toBe('turnIntro');
    expect(s.done).toEqual(['a']);
    expect(s.pile).toContain('b');
    expect(scores(s)[0].total).toBe(1);
    expect(s.currentTeamIndex).toBe(1);
  });

  it('la penalización resta un punto por pase', () => {
    const s = run(
      start({ passMode: 'penalty' }),
      { type: 'START_TURN', now: 0 },
      { type: 'PASS', now: 1000 },
      { type: 'PASS', now: 2000 },
      { type: 'GUESS', now: 3000 },
      { type: 'TIME_UP', now: 40_000 },
      { type: 'CONFIRM_REVIEW', rejectedCardIds: [] },
    );
    expect(s.history[0].points).toBe(-1);
  });

  it('la pausa no consume tiempo del turno ni de la carta', () => {
    const s = run(
      start(),
      { type: 'START_TURN', now: 0 },
      { type: 'PAUSE', now: 1000 },
      { type: 'GUESS', now: 5000 }, // ignorado en pausa
      { type: 'RESUME', now: 11_000 },
      { type: 'GUESS', now: 12_000 },
    );
    expect(s.turn?.endsAt).toBe(50_000);
    expect(s.turn?.events).toEqual([{ cardId: 'a', outcome: 'guessed', elapsedMs: 2000 }]);
  });

  it('los jugadores rotan dentro del equipo', () => {
    let s = start();
    for (let i = 0; i < 2; i++) {
      s = run(
        s,
        { type: 'START_TURN', now: 0 },
        { type: 'TIME_UP', now: 40_000 },
        { type: 'CONFIRM_REVIEW', rejectedCardIds: [] },
      );
    }
    s = gameReducer(s, { type: 'START_TURN', now: 0 });
    expect(s.turn?.player).toBe('Luis');
  });
});

describe('rondas', () => {
  const clearDeck = (s: GameState, now = 0) =>
    run(
      s,
      { type: 'START_TURN', now },
      { type: 'GUESS', now: now + 1000 },
      { type: 'GUESS', now: now + 2000 },
      { type: 'GUESS', now: now + 3000 },
    );

  it('vaciar el mazo acaba la ronda y el tiempo sobrante pasa al mismo jugador', () => {
    let s = clearDeck(start());
    expect(s.phase).toBe('turnReview');
    expect(s.turn?.remainingMs).toBe(37_000);
    s = gameReducer(s, { type: 'CONFIRM_REVIEW', rejectedCardIds: [] });
    expect(s.phase).toBe('roundEnd');
    expect(s.carryOverMs).toBe(37_000);

    s = run(s, { type: 'NEXT_ROUND' }, { type: 'START_TURN', now: 0 });
    expect(s.round).toBe(2);
    expect(s.turn?.player).toBe('Ana');
    expect(s.turn?.durationMs).toBe(37_000);
    expect(s.turn?.currentCardId).toBe('c');
  });

  it('sin arrastre de tiempo, la ronda siguiente la empieza el otro equipo', () => {
    let s = clearDeck(start({ carryOverTime: false }));
    s = run(s, { type: 'CONFIRM_REVIEW', rejectedCardIds: [] }, { type: 'NEXT_ROUND' });
    expect(s.currentTeamIndex).toBe(1);
  });

  it('tras la ronda 3 la partida termina con podio y estadísticas', () => {
    let s = start();
    for (const round of [1, 2, 3]) {
      s = run(clearDeck(s), { type: 'CONFIRM_REVIEW', rejectedCardIds: [] });
      if (round < 3) s = gameReducer(s, { type: 'NEXT_ROUND' });
    }
    expect(s.phase).toBe('finished');
    const top = podium(s);
    expect(top[0].team.name).toBe('Rojos');
    expect(top[0].total).toBe(9);
    expect(top[1].place).toBe(2);
    expect(funStats(s).map((f) => f.id)).toContain('fastest');
  });
});
