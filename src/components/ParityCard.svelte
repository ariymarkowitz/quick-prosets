<script lang="ts">
  import { app } from '../lib/AppState.svelte';
  import { COLORS, isSolid } from '../lib/game-utils';
  import CardFace from './CardFace.svelte';

  let { onExited }: { onExited: () => void } = $props();

  // Solid where the selection is currently odd, so the card empties out the
  // moment the selection becomes a proset — and until then it is the card that
  // would complete one. CardGrid owns where it sits and which way up it is.
  const parity = $derived(app.game?.parity ?? 0);
  const odd = $derived(COLORS.filter((_, i) => isSolid(parity, i)));
  const label = $derived(
    odd.length === 0 ? 'Every colour even' : `Odd so far: ${odd.join(', ')}`
  );

  // The circles are shown unless the board is clearing, and transition between
  // the two. The wash plays while a proset resolves; clicks are ignored until
  // that ends, so the class always comes off before the next proset.
  const washing = $derived(app.mode === 'chill' && (app.game?.resolvingProset ?? false));

  // Report once every circle has waved out.
  let root: HTMLDivElement;
  $effect(() => {
    if (!app.cardsExiting) return;
    Promise.all(root.getAnimations({ subtree: true }).map(a => a.finished)).then(
      () => onExited(),
      () => {}
    );
  });
</script>

<div
  bind:this={root}
  class="parity-card"
  role="img"
  aria-label={label}
  title={label}
>
  <div
    class="parity-ink"
    class:wash={washing}
    class:wave-out={app.cardsExiting}
  >
    <CardFace card={parity} />
  </div>
</div>

<style>
  .parity-card {
    display: flex;
    align-items: center;
    justify-content: center;
    container-type: size;
    pointer-events: none;
    mix-blend-mode: multiply;
  }

  .parity-ink {
    width: 100%;
    height: 100%;
    display: flex;
    align-items: center;
    justify-content: center;
    opacity: 0.8;
  }

  /* Each circle takes as long as a card does to deal or clear, and the next
     one starts a fifth of the way through it. */
  .parity-card :global(.dot) {
    transform-box: fill-box;
    transform-origin: center;
    --wave-duration: var(--deal-duration);
    --wave-easing: ease-out;
    --wave-delay: calc(var(--wave-pos, 0) * var(--wave-duration) / 5);
    transition:
      fill var(--dur-fast) ease,
      opacity var(--dur-fast) ease,
      fill-opacity var(--wave-duration) var(--wave-easing) var(--wave-delay),
      stroke-opacity var(--wave-duration) var(--wave-easing) var(--wave-delay),
      scale var(--wave-duration) var(--wave-easing) var(--wave-delay);
  }

  /* Where each circle falls in the wave. */
  .parity-card :global(.dot:nth-child(1)) { --wave-pos: 0; }
  .parity-card :global(.dot:nth-child(2)) { --wave-pos: 2; }
  .parity-card :global(.dot:nth-child(3)) { --wave-pos: 1; }
  .parity-card :global(.dot:nth-child(4)) { --wave-pos: 3; }
  .parity-card :global(.dot:nth-child(5)) { --wave-pos: 2; }
  .parity-card :global(.dot:nth-child(6)) { --wave-pos: 4; }

  /* The card is turned sideways. */
  @container (aspect-ratio > 1) {
    .parity-card :global(.dot:nth-child(2)) { --wave-pos: 0; }
    .parity-card :global(.dot:nth-child(4)) { --wave-pos: 2; }
    .parity-card :global(.dot:nth-child(6)) { --wave-pos: 4; }
    .parity-card :global(.dot:nth-child(1)) { --wave-pos: 1; }
    .parity-card :global(.dot:nth-child(3)) { --wave-pos: 3; }
    .parity-card :global(.dot:nth-child(5)) { --wave-pos: 5; }
  }

  /* Hidden, which is where the circles wave in from and out to. Fade fill and
     stroke, so it doesn't mess up opacity. */
  @starting-style {
    .parity-card :global(.dot) {
      fill-opacity: 0;
      stroke-opacity: 0;
      scale: 0.8;
    }
  }

  .parity-ink.wash :global(.dot) {
    --out-delay: calc(var(--wave-pos, 0) * var(--remove-duration) / 5);
    animation:
      celebrate calc(var(--out-delay) + var(--remove-duration) + var(--deal-duration)) var(--out-delay);
  }

  /* Clearing cuts a wash short rather than waiting on it. */
  .parity-ink.wave-out :global(.dot) {
    --wave-duration: var(--remove-duration);
    --wave-easing: ease-in;
    fill-opacity: 0;
    stroke-opacity: 0;
    scale: 0.8;
    animation: none;
  }

  @keyframes celebrate {
    0% {
      animation-timing-function: ease-in;
    }
    45% {
      scale: 1.1;
    }
  }

  :global(body.dark) .parity-card {
    mix-blend-mode: screen;
  }
</style>
