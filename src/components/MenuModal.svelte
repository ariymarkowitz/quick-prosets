<script lang="ts">
  import { app } from '../lib/AppState.svelte';
  import { formatTime } from '../lib/game-utils';
  import Modal from './Modal.svelte';

  let { newGame, closeMenu, onModalOpened, onModalClosed }: {
    newGame: () => void;
    closeMenu: () => void;
    onModalOpened: () => void;
    onModalClosed: () => void;
  } = $props();

  type View = 'main' | 'help' | 'leaderboard';
  let view: View = $state('main');

  function onThemeToggle() {
    app.theme = app.theme === 'dark' ? 'light' : 'dark';
  }

  function onClose() {
    onModalClosed();
    view = 'main';
  }
</script>

<Modal open={app.canShowModal && app.menuOpen} onOpen={onModalOpened} {onClose}>
  {#if view === 'main'}
    <h2 id="modal-title">Quick <span class="brand-pro">Pro</span>sets</h2>

    <div class="menu-row">
      <div class="segmented" role="group" aria-label="Game mode">
        <button
          type="button"
          class="segmented-btn"
          class:active={app.mode === 'chill'}
          onclick={() => (app.mode = 'chill')}
        ><span class="mode-icon tortoise-icon"></span>Chill</button>
        <button
          type="button"
          class="segmented-btn"
          class:active={app.mode === 'speedy'}
          onclick={() => (app.mode = 'speedy')}
        ><span class="mode-icon rabbit-icon"></span>Speedy</button>
      </div>
      <button
        id="menu-theme-toggle"
        class="menu-btn icon-btn"
        aria-label="Toggle theme"
        title={app.theme === 'dark' ? 'Switch to light' : 'Switch to dark'}
        onclick={onThemeToggle}
      ><span class="theme-icon"></span></button>
    </div>

    <div class="menu-row">
      <button class="menu-btn" onclick={() => (view = 'help')}>How to Play</button>
      <button class="menu-btn" onclick={() => (view = 'leaderboard')}>Leaderboard</button>
    </div>

    <button id="play-again-btn" onclick={newGame}>
      {app.gameActive ? 'Restart' : 'Start'}
    </button>
    {#if app.gameActive}
      <button class="menu-btn resume-btn" onclick={closeMenu}>Resume</button>
    {/if}

    <a class="site-link" href="https://arimarkowitz.com" target="_blank" rel="noopener noreferrer">More at arimarkowitz.com</a>
  {:else if view === 'help'}
    <h2 id="modal-title">How to Play</h2>
    <div class="help-text">
      <p>Find a <strong>proset</strong>: three cards where every colour is solid an even number of times.</p>
      <p>Each card shows the same six circles — red, orange, green, blue, purple, pink — and each one is either solid or open.</p>
      <ul>
        <li>Pick a colour, then count the solid circles of that colour across your three cards.</li>
        <li>The count has to be <strong>0 or 2</strong> — never 1 or 3.</li>
        <li>All six colours must work out at once.</li>
      </ul>
      <p>Tap three cards to submit a proset. Clear the deck as fast as you can.</p>
    </div>
    <button id="play-again-btn" onclick={() => (view = 'main')}>Back</button>
  {:else if view === 'leaderboard'}
    <h2 id="modal-title">Top Times</h2>
    {#if app.scores.length === 0}
      <p class="empty-scores">No times yet — finish a game to set a record.</p>
    {:else}
      <ol id="leaderboard-list">
        {#each app.scores as s, i}
          <li>{i + 1}. {formatTime(s)}</li>
        {/each}
      </ol>
    {/if}
    <button id="play-again-btn" onclick={() => (view = 'main')}>Back</button>
  {/if}
</Modal>

<style>

  /* Fixed, not themed like --dot-orange — this orange stays the same in light and dark. */
  .brand-pro {
    color: #e47503;
  }

  .segmented {
    display: flex;
    width: 100%;
    border: 1px solid var(--border);
    border-radius: var(--radius-md);
    overflow: hidden;
    transition: border var(--dur-slow) ease;
  }

  .segmented-btn {
    flex: 1;
    background: var(--surface-alt);
    border: none;
    border-radius: 0;
    padding: 9px 0;
    font-size: var(--fs-sm);
    font-weight: 600;
    color: var(--text-muted);
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 0.3em;
  }

  .mode-icon {
    display: inline-block;
    width: 1.3em;
    height: 1.3em;
    background-color: currentColor;
    flex-shrink: 0;

    transform: translateY(-1px);
  }

  .tortoise-icon {
    -webkit-mask: url('../icons/mdi--tortoise.svg') no-repeat center / contain;
    mask: url('../icons/mdi--tortoise.svg') no-repeat center / contain;
  }

  .rabbit-icon {
    -webkit-mask: url('../icons/mdi--rabbit.svg') no-repeat center / contain;
    mask: url('../icons/mdi--rabbit.svg') no-repeat center / contain;
  }

  .segmented-btn + .segmented-btn {
    border-left: 1px solid var(--border);
  }

  .segmented-btn.active {
    background: var(--accent);
    color: #fff;
  }

  .menu-row {
    display: flex;
    gap: 8px;
  }

  .menu-btn {
    flex: 1;
    padding: 10px;
    font-size: var(--fs-sm);
    font-weight: 600;
  }

  .icon-btn {
    flex: 0 0 auto;
    width: 42px;
    padding: 0;
    display: flex;
    align-items: center;
    justify-content: center;
  }

  .theme-icon {
    display: inline-block;
    width: 1.3em;
    height: 1.3em;
    background-color: var(--text);
    -webkit-mask: url('../icons/material-symbols--dark-mode.svg') no-repeat center / contain;
    mask: url('../icons/material-symbols--dark-mode.svg') no-repeat center / contain;
  }

  :global(body.dark) .theme-icon {
    -webkit-mask-image: url('../icons/material-symbols--light-mode.svg');
    mask-image: url('../icons/material-symbols--light-mode.svg');
  }

  .resume-btn {
    margin-top: calc(var(--modal-gap) * -0.5);
    width: 100%;
  }

  .help-text {
    text-align: left;
    font-size: var(--fs-sm);
    line-height: 1.45;
    color: var(--text);
  }

  .help-text ul {
    margin-top: 10px;
    margin-bottom: 10px;
    padding-left: 20px;
  }

  .empty-scores {
    color: var(--text-muted);
    font-size: var(--fs-sm);
  }

  .site-link {
    margin-top: 4px;
    font-size: var(--fs-sm);
    color: var(--text-muted);
    text-decoration: none;
  }

  .site-link:hover {
    text-decoration: underline;
  }
</style>
