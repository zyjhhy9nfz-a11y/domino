# Louisiana Dominos Game - Status Report

## Latest Session (June 2026 — end of day)

**Status:** 🟢 Playable — House layout + mobile UI polish complete

**Branch:** `main` · **Commit:** `91f45d7` (pushed)

See **SESSION_NOTES.md** for full handoff.

### Shipped today (`91f45d7`)
- **House branch layout:** overflow fix (3-tile `···` + 2 visible), arms flush with spinner, 2-tile open-end on long branches
- **Mobile tile scale:** unified `--tile-scale` — board/hand match; no transform layout gap
- **Compact status bar:** scores `to 150`, Boneyard count, slim turn line; dropped computer tile count (visible in opponent rack)
- **Hand zones:** bordered player hand + computer opponent rack
- **Settings:** minimal text link (no gear, no rule above)
- **Checklist:** `runHouseRulesChecklist()` 9/9

### Prior sessions
- **`9b0fc7c`** — House L/R arm split, empty-branch slots, long-branch scroll
- **`dee07d3`** — Hobo rules + scoring (13/13), spinner hub, blocked rounds

### Next up
1. **`compact-boneyard-display`** — shrink draw section on mobile
2. **`animation-tile-placement`**
3. game-summary-screen → move-history-log

---

## ✅ GAME IS UP AND RUNNING!

Domino game prototype is **fully functional** with House and Hobo rule variants. Mobile-tested on iPhone (375px).

---

*Earlier sections below are historical reference.*

---

## What Was Fixed (Session 2)

### The Bug 🐛
The game was rejecting valid moves where a tile matched an exposed branch tip.

### The Solution ✨
Changed `getBranchTip()` to use the explicitly stored `outerEdge` value.

---

## Features Currently Implemented

### Core Game Mechanics
- ✅ Standard 28-tile domino deck
- ✅ House rules (highest double start, Louisiana scoring, sweep rounds down)
- ✅ Hobo rules (draw for high, center line, spinner phases, sweep rounds up)
- ✅ 4-branch spinner system (up/down/left/right)
- ✅ Draw from boneyard (manual and auto-draw)
- ✅ Player vs Computer AI
- ✅ Move validation engine
- ✅ Win condition detection (round + match to target score)

### UI Features
- ✅ CSS pip dominoes with settings (pips/color, numerals, House/Hobo)
- ✅ Visual board display with spinner hub and Hobo center-line phase
- ✅ Compact status bar, score toasts, invalid-move feedback
- ✅ Bordered player hand + opponent rack
- ✅ Scoring audit tape (collapsible)
- ✅ Mobile-responsive layout; unified tile scale; House long-branch scroll

### Debug Tools
- ✅ Debug State / Repair State buttons
- ✅ `runHoboScoringChecklist()`, `runHouseRulesChecklist()`, board preview helpers

---

## Running the Game

```bash
npm run dev    # http://localhost:5174
npm run beta   # LAN testing on port 3000
```

---

**Status**: 🟢 READY FOR COMPACT BONEYARD, THEN ANIMATIONS
