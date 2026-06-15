# Session Notes — June 2026

**Branch:** `main`  
**Status:** 🟢 Playable — compact boneyard shipped; **animation-tile-placement** next

---

## What we finished (compact boneyard session — 2026-06-15)

### Compact boneyard display ✅ SHIPPED
- **One-line caption:** `Boneyard (N) - Auto-draw or tap a tile` above the draw pool
- **Auto tile:** blue domino-shaped button at pool left; label reads top-to-bottom **a → u → t → o → ⚡**
- **Compact pool:** smaller face-down tiles (`--boneyard-scale`), horizontal scroll (no multi-row wrap)
- **Single-tap draw:** manual boneyard pick draws immediately (removed two-tap select/confirm)
- **Less vertical gap** between board and hand when player must draw

---

## Pick up here — next session

### 🎯 START HERE: `animation-tile-placement`
- Smooth tile play animation (<300ms)
- Branch expansion when a tile lands

### Phase 2 still open
1. **animation-tile-placement** ← do first
2. game-summary-screen
3. move-history-log

### Optional infra
- Fix `main.test.js` — needs jsdom in Vitest config
- Off-network beta tunnel (ngrok / Cloudflare)
- Real-phone pass on house branch layout (375px) — see BLOCKERS.md follow-up

---

## Prior sessions (reference)

### Mobile viewport layout + settings (`be90233`, `2170378`) ✅
- Board fills phone viewport; settings/audit at bottom
- Domino Style setting (black/color pips, numerals)

### House rules branch layout (`91f45d7`) ✅
- L/R arms flush with spinner; long-branch overflow; `runHouseRulesChecklist()` 9/9

### Hobo rules (`dee07d3`) ✅
- Center-line opening, spinner transition, phase scoring (13/13)

---

## Key code map (`main.js`)

| Symbol | Purpose |
|--------|---------|
| `handlePlayerManualDraw()` | Single-tap boneyard draw |
| `handlePlayerAutoDraw()` | Draw until playable tile |
| Draw UI in `renderGame()` | `.draw-caption` + `.boneyard-pool` with `.boneyard-auto-tile` |
| `getVisibleBranchSegments()` | Long-branch visibility |
| `runHouseRulesChecklist()` | House rules smoke test (9 cases) |
| `runHoboScoringChecklist()` | Hobo scoring verification (13 cases) |

CSS: `--boneyard-scale` on `.draw-section`; `.boneyard-auto-tile__label` stacks chars vertically.

---

## Important: JavaScript only

Vanilla JavaScript (`main.js`, Vite, CSS). If `main.js` looks wrong (~60 lines, Python syntax): `git restore main.js`

---

## How to run

```bash
npm run dev    # http://localhost:5174 (or next free port)
npm run beta   # LAN testing on port 3000
```

---

*Last updated: 2026-06-15 (end of session — compact boneyard)*
