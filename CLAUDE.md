# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project

Vanilla JS Tetris (HTML5 Canvas). No dependencies, no `package.json`, no build, no linter, no tests. The README and UI strings are in Spanish; keep user-facing text in Spanish.

## Running

Open `index.html` directly, or serve statically (e.g. `python -m http.server 8000`) and visit `http://localhost:8000`.

## Architecture

All logic lives in `game.js`, a single script using module-level mutable globals (`board`, `current`, `next`, `score`, `lines`, `level`, `paused`, `gameOver`, `dropInterval`, `animId`, …) declared once and reset in `init()`. It binds directly to DOM ids defined in `index.html` (`board`, `next-canvas`, `score`, `lines`, `level`, `overlay`, `overlay-title`, `overlay-score`, `restart-btn`), so renaming an id in the HTML requires updating the lookups at the top of `game.js`.

Non-obvious points:
- Board cells hold `0` or a piece type index 1–8 (8 = the 3×3 "nut" challenge piece, whose center hole is drawn by `drawNutHole` only while the piece is moving); the same index selects the entry in `COLORS` and `PIECES` (index 0 is `null` in both). Piece matrices embed their own type index as the filled value.
- Two paths lock a piece: the `loop` gravity tick and `softDrop`/`hardDrop`. All go through `lockPiece()` → `merge()` → `clearLines()` → `spawn()`. Game over is triggered inside `spawn()` when the new piece collides.
- Pause/game-over stop the loop with `cancelAnimationFrame(animId)`; unpausing restarts it manually via `loop(performance.now())`, and `init()` cancels any existing frame before starting a new one.
- Rotation (`tryRotate`) is a simple CW rotation with horizontal kicks `[0, -1, 1, -2, 2]` — not SRS.
- Score: `LINE_SCORES[cleared] * level`; soft drop +1/row, hard drop +2/row. Fall interval is `max(100, 1000 - (level-1)*90)` ms.
- Records: `init()` also runs on page load (to paint the board) but the loop is cancelled and `started=false` until "Jugar" is pressed (`#start-overlay`). Extra DOM ids looked up in `game.js`: `start-overlay`, `play-btn`, `clear-records-btn`, `records-start`, `stats-start`, `records-over`, `stats-over`, `new-record-msg`, `record-form`, `name-input`. Top 5 lives in `localStorage['tetrisRecords']`, `{bestCombo, maxLines}` in `localStorage['tetrisStats']`; `combo` is updated in `clearLines()` (stats saved there and in `endGame()`). The keydown handler ignores events whose `e.target` is an `INPUT`. `init()` resets the game-over overlay content because the pause overlay reuses `#overlay`.
- Canvas size is hard-coded in `index.html` (`300×600`, next preview `120×120`) and must equal `COLS*BLOCK × ROWS*BLOCK` if those constants change in `game.js`.
