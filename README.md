# Little Logic Lab

Calm, colourful logic puzzles for children aged 5 to 8. No timers to beat, no lives, no fail screens: just short puzzles, free hints and a big cheer when you win.

## Games

| Game | What you do |
| --- | --- |
| Light the Bulbs | Turn wire pieces so power reaches every bulb |
| Lost Rovers | Park rovers so each row and column has the right number of rover boxes |
| Number Chips | Fill boxes so groups add up (or differ) by their number, with no repeats in a row or column |
| Sudoku | Each number once in every row and column (and box, on 4×4) |
| Star Trails | Slide the rocket through every dot exactly once |
| Marble Run | Coming soon |

## How it's built

Plain HTML, CSS and JavaScript: no build step and no libraries.

- `index.html`: the home page with a tile for each game
- `shared/lab.css`: the "Sea glass" colours, layout and components every game uses
- `shared/lab.js`: shared helpers: sounds, confetti and the spoken cheer, the win card, the sticker book, the How to play animations, and saved progress
- One folder per game, each with a single `index.html`
- `stickers/`: the sticker book, showing every sticker earned, grouped by game

Progress (levels, stars and stickers) is saved in the browser on each device.

## Run it locally

Serve the folder with any static file server, for example:

```
npx http-server . -p 8090
```

Then open http://localhost:8090.
