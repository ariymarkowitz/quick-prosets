import type { Board } from './storage.js';

// ─── Card geometry ──────────────────────────────────────────────────────────
// Tune these four. Everything below them is derived, including the card's own
// aspect ratio, which is what keeps the margin equal on all four sides.
// The units are arbitrary — only the ratios between these numbers matter.
export const DOT_R = 10;       // circle radius, measured to the middle of the stroke
export const DOT_STROKE = 2;   // stroke width, drawn on solid and open circles alike
export const DOT_GAP = 14;     // space between neighbouring circle edges
export const DOT_MARGIN = 14;  // space between the outermost circle edges and the card edge

// The six circles sit in a fixed 2×3 grid, one slot per colour. Positions never
// change, so a colour is identified by where it is as much as by its hue, and
// the board stays playable without relying on colour discrimination.
export const DOT_COLS = 2;
export const DOT_ROWS = 3;

// A stroked circle overhangs its radius by half the stroke width.
const DOT_OUTER = DOT_R + DOT_STROKE / 2;

// Centre to centre, the same on both axes so the gaps read alike.
export const DOT_SPACING = 2 * DOT_OUTER + DOT_GAP;

// From the card edge to the centre of the first circle, on both axes.
export const DOT_INSET = DOT_MARGIN + DOT_OUTER;

// The card viewBox is the circle group plus DOT_MARGIN all round, and the grid
// takes its cell shape from these two numbers (App.svelte publishes them as
// --card-short / --card-long). Because the cell and the viewBox then share an
// aspect ratio, preserveAspectRatio has nothing to letterbox — so DOT_MARGIN is
// the margin you actually see, on every side.
export const CARD_W = (DOT_COLS - 1) * DOT_SPACING + 2 * DOT_INSET;
export const CARD_H = (DOT_ROWS - 1) * DOT_SPACING + 2 * DOT_INSET;

// Milliseconds.
export const ANIM_SETTINGS = {
  dealDuration: 280,
  removeDuration: 240,
  stagger: 100,
  exitStagger: 20,
  // Extra wait after the last card of a deal lands, before the board takes clicks.
  dealSettle: 150,
  validFlash: 360,
} as const;

// Seven cards is the smallest board that always contains a proset.
export const BOARD_SIZE = 7;

export const BOARD_LABELS: Record<Board, string> = {
  parity: 'With Parity Hint',
  plain: 'No Parity Hint',
};

export const VICTORY_MESSAGES = [
  'All prosets found!',
  'Mission accomplished!',
  'Victory!',
  'You did it!',
  'Board cleared!',
  'Deck complete!',
  'Congratulations!',
] as const;
