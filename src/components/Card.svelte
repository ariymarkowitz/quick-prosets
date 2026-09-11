<script lang="ts">
  import { app } from '../lib/AppState.svelte';
  import type { Highlight } from '../lib/Game.svelte';
  import type { Card } from '../lib/game-utils';
  import CardFace from './CardFace.svelte';

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
  <CardFace {card} />
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

  @keyframes pulse-valid {
    0%   { scale: 1; animation-timing-function: ease-out; }
    45%  { scale: 1.04; animation-timing-function: ease-out; }
    100% { scale: 1; }
  }
</style>
