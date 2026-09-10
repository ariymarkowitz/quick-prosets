import { untrack } from 'svelte';
import { generateDeck, isValidProset, findProset, type Card } from './game-utils.js';
import { BOARD_SIZE, DEAL_SETTLE_MS, MODE_TIMINGS } from './constants.js';
import { createTimer } from './timer.svelte.js';

export type EntryTransition =
  | null
  | { type: 'dealing'; delay: number }
  | { type: 'removing'; delay: number };

export type Highlight = null | 'selected' | 'hint' | 'valid';

export type BoardEntry = {
  id: number;
  card: Card | null;
};

export type EntryStatus = {
  transition: EntryTransition;
  highlight: Highlight;
};

export type GameOverInfo = {
  title: string;
  time: number;
  currentIdx: number;
  disqualified: boolean;
};

export type GameMode = 'chill' | 'speedy';

export type AnimSettings = typeof MODE_TIMINGS[GameMode];

type Resolution =
  | null
  | { stage: 'flash'; ids: number[] }
  | { stage: 'removing'; ids: number[]; stagger: number }
  | { stage: 'dealing'; ids: number[] };

export type GameDeps = {
  getRunning: () => boolean;
  getCardsExiting: () => boolean;
  getAnimSettings: () => AnimSettings;
  onEndGame: (result: { time: number; disqualified: boolean }) => void;
};

let nextId = 0;
const makeId = (): number => ++nextId;

export class Game {
  // --- Root state ---
  deck: Card[] = $state([]);
  board: BoardEntry[] = $state([]);
  prosetsFound: number = $state(0);
  hintsUsed: boolean = $state(false);

  // Interaction
  selectedIds: number[] = $state([]);
  hintIds: number[] = $state([]);
  hintRevealed: number = $state(0);

  // Pipeline
  resolution: Resolution = $state(null);

  timer = createTimer(() => !this.#deps.getRunning());

  activeEntries = $derived(this.board.filter(e => e.card !== null));
  animating = $derived(this.resolution !== null);

  #deps: GameDeps;

  constructor(deps: GameDeps) {
    this.#deps = deps;

    $effect(() => {
      const r = this.resolution;
      if (!r) return;

      const animSettings = this.#deps.getAnimSettings();

      const id = setTimeout(() => {
        if (r.stage === 'flash') {
          this.prosetsFound += 1;
          this.selectedIds = [];
          this.resolution = { stage: 'removing', ids: r.ids, stagger: animSettings.stagger };
        } else if (r.stage === 'removing') {
          for (const e of this.board) if (r.ids.includes(e.id)) e.card = null;
          this.#topUp();
          if (this.resolution === null) this.#checkBoard();
        } else {
          this.resolution = null;
          this.#checkBoard();
        }
      }, this.#stageDuration(r, animSettings));

      return () => clearTimeout(id);
    });

    untrack(() => {
      this.deck = generateDeck();
      this.#dealFreshBoard();
    });
  }

  cardStatus(entry: BoardEntry): EntryStatus {
    const r = this.resolution;
    const animSettings = this.#deps.getAnimSettings();
    const cardsExiting = this.#deps.getCardsExiting();
    let transition: EntryTransition = null;
    let highlight: Highlight = null;

    const rId = r?.ids.indexOf(entry.id) ?? -1;

    if (cardsExiting) {
      const idx = this.activeEntries.findIndex(e => e.id === entry.id);
      const removeDelay = Math.max(0, idx * animSettings.fastStagger);
      transition = { type: 'removing', delay: removeDelay };
    } else if (r?.stage === 'removing' && rId >= 0) {
      transition = { type: 'removing', delay: rId * r.stagger };
    } else if (r?.stage === 'dealing' && rId >= 0) {
      transition = { type: 'dealing', delay: rId * animSettings.stagger };
    }

    if (r?.stage === 'flash' && rId >= 0) {
      highlight = 'valid';
    } else if (this.hintIds.slice(0, this.hintRevealed).includes(entry.id)) {
      highlight = 'hint';
    } else if (this.selectedIds.includes(entry.id)) {
      highlight = 'selected';
    }

    return { transition, highlight };
  }

  triggerResumeDeal(): void {
    this.resolution = { stage: 'dealing', ids: this.activeEntries.map(e => e.id) };
  }

  // --- Actions ---

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
    const cards = this.selectedIds.map(sid => this.board.find(e => e.id === sid)!.card!);
    if (isValidProset(cards)) {
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
    this.#endGame();
  }

  // --- Private helpers ---

  #stageDuration(r: NonNullable<Resolution>, a: AnimSettings): number {
    switch (r.stage) {
      case 'flash':    return a.validFlash;
      case 'removing': return Math.max(0, r.ids.length - 1) * r.stagger + a.removeDuration;
      case 'dealing':  return Math.max(0, r.ids.length - 1) * a.stagger + a.dealDuration + DEAL_SETTLE_MS;
    }
  }

  #findBoardProset(): number[] | null {
    const entries = this.activeEntries;
    const indices = findProset(entries.map(e => e.card!));
    if (!indices) return null;
    return indices.map(i => entries[i]!.id);
  }

  #makeEntry(card: Card | null): BoardEntry {
    return { id: makeId(), card };
  }

  // A full board always holds a proset, and the cards left over once the deck
  // is empty are one themselves, so the only way to run out of moves is to run
  // out of cards.
  #checkBoard(): void {
    if (!this.#deps.getRunning()) return;
    if (this.deck.length === 0 && this.activeEntries.length === 0) this.#endGame();
  }

  #topUp(): void {
    const ids: number[] = [];
    for (const e of this.board) {
      if (e.card !== null) continue;
      if (this.deck.length === 0) break;
      e.card = this.deck.pop()!;
      ids.push(e.id);
    }
    while (this.board.length < BOARD_SIZE && this.deck.length > 0) {
      const e = this.#makeEntry(this.deck.pop()!);
      this.board.push(e);
      ids.push(e.id);
    }
    this.resolution = ids.length > 0 ? { stage: 'dealing', ids } : null;
  }

  #dealFreshBoard(): void {
    this.board = [];
    this.#topUp();
  }

  #endGame(): void {
    const time = this.timer.sample;
    const disqualified = this.hintsUsed;
    this.#deps.onEndGame({ time, disqualified });
  }
}
