<script lang="ts">
  import { untrack } from 'svelte';
  import Header from './components/Header.svelte';
  import CardGrid from './components/CardGrid.svelte';
  import GameOverModal from './components/GameOverModal.svelte';
  import MenuModal from './components/MenuModal.svelte';
  import { app } from './lib/AppState.svelte';
  import { Game } from './lib/Game.svelte';
  import { getScores, getMode, setMode, getStoredTheme, setTheme, getShowParity, setShowParity, saveScore as persistScore } from './lib/storage';
  import { VICTORY_MESSAGES, CARD_W, CARD_H } from './lib/constants';

  // Make the grid cell the same shape as the card viewBox.
  document.documentElement.style.setProperty('--card-short', String(CARD_W));
  document.documentElement.style.setProperty('--card-long', String(CARD_H));

  app.scores = getScores();
  app.mode = getMode();
  app.theme = getStoredTheme();
  app.showParity = getShowParity();

  let gameCounter = $state(0);
  let modalAnimating = $state(false);

  $effect(() => {
    const counter = gameCounter;
    if (counter === 0) return;
    app.game = new Game({
      getRunning: () => app.running,
      getCardsExiting: () => app.cardsExiting,
      getShowParity: () => app.showParity,
      getAnimSettings: () => app.animSettings,
      onEndGame: ({ time, disqualified, parityUsed }) => {
        const title = VICTORY_MESSAGES[Math.floor(Math.random() * VICTORY_MESSAGES.length)]!;
        const scores = disqualified ? getScores() : persistScore(time, parityUsed);
        const board = parityUsed ? scores.parity : scores.plain;
        const currentIdx = disqualified ? -1 : board.indexOf(time);
        app.scores = scores;
        app.phase = { kind: 'over', info: { title, time, currentIdx, disqualified, parityUsed } };
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
    modalAnimating = true;
  }

  function onModalClosed(): void {
    modalAnimating = false;
  }

  function onCardsExited(): void {
    app.cardsExiting = false;
  }

  $effect(() => {
    if (app.pendingAction !== null && !app.cardsExiting && !modalAnimating) {
      untrack(() => {
        const action = app.pendingAction;
        app.pendingAction = null;
        if (action === 'newGame') {
          gameCounter++;
          app.phase = { kind: 'playing' };
        } else if (action === 'resumePlay') {
          app.phase = { kind: 'playing' };
          app.game?.triggerResumeDeal();
        }
      });
    }
  });

  $effect(() => setMode(app.mode));
  $effect(() => setTheme(app.theme));
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

  $effect.pre(() => {
    if (app.cardsShown) return;
    // The parity card is still up after the last cards clear, so a finished
    // game has something to animate out too.
    const onGrid = untrack(() =>
      app.game !== null && (app.game.activeEntries.length > 0 || app.showParity)
    );
    if (!onGrid) return;
    app.cardsExiting = true;
    return () => { app.cardsExiting = false; };
  });

  $effect(() => {
    const root = document.documentElement.style;
    root.setProperty('--deal-duration', `${app.animSettings.dealDuration}ms`);
    root.setProperty('--remove-duration', `${app.animSettings.removeDuration}ms`);
  });
</script>

<div id="game">
  <Header {openMenu} {closeMenu} />
  <CardGrid {onCardsExited} />
  <GameOverModal {newGame} {onModalOpened} {onModalClosed} />
  <MenuModal {newGame} {closeMenu} {onModalOpened} {onModalClosed} />
</div>
