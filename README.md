# ARENA — The Mansion

A horror escape-room puzzle made by the NCS Club for Arena. Players ride an elevator through three rooms, each hiding one answer, to unlock the basement and the final phrase.

## Running it

```bash
npm install
npm run dev       # development server
npm run build     # production build in dist/
npm run preview   # serve the production build
npm run lint
```

The game needs a web server, so opening `index.html` directly won't work. It deploys to Vercel with the default Vite settings.

To serve it on a local network over plain HTTP, run `npm run build`, then `npm run preview -- --host`.

## Running it for several teams on one computer

Reload the page before the next team plays. Nothing is saved, so every reload starts a new game from the title screen.

To jump to a room while testing, add `?dev=ward`, `?dev=seance`, `?dev=store` or `?dev=end` to the address. This only works with `npm run dev`, not on the deployed site.

## Changing the final phrase or an answer

The final phrase is encrypted, and its plaintext is kept out of the repository in `secrets/ending.json`. That file is gitignored, so keep your own copy somewhere safe. See `scripts/encrypt-ending.mjs` for its format, then run `npm run encrypt-ending` after any change and commit the regenerated `src/game/endingCipher.js`.

## Project layout

- `src/screens/`: one component per screen
- `src/components/`: pieces shared between screens
- `src/game/`: game state, audio, media list, answers and ending encryption
- `src/styles/`: the stylesheet, imported in cascade order
- `public/media/`: video, images and sounds used by the game
- `source-assets/`: original files that aren't deployed
- `src/prototype/asylum.html`: the original single-file game, kept for reference (its Séance Room is the old version)
