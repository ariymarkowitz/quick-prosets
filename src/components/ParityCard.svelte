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
</script>

<div
  class="parity-card"
  class:hidden={!app.cardsShown}
  role="img"
  aria-label={label}
  title={label}
>
  <CardFace card={parity} />
</div>

<style>
  /* No card under it — just the circles, printed onto the page. Multiply keeps
     them sitting in the paper rather than on top of it; on a dark ground the
     same trick has to work the other way up, hence screen. */
  .parity-card {
    display: flex;
    align-items: center;
    justify-content: center;
    container-type: size;
    pointer-events: none;
    mix-blend-mode: multiply;
    transition: opacity var(--dur-quick) ease;
    opacity: 0.8;
    animation: parityIn var(--deal-duration) ease backwards;
  }

  @keyframes parityIn {
    from { opacity: 0; }
    to { opacity: 0.8; }
  }

  .parity-card :global(.dot) {
    transition: fill var(--dur-fast) ease, opacity var(--dur-fast) ease;
  }

  :global(body.dark) .parity-card {
    mix-blend-mode: screen;
  }

  .parity-card.hidden {
    opacity: 0;
  }
</style>
