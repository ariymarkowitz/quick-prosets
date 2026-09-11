import { untrack } from 'svelte';
import { generateDeck, isValidProset, findProset, xorOf, type Card } from './game-utils.js';
import { BOARD_SIZE, ANIM_SETTINGS } from './constants.js';
import { createTimer } from './timer.svelte.js';

export type EntryTransition = null | { type: 'dealing' | 'removing'; delay: number };

export type Highlight = null | 'selected' | 'hint' | 'valid';

export type BoardEntry = {
  id: number;
  card: Card | null;
};

export type GameResult = {
  time: number;
  disqualified: boolean;
  parityUsed: boolean;
};

type Resolution =
  | null
  | { stage: 'flash'; ids: number[] }
  | { stage: 'removing'; ids: number[] }
  // Either refilling the gaps a proset left, or laying out a whole board.
  | { stage: 'dealing'; ids: number[]; refill: boolean };

export type GameDeps = {
  getRunning: () => boolean;
  getShowParity: () => boolean;
  onEndGame: (result: GameResult) => void;
};

let nextId = 0;

export class Game {
  // --- Root state ---
  deck: Card[] = $state([]);
  board: BoardEntry[] = $state([]);
  hintsUsed: boolean = $state(false);
  // True if the parity hint was ever visible during the game.
  parityUsed: boolean = $state(false);

  // Interaction
  selectedIds: number[] = $state([]);
  hintIds: number[] = $state([]);
  hintRevealed: number = $state(0);

  // Pipeline
  resolution: Resolution = $state(null);

  timer = createTimer(() => !this.#deps.getRunning());

  activeEntries = $derived(this.board.filter(e => e.card !== null));
  // From the moment a proset is claimed until the cards that replace it land.
  resolvingProset = $derived(
    this.resolution !== null && (this.resolution.stage !== 'dealing' || this.resolution.refill)
  );

  selectedCards = $derived(
    this.selectedIds.map(id => this.board.find(e => e.id === id)?.card ?? 0)
  );

  // The card that would complete the proset.
  parity = $derived(xorOf(this.selectedCards));

  #deps: GameDeps;

  constructor(deps: GameDeps) {
    this.#deps = deps;

    $effect(() => {
      if (this.#deps.getRunning() && this.#deps.getShowParity()) this.parityUsed = true;
    });

    // Each stage waits out its animation, then advances. The pipeline holds
    // still while the game isn't running, so the board never changes while it
    // is animating away or hidden.
    $effect(() => {
      const r = this.resolution;
      if (!r || !this.#deps.getRunning()) return;
      const id = setTimeout(() => this.#advance(), this.#stageDuration(r));
      return () => clearTimeout(id);
    });

    // Every way of emptying the board ends the game here, including a resume
    // that finishes the last move.
    $effect(() => {
      if (
        this.#deps.getRunning() && !this.resolution &&
        this.deck.length === 0 && this.activeEntries.length === 0
      ) {
        untrack(() => this.#endGame());
      }
    });

    untrack(() => {
      this.deck = generateDeck();
      this.#deal(this.#topUp(), false);
    });
  }

  cardTransition(entry: BoardEntry): EntryTransition {
    const r = this.resolution;
    if (!r || r.stage === 'flash') return null;
    const i = r.ids.indexOf(entry.id);
    return i < 0 ? null : { type: r.stage, delay: i * ANIM_SETTINGS.stagger };
  }

  cardHighlight(entry: BoardEntry): Highlight {
    const r = this.resolution;
    if (r?.stage === 'flash' && r.ids.includes(entry.id)) return 'valid';
    if (this.hintIds.slice(0, this.hintRevealed).includes(entry.id)) return 'hint';
    if (this.selectedIds.includes(entry.id)) return 'selected';
    return null;
  }

  // --- Actions ---

  // The board was cleared away while paused. Finish any move that was
  // mid-animation, then deal the board back in.
  resume(): void {
    while (this.resolution) this.#advance();
    this.#deal(this.activeEntries.map(e => e.id), false);
  }

  handleCardClick(id: number): void {
    if (!this.#deps.getRunning() || this.resolution) return;

    const entry = this.board.find(e => e.id === id);
    if (!entry || entry.card === null) return;

    // Any click clears the hint preview.
    this.hintIds = [];
    this.hintRevealed = 0;

    this.selectedIds = this.selectedIds.includes(id)
      ? this.selectedIds.filter(x => x !== id)
      : [...this.selectedIds, id];

    // The selection is claimed the moment it becomes a proset — of any size,
    // so there is nothing to submit and no wrong answer to reject.
    if (isValidProset(this.selectedCards)) {
      this.resolution = { stage: 'flash', ids: this.selectedIds };
    }
  }

  useHint(): void {
    if (!this.#deps.getRunning() || this.resolution) return;

    this.hintsUsed = true;

    if (this.hintIds.length === 0) {
      const ids = this.#findBoardProset();
      if (!ids) return;
      this.selectedIds = [];
      this.hintIds = ids;
      this.hintRevealed = 0;
    }

    if (this.hintRevealed < this.hintIds.length) {
      this.hintRevealed += 1;
    }
  }

  devSkipToEnd(): void {
    if (!this.#deps.getRunning()) return;
    this.deck = [];
    this.board = [];
    this.selectedIds = [];
    this.resolution = null;
  }

  // --- Private helpers ---

  #advance(): void {
    const r = this.resolution!;
    if (r.stage === 'flash') {
      this.selectedIds = [];
      this.resolution = { stage: 'removing', ids: r.ids };
    } else if (r.stage === 'removing') {
      for (const e of this.board) if (r.ids.includes(e.id)) e.card = null;
      this.#deal(this.#topUp(), true);
    } else {
      this.resolution = null;
    }
  }

  #stageDuration(r: NonNullable<Resolution>): number {
    const a = ANIM_SETTINGS;
    const staggered = Math.max(0, r.ids.length - 1) * a.stagger;
    switch (r.stage) {
      case 'flash':    return a.validFlash;
      case 'removing': return staggered + a.removeDuration;
      case 'dealing':  return staggered + a.dealDuration + a.dealSettle;
    }
  }

  #findBoardProset(): number[] | null {
    const entries = this.activeEntries;
    const indices = findProset(entries.map(e => e.card!));
    if (!indices) return null;
    return indices.map(i => entries[i]!.id);
  }

  // Deals from the deck into empty slots, then grows the board to BOARD_SIZE.
  // Returns the ids of the entries that got a card.
  #topUp(): number[] {
    const ids: number[] = [];
    for (const e of this.board) {
      if (e.card !== null) continue;
      if (this.deck.length === 0) break;
      e.card = this.deck.pop()!;
      ids.push(e.id);
    }
    while (this.board.length < BOARD_SIZE && this.deck.length > 0) {
      const id = ++nextId;
      this.board.push({ id, card: this.deck.pop()! });
      ids.push(id);
    }
    return ids;
  }

  #deal(ids: number[], refill: boolean): void {
    this.resolution = ids.length > 0 ? { stage: 'dealing', ids, refill } : null;
  }

  #endGame(): void {
    this.#deps.onEndGame({
      time: this.timer.sample,
      disqualified: this.hintsUsed,
      parityUsed: this.parityUsed,
    });
  }
}
