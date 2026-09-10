// ─── Card geometry ──────────────────────────────────────────────────────────
// Tune these four. Everything below them is derived, including the card's own
// aspect ratio, which is what keeps the margin equal on all four sides.
// The units are arbitrary — only the ratios between these numbers matter.
export const DOT_R = 10;       // circle radius, measured to the middle of the stroke
export const DOT_STROKE = 2;   // an open circle strokes where a solid one fills
export const DOT_GAP = 14;     // space between neighbouring circle edges
export const DOT_MARGIN = 14;   // space between the outermost circle edges and the card edge

// The six circles sit in a fixed 2×3 grid, one slot per colour. Positions never
// change, so a colour is identified by where it is as much as by its hue.
export const DOT_COLS = 2;
export const DOT_ROWS = 3;

// A stroked circle overhangs its radius by half the stroke width.
const DOT_OUTER = DOT_R + DOT_STROKE / 2;

// Centre to centre, the same on both axes so the gaps read alike.
export const DOT_SPACING = 2 * DOT_OUTER + DOT_GAP;

// The card viewBox is the circle group plus DOT_MARGIN all round, and the grid
// takes its cell shape from these two numbers (App.svelte publishes them as
// --card-short / --card-long). Because the cell and the viewBox then share an
// aspect ratio, preserveAspectRatio has nothing to letterbox — so DOT_MARGIN is
// the margin you actually see, on every side.
export const CARD_W = (DOT_COLS - 1) * DOT_SPACING + 2 * DOT_OUTER + 2 * DOT_MARGIN;
export const CARD_H = (DOT_ROWS - 1) * DOT_SPACING + 2 * DOT_OUTER + 2 * DOT_MARGIN;

export const DOT_X0 = DOT_MARGIN + DOT_OUTER;
export const DOT_Y0 = DOT_MARGIN + DOT_OUTER;

export const DEAL_SETTLE_MS = 150;

export const TOAST_MS = 2500;

export const MODE_TIMINGS = {
  speedy: {
    dealDuration: 150, removeDuration: 130, stagger: 20, fastStagger: 20,
    validFlash: 120, invalidFlash: 180, shakeDuration: 150,
  },
  chill: {
    dealDuration: 280, removeDuration: 240, stagger: 100, fastStagger: 20,
    validFlash: 360, invalidFlash: 340, shakeDuration: 260,
  },
} as const;
export const BOARD_SIZE = 12;
export const MIN_BOARD = 3;

export const VICTORY_MESSAGES = [
  "All prosets found!",
  "Mission accomplished!",
  "Victory!",
  "You did it!",
  "No more prosets!",
  "Deck complete!",
  "Congratulations!"
]
