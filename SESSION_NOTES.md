# Session Notes — June 2026

**Branch:** `main` (pushed — `9b0fc7c`)  
**Status:** 🟢 Playable — Hobo rules complete; House rules mobile branch layout improved (more polish next session)

---

## What we finished (House layout session — 2026-06-14)

### House rules mobile branch layout ✅ SHIPPED (`9b0fc7c`)
- **Long left/right branches:** split arm into `branch-open-end` (play side) + `branch-spinner-end` (··· / anchor tile at spinner)
- **Overflow:** show `···` at spinner side, latest open-end tile + play slot on the outside; horizontal arms scroll to open end
- **Empty branches:** left/right play slots pinned to spinner side (`branch-arm-row--spinner-only`)
- **Compact break badge:** `chain-link--break-h/v` — no longer full tile width
- **Debug helpers:** `previewHouseEmptySpinner()`, `previewHouseSingleLeftBranch()`, `previewHouseLongLeftBranch()`, `runHouseRulesChecklist()` (6/6)

### Still to polish (House layout — next session) 🎯
- **Horizontal placement affordances** on spinner-only boards — user reported left/right slots looked ~2 tiles away from spinner (top/bottom were correct). Code fix landed (`spinnerEnd` + arm alignment); **verify on real phone** and tune visual spacing if needed
- **1-tile / 2-tile branch states** — confirm slot + tile positions feel right on mobile after empty-branch fix
- **Long-branch scroll** — spot-check left arm at 4+ tiles on iPhone mini (375px)

Run in console:
```js
previewHouseEmptySpinner(6)   // empty branches, slots at spinner
previewHouseSingleLeftBranch() // 1 tile each side
previewHouseLongLeftBranch()   // 4 tiles left, scroll + slot
runHouseRulesChecklist()
```

---

## Prior session (Hobo rules — `dee07d3`)

### Hobo play flow ✅ COMPLETE
- Draw for high tile, reshuffle, deal 7; prior-round winner opens
- Center-line phase: **●(any)** slot; **◄ / ►** extend line
- Line scoring: outside ends only until spinner is set
- Spinner transition: double on line end → vertical spinner; line shifts to opposite branch
- Spinner hub: up/down slots flush against spinner (half-tile placement blocks)
- Blocked rounds: no sweep points; most pips held opens next round; pip tie → automated draw

### Hobo scoring ✅ VERIFIED (13/13)
Run: `runHoboScoringChecklist()`

### Board layout (Hobo) ✅
- Spinner pinned to board midpoint (`1fr auto 1fr` hub grid)
- Half-tile play slots

---

## Pick up here — next session

### 🎯 START HERE: House branch layout polish

Verify and finish left/right placement affordance spacing on mobile (see checklist above). Quick pass on 1-tile, 2-tile, and long-branch states before moving on.

### Then: `animation-tile-placement`

Natural follow-on to styled tiles. See **TODO.md**.

### Phase 2 still open
1. **house-branch-layout** ← do first (short polish pass)
2. **animation-tile-placement**
3. game-summary-screen
4. move-history-log

### Optional infra
- Fix `main.test.js` — needs jsdom in Vitest config
- Off-network beta tunnel (ngrok / Cloudflare)

---

## Key code map (`main.js`)

| Symbol | Purpose |
|--------|---------|
| `getVisibleBranchSegments()` | Long-branch visibility: `···` + open-end tile(s) |
| `renderBranchChain()` | Hub arms; horizontal uses `branch-arm-row` split |
| `scrollHorizontalArmsToOpenEnd()` | Pin scroll to play slot on long L/R branches |
| `hoboCenterLineActive` | `true` = center-line UI; `false` = spinner hub |
| `commitHoboPlay()` | All Hobo play targets |
| `promoteLineDoubleToSpinner()` | Line-end double → spinner + branch conversion |
| `evaluateBoardScoreHobo()` | Phase-aware Hobo in-play scoring |
| `roundSweepPips()` | House: round down; Hobo: round up |
| `runHoboScoringChecklist()` | Hobo scoring verification (13 cases) |
| `runHouseRulesChecklist()` | House rules smoke test (6 cases) |

Settings defaults: black pips, House rules, Pips display. Hobo is non-default in settings.

---

## Important: JavaScript only

This project is **vanilla JavaScript** (ES modules + Vite). All game logic lives in `main.js`.

**Do not mix in Python or other languages.** If `main.js` is suddenly ~60 lines or contains non-JS syntax, run:

```bash
git restore main.js
```

Sanity-check: `main.js` should be ~2400+ lines of JavaScript; game loads at `npm run dev`.

---

## How to run

```bash
npm run dev    # development (hot reload), http://localhost:5174
npm run beta   # production build for phone testing on same Wi‑Fi, port 3000
```

Console output prints local + LAN URLs for phone/tablet testing.

---

*Last updated: 2026-06-14 (end of day)*
