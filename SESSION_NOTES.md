# Session Notes — June 2026

**Branch:** `main` (pushed — `91f45d7`)  
**Status:** 🟢 Playable — House layout + mobile UI polish complete; compact boneyard next

---

## What we finished (UI + House layout session — 2026-06-14)

### House rules branch layout ✅ SHIPPED (`91f45d7`)
- **Overflow fix:** 3-tile branches now show `···` + 2 open-end tiles (was invisible 3rd tile bug when `MAX_VISIBLE_PER_BRANCH` was 3)
- **Horizontal arms:** `width: auto` + `flex-end`/`flex-start` — slots and tiles pack flush against spinner (no phantom gap)
- **Long branches:** 2 tiles at open end + `···` at spinner; horizontal scroll to play slot
- **Checklist:** `runHouseRulesChecklist()` — 9/9

### Mobile UI polish ✅ SHIPPED (`91f45d7`)
- **Unified tile scale:** `--tile-scale` on mobile (0.9 / 0.85) — board and hand tiles match; removed board-only `transform: scale` phantom layout gap
- **Compact status bar:** `You 0 · CPU 0 · to 150 · Boneyard 14` + slim turn line; pips/last-action only when relevant
- **Hand zones:** bordered `.hand-container` (player) and `.opponent-rack` (computer peek tiles)
- **Settings:** plain white “Settings” text link, no gear, no horizontal rule above

### Debug helpers (console)
```js
previewHouseEmptySpinner(6)
previewHouseSingleLeftBranch()
previewHouseTwoTileLeftBranch()
previewHouseThreeTileLeftBranch()
previewHouseLongLeftBranch()
runHouseRulesChecklist()
```

---

## Pick up here — next session

### 🎯 START HERE: `compact-boneyard-display`

Draw section (pink boneyard panel) takes too much vertical space on phone between board and hand. Shrink it while keeping Auto-Draw + manual pick.

**Ideas to try:**
- Inline header row: `Boneyard (4)` + Auto-Draw button on one line
- Smaller boneyard tile backs
- Collapsible draw panel (expand only when player must draw)
- Move count to status bar only when not drawing (already shows `Boneyard N`)

### Then: `animation-tile-placement`

### Phase 2 still open
1. **compact-boneyard-display** ← do first
2. **animation-tile-placement**
3. game-summary-screen
4. move-history-log

### Optional infra
- Fix `main.test.js` — needs jsdom in Vitest config
- Off-network beta tunnel (ngrok / Cloudflare)

---

## Prior sessions (reference)

### Hobo rules (`dee07d3`) ✅ COMPLETE
- Center-line opening, spinner transition, phase-aware scoring (13/13 checklist)
- Blocked rounds, game target score, hub layout

### House layout partial (`9b0fc7c`)
- Split L/R arms, empty-branch slots, compact `···` badge — superseded by `91f45d7` polish

---

## Key code map (`main.js`)

| Symbol | Purpose |
|--------|---------|
| `getVisibleBranchSegments()` | Long-branch visibility: `···` + open-end tiles (`MAX_VISIBLE_OPEN_END = 2`) |
| `renderBranchChain()` | Hub arms; horizontal uses `branch-arm-row` split |
| `scrollHorizontalArmsToOpenEnd()` | Pin scroll to play slot on long L/R branches |
| `hoboCenterLineActive` | `true` = center-line UI; `false` = spinner hub |
| `runHoboScoringChecklist()` | Hobo scoring verification (13 cases) |
| `runHouseRulesChecklist()` | House rules smoke test (9 cases) |

CSS: `--tile-scale` sizes all dominoes; `.game-status` compact header; `.hand-container` / `.opponent-rack` bordered racks.

Settings defaults: black pips, House rules, Pips display.

---

## Important: JavaScript only

Vanilla JavaScript (`main.js`, Vite, CSS). If `main.js` looks wrong (~60 lines, Python syntax): `git restore main.js`

Sanity-check: `main.js` ~2450+ lines; game loads at `npm run dev`.

---

## How to run

```bash
npm run dev    # http://localhost:5174 (or next free port)
npm run beta   # LAN testing on port 3000
```

---

*Last updated: 2026-06-14 (end of session — pushed `91f45d7`)*
