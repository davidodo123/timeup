import type { Card, CategoryId } from './types';

export type Random = () => number;

/** Fisher–Yates. Devuelve una copia; no toca el array original. */
export function shuffle<T>(items: readonly T[], random: Random = Math.random): T[] {
  const out = items.slice();
  for (let i = out.length - 1; i > 0; i--) {
    const j = Math.floor(random() * (i + 1));
    [out[i], out[j]] = [out[j], out[i]];
  }
  return out;
}

/**
 * Elige las cartas de la partida. Sin categorías = todas (aleatorio).
 * Si se piden más cartas de las que hay, devuelve todas las disponibles.
 */
export function pickCards(
  library: readonly Card[],
  categories: readonly CategoryId[],
  count: number,
  random: Random = Math.random,
): Card[] {
  const pool =
    categories.length === 0 ? library : library.filter((c) => categories.includes(c.category));
  return shuffle(pool, random).slice(0, Math.max(0, count));
}

/** Cuántas cartas hay disponibles para una selección de categorías. */
export function availableCount(library: readonly Card[], categories: readonly CategoryId[]): number {
  return categories.length === 0
    ? library.length
    : library.filter((c) => categories.includes(c.category)).length;
}

/** Saca la carta de arriba del mazo. */
export function drawTop(pile: readonly string[]): { cardId: string | null; rest: string[] } {
  if (pile.length === 0) return { cardId: null, rest: [] };
  return { cardId: pile[0], rest: pile.slice(1) };
}

/** Una carta pasada vuelve al fondo del mazo para que no salga justo después. */
export function returnToBottom(pile: readonly string[], cardId: string): string[] {
  return [...pile, cardId];
}
