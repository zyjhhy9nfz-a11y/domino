# Known Blockers & Issues

Issues discovered during development. Add here when you find bugs or blockers!

---

## Current Blockers

### None at this time ✅

The game is stable and playable on desktop and mobile (June 2026 session).

---

## Historical Issues (Resolved)

### Session 2: Branch Tip Mismatch ✅ FIXED
- **Symptom**: Valid moves (6·0 on exposed 0) were rejected
- **Root Cause**: `getBranchTip()` function read tile orientation incorrectly
- **Solution**: Use explicit `outerEdge` field instead of array index
- **Status**: RESOLVED - Fixed in main.js
- **Verified**: Tested with 6·0, 4·0, 0·5 on exposed 0

### June 2026: Long Branch Play Button Missing ✅ FIXED
- **Symptom**: Valid moves rejected on screen when a branch had 3+ tiles (no branch button rendered)
- **Root Cause**: UI grid has 3 slots per direction; overflow layout needed 4 (··· + 2 tiles + button)
- **Solution**: Reduce visible tiles when overflowing; always reserve a slot for the play button
- **Status**: RESOLVED - Fixed in main.js `renderBranchRoute`

### June 2026: main.js Non-JavaScript Corruption ✅ FIXED
- **Symptom**: Game failed to load; `main.js` was ~60 lines with Python syntax (`import sys`, `def init_game():`)
- **Root Cause**: Accidental edit outside git (never committed)
- **Solution**: `git restore main.js`; add SESSION_NOTES.md warning — **JavaScript only, no Python in game source**
- **Status**: RESOLVED - Prevention documented for future sessions

---

## Guidelines for Reporting Issues

Found a bug or blocker? Follow this format:

```
### [Feature/Component]: Brief description

- **Symptom**: What does the player/developer see?
- **Steps to Reproduce**: How to trigger the issue
- **Expected Behavior**: What should happen
- **Actual Behavior**: What actually happens
- **Severity**: Critical | High | Medium | Low
- **Affected Versions**: (if not main branch)
- **Status**: NEW | INVESTIGATING | BLOCKED | RESOLVED
- **Notes**: Additional context, workarounds, etc.
```

---

## Template for New Issues

Copy this when you find something:

```
### [Feature]: Issue title

- **Symptom**: 
- **Steps to Reproduce**: 
- **Expected Behavior**: 
- **Actual Behavior**: 
- **Severity**: 
- **Affected Versions**: 
- **Status**: NEW
- **Notes**: 
```

---

## Reporting Checklist

Before reporting, verify:
- [ ] Issue reproduces consistently
- [ ] Not a one-time fluke
- [ ] Have exact steps to reproduce
- [ ] Tested on at least one other device/browser
- [ ] Checked console for errors (F12)
- [ ] Used "Debug State" button to inspect gameState

---

## Getting Unblocked

If a task is blocking your work:

1. Document it here with all details
2. Mark task as `IN PROGRESS (Your Name, BLOCKED)` in TODO.md
3. Notify the team immediately
4. Another team member can help investigate
5. If blocking multiple people, raise priority

---

## Performance Issues (None Currently)

- No lag detected in 2-player mode
- Rendering completes in <100ms
- Game state is minimal (~2KB)

---

## Mobile Issues ✅ RESOLVED (June 2026)

- [x] Layout breaks on small screens (iPhone mini) — fixed
- [x] Touch targets too small — 48px minimum applied
- [x] Board overflow / off-center spinner — scaling and centering fixed
- [x] Audit tape always visible on mobile — now collapsible toggle

---

## Developer Notes

### JavaScript only — do not mix languages

All game code must stay in **JavaScript** (`.js` files). This project does not use Python. A corrupted `main.js` once contained Python syntax and broke the entire game. Before committing changes to `main.js`, confirm:

- File is ~850 lines (not ~60)
- No `def`, `import sys`, or other non-JS syntax
- `npm run dev` loads the game without console errors

See **SESSION_NOTES.md** for recovery steps (`git restore main.js`).

---

## Known Limitations (By Design)

- **AI is basic** - Makes random valid moves (not strategic)
- **2-player only** - 3+ player modes not implemented yet
- **No persistence** - Game lost on page refresh
- **No animations** - Instant tile placement
- **No sound** - Silent game
- **Scoring audit only** - Audit tape shows scoring math, not a full move-by-move log (see move-history-log task)

These are tracked in Phase 2+ planning.

---

## Testing Blockers

- [ ] No automated tests (manual testing only)
- [ ] No CI/CD pipeline
- [ ] No test coverage tracking
- [ ] Testing requires manual play through

Could be addressed in Phase 3+ if needed.

---

## How to Help

Found and fixed a bug? Excellent! Follow this process:

1. Create a new branch: `fix/yourname-bug-name`
2. Fix the bug in code
3. Test thoroughly
4. Move issue from "Blocker" to "RESOLVED" here with date
5. Commit: `git commit -m "fix: bug description"`
6. Push and notify team

---

**Last Updated**: 2026-06-14  
**Update this file when**: Finding bugs, discovering blockers, or resolving issues
