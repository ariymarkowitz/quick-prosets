# Quick Prosets

A browser-based single-player implementation of the card game ProSet. This is a fork of [Quick Sets](https://github.com/ariymarkowitz/quick-sets). ProSet is much harder than Set, but the reduced deck size in this variation helps balance out some of the difficulty.

## How to play

Every card has six circles of different colours (red, orange, green, blue, purple and pink). Each circle can be solid or open.

A proset is a set of cards where every colour is solid an even number of times.

Click on cards to select them. If the selected cards form a proset, they're removed and replaced from the deck.

The deck is the 63 cards with at least one solid circle (the all-open circle is not included because it is a proset by itself).

The game ends when all of the cards are cleared. A property of ProSets is that once the deck is empty, all of the remaining cards together form a proset.

## Features

- Light/dark theme toggle
- A 'parity hint' that shows which colours your selection clears.
- Hints for when you are stuck
- Top 5 leaderboard saved locally
- Works well on mobile browsers
- The cards orient vertically in portrait mode, and horizontally in landscape mode
- Can be installed as a Progressive Web App

Made with the help of Claude.
