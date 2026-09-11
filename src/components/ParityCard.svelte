<script lang="ts">
  import { untrack } from 'svelte';
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

  // The circles wave in as the board is dealt and out as it clears, with the
  // success wash in between. One wave at a time: a circle has one animation.
  let entered = $state(false);
  // The wash runs on its own clock rather than the pipeline's, so it holds
  // until its circles are back. Counting from mount means a card that appears
  // mid-game doesn't replay the last proset.
  const claimed = $derived(app.game?.prosetsClaimed ?? 0);
  let wavedFor = $state(untrack(() => claimed));
  const wave = $derived(
    app.cardsExiting ? 'out'
    : !entered ? 'in'
    : claimed > wavedFor && app.mode === 'chill' ? 'out-in'
    : null
  );

  let ink: HTMLDivElement;
  $effect(() => {
    const current = wave;
    if (current === null) return;
    let live = true;
    Promise.all(ink.getAnimations({ subtree: true }).map(a => a.finished)).then(
      () => {
        if (!live) return;
        if (current === 'in') entered = true;
        else if (current === 'out') onExited();
        // Read now, not at the start: a proset claimed mid-wash folds into it
        // instead of leaving the wash waiting on one that never starts.
        else wavedFor = app.game?.prosetsClaimed ?? 0;
      },
      // Cut short by the next wave, which reports for itself.
      () => {}
    );
    return () => { live = false; };
  });
</script>

<div
  class="parity-card"
  role="img"
  aria-label={label}
  title={label}
>
  <div
    bind:this={ink}
    class="parity-ink"
    class:wave-in={wave === 'in'}
    class:wave-out-in={wave === 'out-in'}
    class:wave-out={wave === 'out'}
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

  .parity-card :global(.dot) {
    transform-box: fill-box;
    transform-origin: center;
    transition: fill var(--dur-fast) ease, opacity var(--dur-fast) ease;
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

  /* Each circle takes as long as a card does to deal or clear, and the next
     one starts a fifth of the way through it. */
  .parity-ink.wave-in :global(.dot) {
    animation: dotIn var(--deal-duration) ease-out backwards;
    animation-delay: calc(var(--wave-pos, 0) * var(--deal-duration) / 5);
  }

  .parity-ink.wave-out :global(.dot) {
    animation: dotOut var(--remove-duration) ease-in forwards;
    animation-delay: calc(var(--wave-pos, 0) * var(--remove-duration) / 5);
  }

  .parity-ink.wave-out-in :global(.dot) {
    --wave-gap: var(--remove-duration);
    --out-delay: calc(var(--wave-pos, 0) * var(--remove-duration) / 5);
    animation:
      celebrate calc(var(--out-delay) + var(--remove-duration) + var(--deal-duration)) var(--out-delay);
  }

  /* Fade fill and stroke, so it doesn't mess up opacity. */
  @keyframes dotIn {
    from {
      fill-opacity: 0;
      stroke-opacity: 0;
      scale: 0.8;
    }
  }

  @keyframes dotOut {
    to {
      fill-opacity: 0;
      stroke-opacity: 0;
      scale: 0.8;
    }
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
