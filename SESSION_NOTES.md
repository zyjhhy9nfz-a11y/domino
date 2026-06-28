# Session Notes — June 2026

**Branch:** `main`  
**Status:** 🟢 Playable — game-end UX shipped; **animation-tile-placement** next

---

## What we finished (game-end session — 2026-06-28)

### Game-end / round summary ✅ SHIPPED (`game-summary-screen`)
- **Approach:** Keep normal status bar chrome; no full-screen or bottom overlay
- **At round/match end the status bar shows:**
  - Same scores row (`You X · CPU Y · to 150 · Boneyard N`)
  - Winner score gets subtle underline (`.game-status__you--winner` / `--cpu--winner`)
  - Turn line: winner headline (e.g. “Computer wins the round”)
  - Round points line: `+60 this round · 55 in-play · sweep +5 (5 pips)`
  - Last play line: `Last play: no score · 21 pips on board`
- **Next Round / Play Again** button below hand (`.btn.btn-success`), not in status bar
- **Removed:** Summary overlay, `renderGameSummaryOverlay`, `.game-summary-*` CSS, `game-status--ended` card styling
- **Helpers:** `getGameSummaryModel()`, `rememberLastPlay()`, `formatLastPlayLine()`, `formatRoundPointsLine()`, `clearRoundSummaries()`

### Hobo scoring fix ✅
- **Bug:** After 6·4 then line-end 4·4, count showed 8 (spinner only) instead of 14 (line end 6 + spinner 8)
- **Fix:** `line-double` case in `evaluateBoardScoreHobo()` adds `lineEndPip + spinnerPips`; `commitHoboPlay()` passes `lineEndPip` after `promoteLineDoubleToSpinner()`
- **Verify:** `runHoboScoringChecklist()` in browser console (16/16)

### UX polish ✅
- **Double-render glitch:** Score toast no longer re-renders over game-end state (`isGameOver || isMatchOver` guard)
- **Score toast position:** Upper-right of `.board-wrapper` (`.feedback-toast--corner`); errors stay centered on game table
- **Settings panel:** Stable `.settings-card` width; rules note for House and Hobo; “Hide settings” inside card

---

## Pick up here — next session

### 🎯 START HERE: `animation-tile-placement`
- Smooth tile play animation (<300ms)
- MVP: land pulse on newly placed tile (`isLatest`)
- Branch expansion when a tile lands

### Phase 2 still open
1. **animation-tile-placement** ← do first (~30–45 min MVP)
2. **move-history-log**

### Optional infra
- Fix `main.test.js` — needs jsdom in Vitest config
- Off-network beta tunnel (ngrok / Cloudflare)
- Real-phone pass on house branch layout (375px) — see BLOCKERS.md follow-up

---

## Key code map (`main.js`)

| Symbol | Purpose |
|--------|---------|
| `getGameSummaryModel()` | Builds headline, winner, subline, lastPlayLine for status bar |
| `rememberLastPlay()` | Captures last play for end-of-round display |
| `renderGame()` status section (~1907+) | Scores row, turn line, board-pips, last-action, Play Again |
| `evaluateBoardScoreHobo()` | Hobo scoring; `line-double` uses `lineEndPip + spinnerPips` |
| `commitHoboPlay()` | Passes `lineEndPip` from branch tip after spinner promotion |
| `announceScoreFeedback()` | Corner toast; skips delayed re-render when game over |
| `handlePlayerManualDraw()` | Single-tap boneyard draw |
| `runHouseRulesChecklist()` | House rules smoke test (9 cases) |
| `runHoboScoringChecklist()` | Hobo scoring verification (16 cases) |

CSS: `.game-status__you--winner`, `.feedback-toast--corner`, `.settings-card`

---

## Design notes for game end

- During play: status shows scores, turn line, live board pips, italic `last-action` from `gameLog`
- At end: same layout + round subline + last play; board and hands stay fully visible
- Opponent tiles reveal face-up when `isGameOver`

---

## Prior sessions (reference)

### Compact boneyard (`4d4f66a`) ✅
- One-line caption, vertical auto tile, single-tap draw, `--boneyard-scale`

### Mobile viewport layout + settings (`be90233`, `2170378`) ✅
- Board fills phone viewport; settings/audit at bottom; Domino Style setting

### House rules branch layout (`91f45d7`) ✅
- L/R arms flush with spinner; long-branch overflow; `runHouseRulesChecklist()` 9/9

### Hobo rules (`dee07d3`) ✅
- Center-line opening, spinner transition, phase scoring

---

## Important: JavaScript only

Vanilla JavaScript (`main.js`, Vite, CSS). If `main.js` looks wrong (~60 lines, Python syntax): `git restore main.js`

---

## How to run

```bash
npm run dev    # http://localhost:5174 (or next free port)
npm run build  # verify production build
npm run beta   # LAN testing on port 3000
```

Browser checks:
```js
runHoboScoringChecklist()  // expect 16/16
runHouseRulesChecklist()   // expect 9/9
```

---

*Last updated: 2026-06-28 (end of session — game-end UX)*
