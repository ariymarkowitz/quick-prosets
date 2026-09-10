# Quick Prosets

A browser-based single-player implementation of the card game ProSet. This is a fork of [Quick Sets](https://github.com/ariymarkowitz/quick-sets). The original app is designed for speedrunning, but ProSet is very hard so good luck.

## How to play

Every card has six circles of different colours (red, orange, green, blue, purple and pink). Each circle can be solid or open.

A proset is three cards where every colour is solid an even number of times. With three cards that means each colour has to be solid on exactly zero or two of them.

Click three cards to select them. If they form a valid proset, they're removed and replaced from the deck. If not, you get a brief "Not a proset!" flash and can try again.

The deck is the 63 cards with at least one solid circle (the all-open circle cannot be part of a proset of unique cards, since the other two would have to be equal).

The game ends when there are no prosets among the remaining cards (deck + board combined).

## Features

- Light/dark theme toggle
- Different UI speeds for casual play and speedrunning
- Hints for when you are stuck or a cheater
- Auto-reshuffle when no prosets exist on the board
- Top 5 leaderboard saved locally
- Works well on mobile browsers
- The cards orient vertically in portrait mode, and horizontally in landscape mode
- Can be installed as a Progressive Web App

Made with the help of Claude.
