export const CARD_W = 100;
export const CARD_H = 160;

// The six circles sit in a fixed 2×3 grid, one slot per colour. Positions never
// change, so a colour is identified by where it is as much as by its hue.
export const DOT_COLS = 2;
export const DOT_ROWS = 3;
export const DOT_R = 16;
// One spacing for both axes, so the gaps read the same horizontally and vertically.
export const DOT_SPACING = 52;
export const DOT_X0 = (CARD_W - (DOT_COLS - 1) * DOT_SPACING) / 2;
export const DOT_Y0 = (CARD_H - (DOT_ROWS - 1) * DOT_SPACING) / 2;

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
