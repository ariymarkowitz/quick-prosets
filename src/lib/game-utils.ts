// The six circle colours, in the fixed order they are drawn on every card.
// Position is what identifies a colour, so the board stays playable without
// relying on colour discrimination.
export const COLORS = ['red', 'orange', 'green', 'blue', 'purple', 'pink'] as const;

export type Color = typeof COLORS[number];

// A card is a bitmask over COLORS: bit i set means that colour's circle is
// solid, clear means it is open. The all-open card (mask 0) is left out of the
// deck — it would be a proset all by itself.
//
// The 63 cards that remain XOR to zero (every colour is solid on exactly 32 of
// them), and taking a proset preserves that, so whatever is left on the board
// once the deck runs dry is itself a proset. The deck always plays out.
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

// A proset is any non-empty set of cards where every colour is solid an even
// number of times. Per colour that is parity, so all six colours at once is an
// XOR of zero.
export function isValidProset(cards: Card[]): boolean {
  return cards.length > 0 && cards.reduce((xor, c) => xor ^ c, 0) === 0;
}

// The smallest proset among `cards`, as indices into it — the least
// hand-holding hint, and cheap to find by brute force because the board only
// ever holds BOARD_SIZE cards. A full board always has one: its 127 non-empty
// subsets can only take 63 distinct non-zero XORs, so two of them collide and
// their symmetric difference XORs to zero.
export function findProset(cards: Card[]): number[] | null {
  let best: number[] | null = null;
  for (let mask = 1; mask < 1 << cards.length; mask++) {
    let xor = 0;
    const indices: number[] = [];
    for (let i = 0; i < cards.length; i++) {
      if (mask & (1 << i)) {
        xor ^= cards[i]!;
        indices.push(i);
      }
    }
    if (xor === 0 && (best === null || indices.length < best.length)) best = indices;
  }
  return best;
}

export function formatTime(seconds: number): string {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${m}:${String(s).padStart(2, '0')}`;
}
