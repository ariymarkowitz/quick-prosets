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

  // The chosen board lives on `app`, so it is remembered across openings for as
  // long as the page is open.
  const shownScores = $derived(app.scores[app.leaderboardBoard]);

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
      <button
        type="button"
        class="option-row"
        class:active={app.showParity}
        role="switch"
        aria-checked={app.showParity}
        onclick={() => (app.showParity = !app.showParity)}
      >
        <span class="parity-label">Show Parity Hint</span>
        <span
          class="parity-switch"
          class:solid={app.showParity}
          aria-hidden="true"
        ></span>
      </button>
      <button
        class="menu-btn icon-btn"
        aria-label="What is the parity hint?"
        title="What is the parity hint?"
        onclick={() => (view = 'parity')}
      ><span class="help-icon"></span></button>
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
    <h2 id="modal-title">Parity Hint</h2>
    <div class="help-text">
      <p>The parity hint is a ghost card above the board that tracks the cards you have selected.</p>
      <p>
        A circle will be <strong>solid</strong> if it's colour is solid an odd number of times among the selected cards.
        Otherwise it will be <strong>open</strong>.
      </p>
      <p>
        The parity hint is exactly the card that would complete your selection into a proset.
        Once every circle is open, the cards you have selected are a proset.
      </p>
      <p>
        Games where the parity hint was viewed are in a separate leaderboard to games where it wasn't viewed.
        Without the parity hint, the game is much harder!
      </p>
    </div>
    <button id="play-again-btn" onclick={() => (view = 'main')}>Back</button>
  {:else if view === 'leaderboard'}
    <h2 id="modal-title">Top Times</h2>
    <div class="segmented thin" role="group" aria-label="Leaderboard">
      <button
          type="button"
          class="segmented-btn"
          class:active={app.leaderboardBoard === 'parity'}
          onclick={() => (app.leaderboardChoice = 'parity')}
      >With Parity Hint</button>
      <button
        type="button"
        class="segmented-btn"
        class:active={app.leaderboardBoard === 'plain'}
        onclick={() => (app.leaderboardChoice = 'plain')}
      >No Parity Hint</button>
    </div>
    {#if shownScores.length === 0}
      <p class="empty-scores">
        No times yet — finish a game
        {app.leaderboardBoard === 'parity' ? 'with the parity hint' : 'without the parity hint'} to set a record.
      </p>
    {:else}
      <ol id="leaderboard-list">
        {#each shownScores as s, i}
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

  .segmented.thin {
    flex-shrink: 0;
    border-radius: var(--radius-sm);
  }

  .segmented.thin .segmented-btn {
    flex: 1;
    padding: 2px 14px;
    font-size: var(--fs-xs);
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
    justify-content: center;
    gap: 1em;
    padding: 9px 10px;
    border-radius: var(--radius-md);
    font-size: var(--fs-sm);
    font-weight: 600;
    color: var(--text-muted);
  }

  .option-row.active {
    color: var(--text);
  }

  .parity-switch {
    --switch-size: 20px;
    --switch-gap: 2px;
    flex: 0 0 auto;
    box-sizing: border-box;
    width: var(--switch-size);
    height: var(--switch-size);
    border-radius: 50%;
    border: 2.5px solid var(--accent);
    position: relative;
    opacity: 0.5;
    transition: opacity var(--dur-quick) ease;
  }

  .parity-switch::after {
    content: '';
    position: absolute;
    inset: var(--switch-gap);
    border-radius: 50%;
    background: var(--accent);
    opacity: 0;
    transition: opacity var(--dur-quick) ease;
  }

  .parity-switch.solid {
    opacity: 1;
  }

  .parity-switch.solid::after {
    opacity: 1;
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
