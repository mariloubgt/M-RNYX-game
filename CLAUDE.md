# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project

"ARENA — The Mansion" is a horror escape-room puzzle for a real competition, built with React and Vite and deployed on Vercel. There is no test framework.

```bash
npm install
npm run dev              # dev server
npm run build            # outputs to dist/
npm run preview          # serves dist/
npm run lint             # oxlint
npm run encrypt-ending   # regenerates src/game/endingCipher.js from secrets/ending.json
```

`src/prototype/asylum.html` is the original single-file game, kept as a visual and behavioural reference. It is not part of the build, and the Séance Room has since changed on purpose (questions, message, answer and timing), so the current code is the reference for that room. Do not read it whole: it has lines of up to 3 MB of base64. Use `Grep`, then `Read` with `offset`/`limit`.

## Architecture

**React owns structure and game state; scene modules own animation.**

- `src/game/GameProvider.jsx` holds the current screen, solved rooms, team name, and decrypted ending. `show(id)` is the only way to change screens and also syncs `location.hash`. It refuses `end` until all rooms are solved.
- `src/screens/ward/wardScene.js`, `seance/seanceScene.js`, `kitchen/kitchenScene.js` and `src/game/scares.js` are imperative. They look up elements by id and run the frame-by-frame animation, and their timing is the game's feel. Each exports an `init…()` that a component calls from `useEffect`.
- `src/game/audio.js` is a single module-level audio engine outside React, so only one `AudioContext` exists. Components read its state with `useAudioState()`.

**Rules that keep this working:**

- **All screens stay mounted** and are hidden by CSS (`.screen.active`). Unmounting one would reset room progress such as opened cupboards, notes, and the séance transcript.
- **One owner per element.** Room components are `memo`'d with static JSX, and only `active` changes their `className`. Content a scene writes (`#hwDoors`, `#kItems`, `#tbody`, and so on) has no React children. Never give those elements changing props or children.
- **Scenes use `createScope()`** from `src/game/scope.js`. Its `setTimeout`, `setInterval`, `requestAnimationFrame`, and `on` replace the globals inside a scene so everything stops on cleanup. Anything a scene adds to the DOM must be removed through `scope.add()`, or `StrictMode`'s double mount duplicates it.
- **CSS import order is the cascade.** `src/styles/index.css` imports files in the original source order, and later files override earlier ones across rooms. Don't reorder them.
- **`App.jsx` element order is the stacking order.**

The room id `store` is the Kitchen (a leftover name). Opening `#ward`, `#seance`, or `#store` directly skips the opening sequence, which helps when testing one room. Progress lives in memory only, so a reload resets it.

## Media

Everything is listed in `src/game/media.js` and lives in `public/media/`. `source-assets/` holds unused originals and is not deployed, including the full-quality `game_background_clean_original.mp4`. Its compressed version in `public/media/video/` is the video that plays after START GAME.

## Answers and the ending

Don't put answers or ending text in plaintext anywhere in `src/`, in comments, or in this file.

- **Answers:** `src/game/answers.js` stores `SHA-256("asylum:" + ANSWER)`. Input is uppercased and stripped to `A-Z`, and either the whole input or its first word can match.
- **HTTP support:** `src/game/sha256.js` is a plain-JS SHA-256, because `crypto.subtle` is missing over plain HTTP (the event's local network). Anything cryptographic must work without `crypto.subtle`.
- **Ending:** `src/game/endingCipher.js` is generated and is decrypted with a key derived from the three correct answers (`src/game/endingCrypto.js`). The plaintext lives in the gitignored `secrets/ending.json`; the expected shape is documented at the top of `scripts/encrypt-ending.mjs`.
- **To change the ending or an answer:** update `secrets/ending.json` (and the hash in `answers.js` for an answer), then run `npm run encrypt-ending`. The script refuses answers that don't match their hashes.
