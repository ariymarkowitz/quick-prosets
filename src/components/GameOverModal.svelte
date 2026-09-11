<script lang="ts">
  import { app } from '../lib/AppState.svelte';
  import { formatTime } from '../lib/game-utils';
  import Modal from './Modal.svelte';

  let { newGame, onModalOpened, onModalClosed }: {
    newGame: () => void;
    onModalOpened: () => void;
    onModalClosed: () => void;
  } = $props();
</script>

<Modal open={app.canShowModal && !!app.gameOver} onOpen={onModalOpened} onClose={onModalClosed}>
  <h2 id="modal-title">{app.gameOver?.title}</h2>
  <p id="final-time-display">{formatTime(app.gameOver?.time ?? 0)}</p>
  {#if app.gameOver?.disqualified}
    <p class="disqualified-note">Hint used — time not saved to leaderboard</p>
  {/if}
  <div class="board-heading">
    <h3>Top Times</h3>
    <p class="board-label">{app.gameOver?.parityUsed ? 'With Parity Hint' : 'No Parity Hint'}</p>
  </div>
  <ol id="leaderboard-list">
    {#each app.gameOver?.parityUsed ? app.scores.parity : app.scores.plain as s, i}
      <li class:current-score={i === app.gameOver?.currentIdx}>
        {i + 1}. {formatTime(s)}
      </li>
    {/each}
  </ol>
  <button id="play-again-btn" onclick={newGame}>Play Again</button>
</Modal>

<style>

  #final-time-display {
    font-size: var(--time-fs);
    font-weight: 800;
    color: var(--text);
    font-variant-numeric: tabular-nums;

    margin-top: var(--time-margin-top);
  }

  .board-heading {
    display: flex;
    flex-direction: column;
    gap: 3px;
  }

  .board-label {
    margin-top: 0;
    font-size: 0.85rem;
    color: var(--text-muted);
  }

  /* Sits on the modal's own flex gap, so it opts out of the global p + p rule. */
  .disqualified-note {
    margin-top: 0;
    font-size: 0.85rem;
    color: var(--text-muted);
  }
</style>
