# CLAUDE.md

Quick Prosets — browser-based single-player ProSet card game. A card is six fixed-position coloured circles, each solid or open; any non-empty set of cards is a proset when every colour is solid an even number of times. Svelte 5 + Vite + TypeScript, deployed to GitHub Pages.

## Commands

- `npm run dev` / `dev:status` / `build` / `preview` / `check` / `deploy`
- No test suite or linter.

## Testing

Use an already running dev server to preview if there is one, otherwise create a background server and close it after testing.

## Reactive architecture

Before writing or restructuring reactive code ($state/$derived/$effect, classes that own effects, cross-component lifecycles), read [agent/reactive-architecture.md](agent/reactive-architecture.md). Core idea: scopes own lifetime, effects are transient attachments; prefer `$derived` over effect-that-assigns; effects that set up external resources must return cleanup; reactive modules (classes or factory functions with effects) take getter props.

## Where things live

- [src/App.svelte](src/App.svelte) — composes the components and owns everything cross-component: creating each `Game`, the `pendingAction` transition machine, the tab-visibility listener, the CSS variables for card geometry and animation timings.
- [src/lib/AppState.svelte.ts](src/lib/AppState.svelte.ts) — singleton `app`: the `Phase` union, theme/parity-hint settings, and the derived flags components gate on.
- [src/lib/Game.svelte.ts](src/lib/Game.svelte.ts) — the `Game` class, one instance per game, held at `app.game`. Deck, board, selection, hints, `parity` (the card that would complete the selection), and the flash → remove → deal pipeline.
- [src/lib/game-utils.ts](src/lib/game-utils.ts) — pure card logic: cards as bitmasks over `COLORS`, the proset test, the hint search.
- [src/lib/constants.ts](src/lib/constants.ts) — `ANIM_SETTINGS`, `BOARD_SIZE`, card and circle-grid geometry.
- [src/lib/timer.svelte.ts](src/lib/timer.svelte.ts) and [src/lib/storage.ts](src/lib/storage.ts) — the pausable game timer; localStorage for theme, the parity hint setting, and two top-5 leaderboards split by whether the parity hint was shown during the game.
- [src/components/](src/components) — `Card`, `CardFace` (the six circles, shared by `Card` and `ParityCard`), `CardGrid`, `ParityCard` (the parity hint, drawn on the grid), `Header`, `Modal` (animated primitive), `MenuModal` (main/help/parity/leaderboard views), `GameOverModal`.
- [src/icons/](src/icons) — SVG icons, applied as CSS masks in `Header` and `MenuModal`.
- [src/app.css](src/app.css) — global tokens themed for light and dark, including the `.dot` / `.color-*` rules that colour the circles.

## Conventions

- State lives in two scopes: `app` (long-lived) and `Game` (one per game, torn down by the effect that created it). `Game` takes its app-level dependencies as getters.
- Components read state from `app` / `app.game` and call methods on them; they never mutate state.
- `app.phase` is the single source of truth for lifecycle. Derive from it rather than adding parallel booleans.
- Transitions are state-driven: the child owns its animation and fires a done callback; the parent never times the child.
- A 7-card board always contains a proset, and whatever is left when the deck empties is a proset itself — the game cannot deadlock, so there is deliberately no reshuffle or no-moves handling.
- `CLAUDE.md` should only contain instructions, guidelines, and file locations.
