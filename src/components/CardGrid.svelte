<script lang="ts">
  import { tick } from 'svelte';
  import { app } from '../lib/AppState.svelte';
  import { ANIM_SETTINGS } from '../lib/constants';
  import type { BoardEntry, EntryTransition, Game } from '../lib/Game.svelte';
  import Card from './Card.svelte';
  import ParityCard from './ParityCard.svelte';

  let { onCardsExited }: { onCardsExited: () => void } = $props();

  // Clearing the board overrides whatever the game has a card doing, and sends
  // the cards off in quick succession.
  function transitionOf(game: Game, entry: BoardEntry): EntryTransition {
    if (!app.cardsExiting) return game.cardTransition(entry);
    const i = game.activeEntries.findIndex(e => e.id === entry.id);
    return { type: 'removing', delay: i * ANIM_SETTINGS.exitStagger };
  }

  // The exit is over once every animation under the grid has settled. The game
  // holds still while it isn't running, so nothing starts mid-exit and the
  // animations present at the start are all of them. This effect runs before
  // the blocks below it pick up the exit classes, hence the tick.
  let grid: HTMLDivElement;
  $effect(() => {
    if (!app.cardsExiting) return;
    let live = true;
    tick()
      .then(() => Promise.allSettled(grid.getAnimations({ subtree: true }).map(a => a.finished)))
      .then(() => { if (live) onCardsExited(); });
    return () => { live = false; };
  });
</script>

<main id="card-grid-wrap">
  <div id="card-grid" class:with-parity={app.showParity} bind:this={grid}>
    {#if app.cardsMounted && app.game}
      {@const game = app.game}
      {#each game.board as entry (entry.id)}
        <div class="card-slot">
          {#if entry.card !== null}
            {@const transition = transitionOf(game, entry)}
            <div
              class="card-inner"
              class:dealing={transition?.type === 'dealing'}
              class:removing={transition?.type === 'removing'}
              style="--delay:{transition?.delay}ms"
            >
              <Card
                card={entry.card}
                highlight={game.cardHighlight(entry)}
                onclick={() => game.handleCardClick(entry.id)}
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
    /* 1 when the cards are turned sideways, for anything that has to know
       before layout (a container query only answers after). */
    --landscape: 0;
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

  .card-slot,
  .parity-slot {
    display: flex;
    flex-direction: column;
    min-height: 0;
  }

  .card-slot {
    grid-row: calc(var(--lane) + var(--row-shift));
    grid-column: var(--pos) / span 2;
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
  }

  .card-inner > :global(.card),
  .parity-slot > :global(.parity-card) {
    flex: 1;
  }

  /* Turn the cards landscape at about the point they would come out wider than
     tall, and always once the page hits its max width (desktop). */
  @media (min-aspect-ratio: 4/5), (min-width: 1000px) {
    #card-grid-wrap {
      padding-bottom: min(60px, 10dvh);
    }

    #card-grid {
      --card-w: var(--card-long);
      --card-h: var(--card-short);
      --landscape: 1;
    }
  }

  .card-inner {
    display: flex;
    flex-direction: column;
    flex: 1;
  }

  @keyframes dealIn {
    from {
      opacity: 0;
      translate: 0 -8px;
      scale: 0.95;
    }
  }

  @keyframes dealOut {
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
    animation: dealOut var(--remove-duration) var(--delay) forwards cubic-bezier(0.4, 0, 0.6, 1);
  }
</style>
