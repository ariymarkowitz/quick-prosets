import type { GameMode } from './Game.svelte.js';

export type Theme = 'light' | 'dark';

// The two leaderboards, depending on whether the parity hint was ever visible
// during the game.
export type Scores = { plain: number[]; parity: number[] };

const THEME_KEY = 'proset-game-theme';
const SCORES_KEY = 'proset-game-scores';
const PARITY_SCORES_KEY = 'proset-game-scores-parity';
const MODE_KEY = 'proset-game-mode';
const PARITY_KEY = 'proset-game-parity';

export function getStoredTheme(): Theme {
  const stored = localStorage.getItem(THEME_KEY);
  return stored === 'light' || stored === 'dark' ? stored : 'light';
}

export function setTheme(theme: Theme): void {
  localStorage.setItem(THEME_KEY, theme);
  document.body.className = theme;
}

export function getMode(): GameMode {
  const stored = localStorage.getItem(MODE_KEY);
  if (stored === 'chill' || stored === 'speedy') return stored;
  return 'chill';
}

export function setMode(mode: GameMode): void {
  localStorage.setItem(MODE_KEY, mode);
}

// Parity hint is on by default.
export function getShowParity(): boolean {
  return localStorage.getItem(PARITY_KEY) !== 'false';
}

export function setShowParity(show: boolean): void {
  localStorage.setItem(PARITY_KEY, String(show));
}

export function getScores(): Scores {
  return { plain: readScores(SCORES_KEY), parity: readScores(PARITY_SCORES_KEY) };
}

export function saveScore(seconds: number, parityUsed: boolean): Scores {
  const key = parityUsed ? PARITY_SCORES_KEY : SCORES_KEY;
  const scores = readScores(key);
  scores.push(seconds);
  scores.sort((a, b) => a - b);
  localStorage.setItem(key, JSON.stringify(scores.slice(0, 5)));
  return getScores();
}

function readScores(key: string): number[] {
  const raw = localStorage.getItem(key);
  if (!raw) return [];
  const parsed: unknown = JSON.parse(raw);
  if (!Array.isArray(parsed)) return [];
  return parsed.filter((x): x is number => typeof x === 'number');
}
