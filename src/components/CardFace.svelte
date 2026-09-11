<script lang="ts">
  import {
    CARD_W, CARD_H, DOT_COLS, DOT_R, DOT_STROKE, DOT_INSET, DOT_SPACING,
  } from '../lib/constants';
  import { COLORS, isSolid, type Card } from '../lib/game-utils';

  // The six circles alone. Whoever renders this owns the card around it — and,
  // because the rotation below is a container query, owns the container too.
  let { card }: { card: Card } = $props();
</script>

<svg viewBox="0 0 {CARD_W} {CARD_H}" class="card-svg" preserveAspectRatio="xMidYMid meet">
  {#each COLORS as color, i}
    <circle
      cx={DOT_INSET + (i % DOT_COLS) * DOT_SPACING}
      cy={DOT_INSET + Math.floor(i / DOT_COLS) * DOT_SPACING}
      r={DOT_R}
      stroke-width={DOT_STROKE}
      class="dot color-{color} {isSolid(card, i) ? 'solid' : 'open'}"
    />
  {/each}
</svg>

<style>
  .card-svg {
    width: 100%;
    height: 100%;
    display: block;
    overflow: visible;
  }

  /* Rotate symbols sideways when the card is landscape */
  @container (aspect-ratio > 1) {
    .card-svg {
      width: 100cqh;
      height: 100cqw;
      transform: rotate(-90deg);
    }
  }
</style>
