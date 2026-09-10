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

  type View = 'main' | 'help' | 'leaderboard' | 'parity';
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
      <button
        type="button"
        class="option-row"
        class:active={app.showParity}
        role="switch"
        aria-checked={app.showParity}
        onclick={() => (app.showParity = !app.showParity)}
      >
        Show parity card
        <span class="switch" aria-hidden="true"></span>
      </button>
      <button
        class="menu-btn icon-btn"
        aria-label="What is the parity card?"
        title="What is the parity card?"
        onclick={() => (view = 'parity')}
      ><span class="help-icon"></span></button>
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
      <p>Find a <strong>proset</strong>: a group of cards where every colour is solid an even number of times.</p>
      <p>Each card has six circles of different colours (red, orange, green, blue, purple, pink). Each circle is either solid or open.</p>
      <ul>
        <li>Pick a colour, then count the solid circles of that colour across the cards you have chosen.</li>
        <li>The count has to be <strong>even</strong>.</li>
        <li>This rule must be satisfied across all 6 colours.</li>
      </ul>
      <p>Tap cards to select them. As soon as you select a proset the cards are taken and replaced. Try to clear the deck as fast as you can!</p>
    </div>
    <button id="play-again-btn" onclick={() => (view = 'main')}>Back</button>
  {:else if view === 'parity'}
    <h2 id="modal-title">Parity Card</h2>
    <div class="help-text">
      <p>The parity card is a ghost card above the board that tracks the cards you have selected.</p>
      <p>
        A circle will be <strong>solid</strong> if it appears solid an odd number of times among the selected cards.
        Otherwise it will be <strong>open</strong>.
      </p>
      <p>
        The parity card is exactly the card that would complete your selection into a proset.
        Once every circle is open, the cards you have selected are a proset.
      </p>
      <p>There is a separate leaderboard for games where the parity card was not used—it makes the game much harder!</p>
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

  /* A labelled switch, sized to sit in the same stack as the menu buttons. */
  .option-row {
    flex: 1;
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 10px;
    padding: 9px 12px;
    border-radius: var(--radius-md);
    font-size: var(--fs-sm);
    font-weight: 600;
    color: var(--text-muted);
  }

  .option-row.active {
    color: var(--text);
  }

  .switch {
    flex: 0 0 auto;
    position: relative;
    width: 34px;
    height: 20px;
    border-radius: 999px;
    background: var(--border);
    transition: background-color var(--dur-quick) ease;
  }

  .option-row.active .switch {
    background: var(--accent);
  }

  .switch::after {
    content: '';
    position: absolute;
    top: 3px;
    left: 3px;
    width: 14px;
    height: 14px;
    border-radius: 50%;
    background: #fff;
    box-shadow: 0 1px 2px var(--shadow-strong);
    transition: translate var(--dur-quick) ease;
  }

  .option-row.active .switch::after {
    translate: 14px 0;
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

  .help-icon {
    display: inline-block;
    width: 1.4em;
    height: 1.4em;
    background-color: var(--text-muted);
    -webkit-mask: url('../icons/mdi--help-circle-outline.svg') no-repeat center / contain;
    mask: url('../icons/mdi--help-circle-outline.svg') no-repeat center / contain;
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
