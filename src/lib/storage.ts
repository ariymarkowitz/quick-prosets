export type Theme = 'light' | 'dark';

// The two leaderboards, split by whether the parity hint was ever visible
// during the game. A Board names one of them.
export type Scores = { plain: number[]; parity: number[] };
export type Board = keyof Scores;

const THEME_KEY = 'proset-game-theme';
const PARITY_KEY = 'proset-game-parity';
const SCORES_KEYS: Record<Board, string> = {
  plain: 'proset-game-scores',
  parity: 'proset-game-scores-parity',
};

export function getStoredTheme(): Theme {
  const stored = localStorage.getItem(THEME_KEY);
  return stored === 'light' || stored === 'dark' ? stored : 'light';
}

export function setTheme(theme: Theme): void {
  localStorage.setItem(THEME_KEY, theme);
}

// Parity hint is on by default.
export function getShowParity(): boolean {
  return localStorage.getItem(PARITY_KEY) !== 'false';
}

export function setShowParity(show: boolean): void {
  localStorage.setItem(PARITY_KEY, String(show));
}

export function getScores(): Scores {
  return { plain: readScores('plain'), parity: readScores('parity') };
}

export function saveScore(seconds: number, board: Board): Scores {
  const scores = readScores(board);
  scores.push(seconds);
  scores.sort((a, b) => a - b);
  localStorage.setItem(SCORES_KEYS[board], JSON.stringify(scores.slice(0, 5)));
  return getScores();
}

function readScores(board: Board): number[] {
  const raw = localStorage.getItem(SCORES_KEYS[board]);
  if (!raw) return [];
  const parsed: unknown = JSON.parse(raw);
  if (!Array.isArray(parsed)) return [];
  return parsed.filter((x): x is number => typeof x === 'number');
}
