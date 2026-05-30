# Known Blockers & Issues

Issues discovered during development. Add here when you find bugs or blockers!

---

## Current Blockers

### None at this time ✅

The game is stable and playable after bug fixes in Session 2.

---

## Historical Issues (Resolved)

### Session 2: Branch Tip Mismatch ✅ FIXED
- **Symptom**: Valid moves (6·0 on exposed 0) were rejected
- **Root Cause**: `getBranchTip()` function read tile orientation incorrectly
- **Solution**: Use explicit `outerEdge` field instead of array index
- **Status**: RESOLVED - Fixed in main.js
- **Verified**: Tested with 6·0, 4·0, 0·5 on exposed 0

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

## Mobile Issues (To Be Fixed in Phase 2)

- [ ] Layout breaks on small screens (iPhone mini)
- [ ] Touch targets too small for reliable tapping
- [ ] Board doesn't scroll properly
- [ ] Tiles overflow on narrow screens

These are addressed in Phase 2 tasks.

---

## Known Limitations (By Design)

- **AI is basic** - Makes random valid moves (not strategic)
- **2-player only** - 3+ player modes not implemented yet
- **No persistence** - Game lost on page refresh
- **No animations** - Instant tile placement
- **No sound** - Silent game
- **No mobile layout** - Desktop-first CSS

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

**Last Updated**: 2026-05-30  
**Update this file when**: Finding bugs, discovering blockers, or resolving issues
