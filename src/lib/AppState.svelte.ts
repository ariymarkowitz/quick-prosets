import type { Scores, Theme } from './storage.js';
import type { Game } from './Game.svelte.js';
import type { GameOverInfo } from './Game.svelte.js';

export type { GameOverInfo };

// Which of the two boards the leaderboard is showing.
export type Board = keyof Scores;

export type Phase =
  | { kind: 'intro' }
  | { kind: 'playing' }
  | { kind: 'pausedMenu' }
  | { kind: 'pausedTab' }
  | { kind: 'over'; info: GameOverInfo };

export type PendingAction = 'newGame' | 'resumePlay';

class AppState {
  phase: Phase = $state({ kind: 'intro' });
  theme: Theme = $state('light');
  showParity: boolean = $state(true);
  scores: Scores = $state({ plain: [], parity: [] });
  // Choice of leaderboard: persists while the app is running.
  leaderboardChoice: Board | null = $state(null);
  pendingAction: PendingAction | null = $state(null);
  cardsExiting: boolean = $state(false);
  game: Game | null = $state(null);

  leaderboardBoard: Board = $derived(this.leaderboardChoice ?? (this.showParity ? 'parity' : 'plain'));

  running = $derived(this.phase.kind === 'playing');
  paused = $derived(this.phase.kind === 'pausedMenu' || this.phase.kind === 'pausedTab');
  gameActive = $derived(this.running || this.paused);

  menuOpen = $derived(this.phase.kind === 'intro' || this.phase.kind === 'pausedMenu');
  gameOver = $derived<GameOverInfo | null>(this.phase.kind === 'over' ? this.phase.info : null);

  cardsShown = $derived(this.phase.kind === 'playing' || this.phase.kind === 'pausedTab');
  cardsMounted = $derived(this.cardsShown || this.cardsExiting);

  canShowModal = $derived(this.pendingAction === null && !this.cardsExiting);
}

export const app = new AppState();
