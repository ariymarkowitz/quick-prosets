<script lang="ts">
  import { app } from '../lib/AppState.svelte';
  import { COLORS, isSolid } from '../lib/game-utils';
  import CardFace from './CardFace.svelte';

  // Solid where the selection is currently odd, so the card empties out the
  // moment the selection becomes a proset — and until then it is the card that
  // would complete one. CardGrid owns where it sits and which way up it is.
  const parity = $derived(app.game?.parity ?? 0);
  const odd = $derived(COLORS.filter((_, i) => isSolid(parity, i)));
  const label = $derived(
    odd.length === 0 ? 'Every colour even' : `Odd so far: ${odd.join(', ')}`
  );

  // The pulse plays while a proset resolves. Clicks are ignored until that
  // ends, so the class always comes off before the next proset.
  const pulsing = $derived(app.game?.resolvingProset ?? false);
</script>

<div class="parity-card" role="img" aria-label={label} title={label}>
  <div
    class="parity-ink"
    class:pulse={pulsing}
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
    --wave-pos: calc(var(--upright-pos) + var(--landscape, 0) * (var(--sideways-pos) - var(--upright-pos)));
    --wave-delay: calc(var(--wave-pos, 0) * var(--wave-duration) / 5);
    transition:
      fill var(--dur-fast) ease,
      opacity var(--dur-fast) ease,
      fill-opacity var(--wave-duration) var(--wave-easing) var(--wave-delay),
      stroke-opacity var(--wave-duration) var(--wave-easing) var(--wave-delay),
      scale var(--wave-duration) var(--wave-easing) var(--wave-delay);
  }

  /* Where each circle falls in the wave, upright and turned sideways. Which
     one applies comes from CardGrid's --landscape rather than a container
     query: Firefox starts the wave before a container query applies, so the
     circles would keep their upright delays. */
  .parity-card :global(.dot:nth-child(1)) { --upright-pos: 0; --sideways-pos: 1; }
  .parity-card :global(.dot:nth-child(2)) { --upright-pos: 2; --sideways-pos: 0; }
  .parity-card :global(.dot:nth-child(3)) { --upright-pos: 1; --sideways-pos: 3; }
  .parity-card :global(.dot:nth-child(4)) { --upright-pos: 3; --sideways-pos: 2; }
  .parity-card :global(.dot:nth-child(5)) { --upright-pos: 2; --sideways-pos: 5; }
  .parity-card :global(.dot:nth-child(6)) { --upright-pos: 4; --sideways-pos: 4; }

  /* Hidden, which is where the circles wave in from and out to. This fades
     fill and stroke rather than opacity, which .dot.open already sets. */
  @starting-style {
    .parity-card :global(.dot) {
      fill-opacity: 0;
      stroke-opacity: 0;
      scale: 0.8;
    }
  }

  .parity-ink.pulse :global(.dot) {
    --out-delay: calc(var(--wave-pos, 0) * var(--remove-duration) / 5);
    animation:
      celebrate calc(var(--out-delay) + var(--remove-duration) + var(--deal-duration)) var(--out-delay);
  }

  /* Clearing cuts a pulse short rather than waiting on it. */
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
