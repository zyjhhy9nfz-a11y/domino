# Louisiana Dominos Game - Status Report

## Latest Session (June 2026 — end of day)

**Status:** 🟢 Playable — mobile viewport layout + settings polish complete

**Branch:** `main`

See **SESSION_NOTES.md** for full handoff.

### Shipped this session
- **Mobile viewport layout:** board expands on phones/tablets (≤768px) so Settings and audit tape sit at the bottom; uses `visualViewport` + flex column layout
- **Stable board height:** `--board-fill-min-h` only grows during a round (never shrinks when status lines appear after spinner play); capped at full up/down branch height; resets each new round
- **Domino Style setting:** merged redundant Pip style + Tile display into one control (Black pips / Color pips / Numerals) with legacy localStorage migration
- **Settings panel layout:** centered panel, left-aligned section titles and radio columns

### Prior sessions
- **`91f45d7`** — House branch layout, unified tile scale, compact status bar, hand zones
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
- ✅ CSS pip dominoes with Domino Style setting (black pips / color pips / numerals)
- ✅ Visual board display with spinner hub and Hobo center-line phase
- ✅ Compact status bar, score toasts, invalid-move feedback
- ✅ Bordered player hand + opponent rack
- ✅ Mobile viewport-fill board layout with stable min-height per round
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
