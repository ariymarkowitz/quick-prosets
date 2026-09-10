<script lang="ts">
  import {
    CARD_W, CARD_H, DOT_COLS, DOT_R, DOT_STROKE, DOT_X0, DOT_Y0, DOT_SPACING,
  } from '../lib/constants';
  import { app } from '../lib/AppState.svelte';
  import type { Highlight } from '../lib/Game.svelte';
  import { COLORS, isSolid, type Card } from '../lib/game-utils';

  type Props = {
    card: Card;
    highlight: Highlight;
    onclick: () => void;
  };

  let { card, highlight, onclick }: Props = $props();

  function onpointerdown(e: PointerEvent) {
    e.preventDefault();
    onclick();
  }

  function onkeydown(e: KeyboardEvent) {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      onclick();
    }
  }
</script>

<div
  class={['card', highlight, app.mode]}
  role="button"
  tabindex="0"
  {onpointerdown}
  {onkeydown}
>
  <svg viewBox="0 0 {CARD_W} {CARD_H}" class="card-svg" preserveAspectRatio="xMidYMid meet">
    {#each COLORS as color, i}
      <circle
        cx={DOT_X0 + (i % DOT_COLS) * DOT_SPACING}
        cy={DOT_Y0 + Math.floor(i / DOT_COLS) * DOT_SPACING}
        r={DOT_R}
        stroke-width={DOT_STROKE}
        class="dot color-{color} {isSolid(card, i) ? 'solid' : 'open'}"
      />
    {/each}
  </svg>
</div>

<style>
  .card {
    background: var(--card-bg);
    border: 2.5px solid var(--card-border);
    border-radius: var(--card-radius);
    cursor: pointer;
    touch-action: none;
    display: flex;
    align-items: center;
    justify-content: center;
    user-select: none;
    -webkit-tap-highlight-color: transparent;
    box-shadow: 0 2px 8px var(--shadow);
    transition-property: opacity, transform, box-shadow, border-color, background-color;
    transition-duration: 0.12s, 0.12s, 0.15s, 0.2s, 0.3s;
    position: relative;
    overflow: hidden;
    container-type: size;
  }

  @media(pointer:fine) {
    .card:hover {
      transform: translateY(-2px);
      box-shadow: 0 5px 14px var(--shadow-hover);
    }
  }

  .card.selected {
    border-color: var(--accent);
    box-shadow: 0 0 0 3px var(--accent-glow), 0 5px 14px var(--shadow-hover);
    transform: translateY(-4px);
  }

  .card.valid {
    border-color: var(--valid) !important;
    box-shadow: 0 0 0 3px var(--valid-glow), 0 5px 14px var(--shadow-hover) !important;
    transform: translateY(-4px);
  }

  .card.valid.chill {
    animation: pulse-valid 0.3s ease forwards;
  }

  .card.hint {
    border-color: var(--hint-highlight) !important;
    box-shadow: 0 0 0 3px var(--hint-glow), 0 5px 14px var(--shadow-hover) !important;
    transform: translateY(-2px);
  }

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
      transform: rotate(90deg);
    }
  }

  @keyframes pulse-valid {
    0%   { scale: 1; }
    50%  { scale: 1.04; }
    100% { scale: 1; }
  }
</style>
