<script lang="ts">
  import { untrack } from 'svelte';
  import Header from './components/Header.svelte';
  import CardGrid from './components/CardGrid.svelte';
  import GameOverModal from './components/GameOverModal.svelte';
  import MenuModal from './components/MenuModal.svelte';
  import { app } from './lib/AppState.svelte';
  import { Game } from './lib/Game.svelte';
  import { getScores, getStoredTheme, setTheme, getShowParity, setShowParity, saveScore, type Board } from './lib/storage';
  import { VICTORY_MESSAGES, CARD_W, CARD_H, ANIM_SETTINGS } from './lib/constants';

  // The grid cell takes the card viewBox's shape, and the CSS animations take
  // the same durations as the game's stage timers.
  const root = document.documentElement.style;
  root.setProperty('--card-short', String(CARD_W));
  root.setProperty('--card-long', String(CARD_H));
  root.setProperty('--deal-duration', `${ANIM_SETTINGS.dealDuration}ms`);
  root.setProperty('--remove-duration', `${ANIM_SETTINGS.removeDuration}ms`);

  app.scores = getScores();
  app.theme = getStoredTheme();
  app.showParity = getShowParity();

  let gameCounter = $state(0);
  let modalVisible = $state(false);

  $effect(() => {
    if (gameCounter === 0) return;
    app.game = new Game({
      getRunning: () => app.running,
      getShowParity: () => app.showParity,
      onEndGame: ({ time, disqualified, parityUsed }) => {
        const title = VICTORY_MESSAGES[Math.floor(Math.random() * VICTORY_MESSAGES.length)]!;
        const board: Board = parityUsed ? 'parity' : 'plain';
        const scores = disqualified ? getScores() : saveScore(time, board);
        const currentIdx = disqualified ? -1 : scores[board].indexOf(time);
        app.scores = scores;
        app.phase = { kind: 'over', info: { title, time, currentIdx, disqualified, board } };
      },
    });
    return () => { app.game = null; };
  });

  function newGame(): void {
    if (app.pendingAction === null) app.pendingAction = 'newGame';
  }

  function openMenu(): void {
    if (app.phase.kind === 'playing') {
      app.phase = { kind: 'pausedMenu' };
    }
  }

  function closeMenu(): void {
    if (app.phase.kind === 'pausedMenu' && app.pendingAction === null) {
      app.pendingAction = 'resumePlay';
    }
  }

  function onModalOpened(): void {
    modalVisible = true;
  }

  function onModalClosed(): void {
    modalVisible = false;
  }

  $effect(() => {
    const action = app.pendingAction;
    if (action === null || app.cardsExiting || modalVisible) return;
    untrack(() => {
      app.pendingAction = null;
      app.phase = { kind: 'playing' };
      if (action === 'newGame') gameCounter++;
      else app.game?.resume();
    });
  });

  $effect(() => {
    document.body.className = app.theme;
    setTheme(app.theme);
  });
  $effect(() => setShowParity(app.showParity));

  $effect(() => {
    const onChange = () => {
      if (app.phase.kind === 'playing' && document.hidden) {
        app.phase = { kind: 'pausedTab' };
      } else if (app.phase.kind === 'pausedTab' && !document.hidden) {
        app.phase = { kind: 'playing' };
      }
    };
    document.addEventListener('visibilitychange', onChange);
    return () => document.removeEventListener('visibilitychange', onChange);
  });

  // Once the board stops being shown, it animates away before anything else
  // happens. CardGrid reports when it's done.
  $effect.pre(() => {
    if (app.cardsShown || untrack(() => app.game) === null) return;
    app.cardsExiting = true;
    return () => { app.cardsExiting = false; };
  });
</script>

<div id="game">
  <Header {openMenu} {closeMenu} />
  <CardGrid onCardsExited={() => (app.cardsExiting = false)} />
  <GameOverModal {newGame} {onModalOpened} {onModalClosed} />
  <MenuModal {newGame} {closeMenu} {onModalOpened} {onModalClosed} />
</div>
