# Session Notes — June 2026

**Branch:** `main` (local changes committed)  
**Status:** 🟢 Playable — Hobo rules complete; House rules unchanged

---

## What we finished (Hobo rules session)

### Hobo play flow ✅ COMPLETE
- **Draw for high tile** (automated), reshuffle, deal 7; prior-round winner opens
- **Center-line phase:** single **●(any)** slot; non-double opens horizontal; **◄ / ►** extend line
- **Line scoring:** outside ends only until spinner is set
- **Spinner transition:** double on line end → vertical spinner centered on board; line shifts to opposite branch
- **Spinner hub:** 4-arm layout; up/down slots flush against spinner (half-tile placement blocks)
- **Blocked rounds:** no sweep points; most pips held opens next round; pip tie → automated draw

### Hobo scoring ✅ VERIFIED (13/13 automated checks)
Run in browser console: `runHoboScoringChecklist()`

| Phase | Rule | Verified |
|-------|------|----------|
| First tile | All pips on tile count | ✅ |
| Center line | Outside ends only | ✅ |
| Double sets spinner | Full double pips | ✅ |
| Spinner + one branch | Outer pip + all spinner pips | ✅ |
| Two+ branches | House-style branch tips only | ✅ |
| Round sweep | Rounds **up** to nearest 5 (Hobo) | ✅ |

In-play scoring scores only when total pips are an exact multiple of 5.

### Board layout fixes ✅
- Spinner pinned to board midpoint (`1fr auto 1fr` hub grid)
- Up/down placement slots no longer float a tile-width away from spinner
- Half-tile play slots restored after spacing fix

### Other polish (this session)
- Game target score (100–300, default 150) with `You: X / 150` display
- Match win at target score
- Debug helpers: `setState()`, `previewSpinnerOnly()`, `previewHoboSpinnerFromLine()`, `runHoboScoringChecklist()`

### Prior sessions (still relevant)
- CSS pip dominoes, settings panel, score toasts, mobile layout, tile orientation fix
- House rules: highest-double start, sweep rounds down, Louisiana in-play scoring

---

## Pick up here — next session

### 🎯 START HERE: `animation-tile-placement`

Natural follow-on to styled tiles. See **TODO.md**.

### Phase 2 still open
1. **animation-tile-placement** ← recommended next
2. game-summary-screen
3. move-history-log

### Optional infra
- Fix `main.test.js` — needs jsdom in Vitest config
- Off-network beta tunnel (ngrok / Cloudflare)

---

## Key code map (`main.js`)

| Symbol | Purpose |
|--------|---------|
| `hoboCenterLineActive` | `true` = center-line UI; `false` = spinner hub |
| `commitHoboPlay()` | All Hobo play targets (center, line ends, branches) |
| `promoteLineDoubleToSpinner()` | Line-end double → spinner + branch conversion |
| `evaluateBoardScoreHobo()` | Phase-aware Hobo in-play scoring |
| `roundSweepPips()` | House: round down; Hobo: round up |
| `startRoundAfterBlocked()` | Blocked-round opener logic |
| `runHoboScoringChecklist()` | Console scoring verification (13 cases) |

Settings defaults: black pips, House rules, Pips display. Hobo is non-default in settings.

---

## Important: JavaScript only

This project is **vanilla JavaScript** (ES modules + Vite). All game logic lives in `main.js`.

**Do not mix in Python or other languages.** If `main.js` is suddenly ~60 lines or contains non-JS syntax, run:

```bash
git restore main.js
```

Sanity-check: `main.js` should be ~2200+ lines of JavaScript; game loads at `npm run dev`.

---

## How to run

```bash
npm run dev    # development (hot reload), http://localhost:5174
npm run beta   # production build for phone testing on same Wi‑Fi, port 3000
```

Console output prints local + LAN URLs for phone/tablet testing.

---

*Last updated: 2026-06-14*
