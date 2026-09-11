<script lang="ts">
  import { app } from '../lib/AppState.svelte';
  import { BOARD_LABELS } from '../lib/constants';
  import { formatTime } from '../lib/game-utils';
  import Modal from './Modal.svelte';

  let { newGame, onModalOpened, onModalClosed }: {
    newGame: () => void;
    onModalOpened: () => void;
    onModalClosed: () => void;
  } = $props();
</script>

<Modal open={app.canShowModal && app.gameOver !== null} onOpen={onModalOpened} onClose={onModalClosed}>
  {#if app.gameOver}
    {@const { title, time, disqualified, board, currentIdx } = app.gameOver}
    <h2 id="modal-title">{title}</h2>
    <p id="final-time-display">{formatTime(time)}</p>
    {#if disqualified}
      <p class="note">Hint used — time not saved to leaderboard</p>
    {/if}
    <div class="board-heading">
      <h3>Top Times</h3>
      <p class="note">{BOARD_LABELS[board]}</p>
    </div>
    <ol id="leaderboard-list">
      {#each app.scores[board] as s, i}
        <li class:current-score={i === currentIdx}>
          {i + 1}. {formatTime(s)}
        </li>
      {/each}
    </ol>
    <button class="primary-btn" onclick={newGame}>Play Again</button>
  {/if}
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

  /* The disqualified note sits on the modal's own flex gap, so it opts out of
     the global p + p rule. */
  .note {
    margin-top: 0;
    font-size: 0.85rem;
    color: var(--text-muted);
  }
</style>
