// The six circle colours, in the fixed order they are drawn on every card.
// Position is what identifies a colour, so the board stays playable without
// relying on colour discrimination.
export const COLORS = ['red', 'orange', 'green', 'blue', 'purple', 'pink'] as const;

export type Color = typeof COLORS[number];

// A card is a bitmask over COLORS: bit i set means that colour's circle is
// solid, clear means it is open. The all-open card (mask 0) is left out of the
// deck — it can never complete a proset, since a ^ b ^ 0 === 0 only when a === b.
export type Card = number;

export const DECK_SIZE = (1 << COLORS.length) - 1;

export const isSolid = (card: Card, index: number): boolean =>
  (card & (1 << index)) !== 0;

export function shuffle<T>(arr: T[]): T[] {
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    const tmp = arr[i]!;
    arr[i] = arr[j]!;
    arr[j] = tmp;
  }
  return arr;
}

export function generateDeck(): Card[] {
  return shuffle(Array.from({ length: DECK_SIZE }, (_, i) => i + 1));
}

// Three cards form a proset when every colour is solid an even number of times,
// which per colour is exactly parity — so all six at once is an XOR of zero.
export function isValidProset(a: Card, b: Card, c: Card): boolean {
  return (a ^ b ^ c) === 0;
}

export function findProset(cards: Card[]): [number, number, number] | null {
  // The third card of any proset is forced: it is a ^ b.
  const byCard = new Map<Card, number>();
  for (let i = 0; i < cards.length; i++) byCard.set(cards[i]!, i);
  for (let i = 0; i < cards.length - 1; i++) {
    for (let j = i + 1; j < cards.length; j++) {
      const k = byCard.get(cards[i]! ^ cards[j]!);
      if (k !== undefined && k !== i && k !== j) return [i, j, k];
    }
  }
  return null;
}

export function hasProset(cards: Card[]): boolean {
  return findProset(cards) !== null;
}

export function formatTime(seconds: number): string {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${m}:${String(s).padStart(2, '0')}`;
}
