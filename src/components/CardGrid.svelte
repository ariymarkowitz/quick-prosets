<script lang="ts">
  import { app } from '../lib/AppState.svelte';
  import Card from './Card.svelte';
  import ParityCard from './ParityCard.svelte';

  let { onCardsExited }: { onCardsExited: () => void } = $props();

  const isChill = $derived(app.mode === 'chill');

  // Count exit-animation completions during cardsExiting.
  let exitedCount = 0;
  $effect(() => {
    if (!app.cardsExiting) exitedCount = 0;
  });

  function handleAnimationEnd() {
    if (!app.cardsExiting) return;
    exitedCount++;
    const total = app.game?.activeEntries.length ?? 0;
    if (exitedCount >= total) onCardsExited();
  }
</script>

<main id="card-grid-wrap">
  <div id="card-grid" class:with-parity={app.showParity}>
    {#if app.cardsMounted}
      {#each app.game?.board ?? [] as entry (entry.id)}
        <div class="card-slot">
          {#if entry.card !== null}
            {@const v = app.game?.cardStatus(entry) ?? { transition: null, highlight: null }}
            <div
              class="card-inner"
              class:dealing={v.transition?.type === 'dealing'}
              class:removing={v.transition?.type === 'removing'}
              class:chill={isChill}
              style="--delay:{v.transition?.delay}ms"
              onanimationend={handleAnimationEnd}
            >
              <Card
                card={entry.card}
                highlight={v.highlight}
                onclick={() => app.game?.handleCardClick(entry.id)}
              />
            </div>
          {/if}
        </div>
      {/each}
      {#if app.showParity}
        <div class="parity-slot">
          <ParityCard />
        </div>
      {/if}
    {/if}
  </div>
</main>

<style>
  #card-grid-wrap {
    flex: 1;
    min-height: 0;
    display: flex;
    align-items: center;
    justify-content: center;
    --pad: clamp(10px, calc(6px + 1vmin), 14px);
    padding: 0 var(--pad) var(--pad);
  }

  #card-grid {
    /* The 2-3-2 rows are offset by half a card, so the grid is laid out in
       half-cards: three lanes of six half-columns, each card spanning two. */
    --card-w: var(--card-short);
    --card-h: var(--card-long);
    /* How far the 2-3-2 moves down its own axis to make room for a lane in
       front of it — counted in whatever that axis's tracks are. */
    --row-shift: 0;
    display: grid;
    grid-template-columns: repeat(6, 1fr);
    grid-template-rows: repeat(3, 1fr);
    aspect-ratio: calc(3 * var(--card-w)) / calc(3 * var(--card-h));
    
    place-self: center;
    width: 100%;
    max-width: 100dvh;
    max-height: 100%;
    gap: min(2vmin, 12px);
  }

  /* --lane is which row of the 2-3-2 a card sits in, --pos where along it. */
  .card-slot:nth-child(1) { --lane: 1; --pos: 2; }
  .card-slot:nth-child(2) { --lane: 1; --pos: 4; }
  .card-slot:nth-child(3) { --lane: 2; --pos: 1; }
  .card-slot:nth-child(4) { --lane: 2; --pos: 3; }
  .card-slot:nth-child(5) { --lane: 2; --pos: 5; }
  .card-slot:nth-child(6) { --lane: 3; --pos: 2; }
  .card-slot:nth-child(7) { --lane: 3; --pos: 4; }

  .card-slot {
    grid-row: calc(var(--lane) + var(--row-shift));
    grid-column: var(--pos) / span 2;
    display: flex;
    flex-direction: column;
    min-height: 0;
  }

  /* The parity hint takes a full lane of its own. */
  #card-grid.with-parity {
    --row-shift: 1;
    grid-template-rows: repeat(4, 1fr);
    aspect-ratio: calc(3 * var(--card-w)) / calc(4 * var(--card-h));
  }

  .parity-slot {
    grid-row: 1;
    grid-column: 3 / span 2;
    display: flex;
    flex-direction: column;
    min-height: 0;
  }

  .parity-slot > :global(.parity-card) {
    flex: 1;
  }

  /* Rotate the card aspect ratio about when the cards will be wider than they are tall, or whenever the page hits
     its max width (desktop). */
  @media (min-aspect-ratio: 4/5), (min-width: 1000px) {
    #card-grid {
      --card-w: var(--card-long);
      --card-h: var(--card-short);
    }
  }

  .card-inner {
    display: flex;
    flex-direction: column;
    flex: 1;
    opacity: 1;
  }

  .card-inner > :global(.card) {
    flex: 1;
  }

  @keyframes dealIn {
    from {
      opacity: 0;
      translate: 0 -8px;
      scale: 0.95;
    }
    to {
      opacity: 1;
      translate: 0 0;
      scale: 1;
    }
  }

  @keyframes dealOut {
    from {
      opacity: 1;
      scale: 1;
    }
    to {
      opacity: 0;
      scale: 0.9;
    }
  }

  @keyframes dealOutChill {
    from {
      opacity: 1;
      translate: 0 0;
      scale: 1;
    }
    to {
      opacity: 0;
      translate: 0 -24px;
      scale: 0.93;
    }
  }

  .card-inner.dealing {
    animation: dealIn var(--deal-duration) var(--delay) both cubic-bezier(0.33, 1, 0.68, 1);
  }

  .card-inner.removing {
    animation: dealOut var(--remove-duration) var(--delay) forwards;
  }

  .card-inner.chill.removing {
    animation: dealOutChill var(--remove-duration) var(--delay) forwards cubic-bezier(0.4, 0, 0.6, 1);
  }
</style>
