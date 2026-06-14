# Session Notes — June 2026

**Branch:** `main` (synced with `origin/main`)  
**Status:** 🟢 Playable on desktop and mobile; LAN beta hosting works

---

## What we finished this session

### Phase 2 polish (partial)
- **Mobile-responsive UI** — touch targets, scaled board, safe-area padding
- **Turn indicator** — banner for player / computer / game over
- **Boneyard count** — shown in score panel and draw section
- **Collapsible audit tape** — toggle on all devices (open on desktop, collapsed on mobile by default)
- **Long-branch play fix** — play button stays visible when branches exceed 3 tiles
- **Mobile board centering** — spinner centered on small viewports

### Infrastructure
- **LAN beta hosting** — `npm run beta` (build + serve on port 3000)
- **Dev network access** — `npm run dev` binds all interfaces (port 5174)
- **Startup URL messages** — local + LAN URLs printed for phone/tablet testing

### Housekeeping (this wrap-up)
- Deleted stale branch `nbpeth-maybefixsomething` (identical to `main`, no unique fixes)
- Updated `TODO.md`, `BLOCKERS.md`, and this file

---

## Important: JavaScript only

This project is **vanilla JavaScript** (ES modules + Vite). All game logic lives in `main.js`.

**Do not mix in Python or other languages.** A corrupted edit once replaced most of `main.js` with Python syntax (`import sys`, `def init_game():`), which broke the game entirely. If `main.js` is suddenly ~60 lines or contains non-JS syntax, run:

```bash
git restore main.js
```

Before committing, sanity-check: `main.js` should be ~850 lines of JavaScript and the game should load at `npm run dev`.

---

## How to run

```bash
npm run dev    # development (hot reload), http://localhost:5174
npm run beta   # production build for phone testing on same Wi‑Fi, port 3000
```

Console output prints URLs for this computer and phones on the same network.

---

## Pick up here next session

**Recommended next tasks** (Phase 2, highest impact):

1. **score-announcement** — pop-up when points are scored
2. **invalid-move-feedback** — explain rejected moves
3. **tile-visual-polish** — pip styling, better tile appearance

**Optional infra:**
- Off-network beta tunnel (ngrok / Cloudflare) for testers not on your Wi‑Fi
- Fix `main.test.js` — needs jsdom environment in Vitest config

**Phase 2 still open:** animations, game summary screen, move history log

---

## Commits this session (reference)

- Mobile-responsive UI and LAN beta hosting
- Fix long-branch play and collapsible audit tape
- Center the game board on mobile viewports
- Docs and housekeeping (this commit)

---

*Last updated: 2026-06-14*
