# Louisiana Dominoes Game - Task Tracker

**Status**: 🟢 Core game complete, ready for team development  
**Last Updated**: 2026-05-30

---

## How to Use This File

1. Find a task with status `AVAILABLE`
2. Create a feature branch: `git checkout -b feat/yourname-task-name`
3. Change `AVAILABLE` to `IN PROGRESS (Your Name)`
4. Do the work and test thoroughly
5. Change to `DONE (Your Name, Date)` and commit
6. Push to shared repo and notify team

See **CONTRIBUTING.md** for detailed workflow instructions.

---

## Phase 1: Foundation & Core Mechanics ✅ COMPLETE

- [x] **DONE** (Previous Session) | game-engine
  - Core game logic, deal system, move validation
  - Feature branch: (integrated to main)

- [x] **DONE** (Session 2) | bug-fix-branch-tips
  - Fixed getBranchTip() tile orientation mismatch
  - Verified with test cases (6·0, 4·0, 0·5 on exposed 0)
  - Feature branch: (integrated to main)

- [x] **DONE** (Previous Session) | basic-ui
  - Board display, player hand, branch buttons, score tracking
  - Feature branch: (integrated to main)

---

## Phase 2: Polish & Usability (CURRENT FOCUS)

These tasks have the highest impact on user experience. Start here!

### Visual & Layout Improvements

- [ ] **AVAILABLE** | mobile-responsive
  - Make game responsive for iPhone mini (375px portrait)
  - Redesign flex layout to work on small screens
  - Touch-friendly tap targets (48x48px minimum for buttons)
  - Test on: iPhone 12 mini, iPad, desktop
  - **Blocked by**: (none)
  - **Branch name**: `feat/[initials]-mobile-responsive`

- [ ] **AVAILABLE** | tile-visual-polish
  - Improve tile styling with pip details
  - Add colors and 3D effects for tiles on board
  - Better contrast for visibility
  - Test on: multiple screen sizes, different lighting
  - **Blocked by**: (none)
  - **Branch name**: `feat/[initials]-tile-visual-polish`

- [ ] **AVAILABLE** | animation-tile-placement
  - Add smooth animation when tiles are played to board
  - Animate branch expansion when tile placed
  - Keep animations fast (<300ms)
  - **Blocked by**: (none)
  - **Branch name**: `feat/[initials]-animation-tiles`

### Game Feedback Improvements

- [ ] **AVAILABLE** | score-announcement
  - Announce points scored in real time ("You score 15 points!")
  - Show score pop-up when points earned
  - Clear when branching doesn't score
  - **Blocked by**: (none)
  - **Branch name**: `feat/[initials]-score-announce`

- [ ] **AVAILABLE** | invalid-move-feedback
  - Show why a move was rejected (branch full, tile no match, etc.)
  - Display error message clearly instead of silent rejection
  - Help player understand valid moves
  - **Blocked by**: (none)
  - **Branch name**: `feat/[initials]-move-feedback`

- [ ] **AVAILABLE** | turn-indicator
  - Visual indication of whose turn it is (player or computer)
  - Highlight current player
  - Show when computer is thinking
  - **Blocked by**: (none)
  - **Branch name**: `feat/[initials]-turn-indicator`

- [ ] **AVAILABLE** | boneyard-display
  - Show how many tiles remain in boneyard
  - Display it near the draw button
  - Update as tiles are drawn
  - **Blocked by**: (none)
  - **Branch name**: `feat/[initials]-boneyard-count`

### Game Flow Improvements

- [ ] **AVAILABLE** | game-summary-screen
  - Game over screen with final scores
  - Winner announcement with celebration
  - "Play Again" button to restart
  - Show game stats (turns played, max score, etc.)
  - **Blocked by**: (none)
  - **Branch name**: `feat/[initials]-game-summary`

- [ ] **AVAILABLE** | move-history-log
  - Display history of moves made in current game
  - Show move format: "Player plays 6-0 on up branch"
  - Scrollable log or collapsible section
  - Include who scored and when
  - **Blocked by**: (none)
  - **Branch name**: `feat/[initials]-move-history`

---

## Phase 3: Game Variants & Features (COMING SOON)

These add game variety and increase replayability.

### Multi-Player Modes

- [ ] **AVAILABLE** | two-player-polish
  - Polish 2-player mode thoroughly
  - Test edge cases (all tiles drawn, hand empty, etc.)
  - Ensure no bugs in game flow
  - **Blocked by**: (Phase 2 completion)
  - **Branch name**: `feat/[initials]-2p-polish`

- [ ] **AVAILABLE** | three-player-mode
  - Deal 6 tiles per player instead of 7
  - Update AI logic for 3 computer opponents
  - Adjust boneyard size calculation
  - Test fairness across 3 players
  - **Blocked by**: two-player-polish
  - **Branch name**: `feat/[initials]-3p-mode`

- [ ] **AVAILABLE** | four-player-mode
  - Deal 6 tiles per player
  - Support partner gameplay (optional)
  - AI for 3 computer opponents
  - Test on all screen sizes with 4 hands visible
  - **Blocked by**: three-player-mode
  - **Branch name**: `feat/[initials]-4p-mode`

### Scoring Variants

- [ ] **AVAILABLE** | hobo-scoring
  - Implement hobo scoring variant (all pips count)
  - Add scoring mode selector (Louisiana vs Hobo)
  - Update scoring display for variant
  - Test calculations match expected rules
  - **Blocked by**: (Phase 2 completion)
  - **Branch name**: `feat/[initials]-hobo-scoring`

- [ ] **AVAILABLE** | house-rules
  - Options for double-six-only starting rule
  - Custom pip values (if desired)
  - House rules selector in UI
  - Document each rule option
  - **Blocked by**: (Phase 2 completion)
  - **Branch name**: `feat/[initials]-house-rules`

### AI Difficulty Levels

- [ ] **AVAILABLE** | ai-difficulty-selector
  - Add UI to choose AI difficulty (Easy/Normal/Hard)
  - Store selection for current game
  - Prepare for difficulty-specific AI implementation
  - **Blocked by**: (Phase 2 completion)
  - **Branch name**: `feat/[initials]-ai-selector`

- [ ] **AVAILABLE** | ai-easy-mode
  - Computer makes random valid moves
  - No strategy or planning
  - Should be beatable easily
  - **Blocked by**: ai-difficulty-selector
  - **Branch name**: `feat/[initials]-ai-easy`

- [ ] **AVAILABLE** | ai-normal-mode
  - Computer tries to score when possible
  - Blocks opponent scoring moves
  - Strategic tile placement
  - Should be reasonable challenge
  - **Blocked by**: ai-difficulty-selector
  - **Branch name**: `feat/[initials]-ai-normal`

- [ ] **AVAILABLE** | ai-hard-mode
  - Lookahead algorithm (plan 2-3 moves ahead)
  - Risk assessment for each move
  - Optimal play strategy
  - Should be very challenging
  - **Blocked by**: ai-difficulty-selector
  - **Branch name**: `feat/[initials]-ai-hard`

---

## Phase 4: Persistence & Features (FUTURE)

These are lower priority but add polish and engagement.

### Data & Profiles

- [ ] **AVAILABLE** | game-history-database
  - Store past games in localStorage
  - Retrieve and display game history
  - Show win/loss stats over time
  - **Blocked by**: (Phase 2 completion)
  - **Branch name**: `feat/[initials]-game-history`

- [ ] **AVAILABLE** | player-profiles
  - Let players set their name/username
  - Store player stats (games played, wins, favorite mode)
  - Show stats after each game
  - **Blocked by**: (Phase 2 completion)
  - **Branch name**: `feat/[initials]-player-profiles`

- [ ] **AVAILABLE** | localstorage-persistence
  - Auto-save game state to localStorage
  - Recover game on page refresh
  - Prompt to resume or start new
  - **Blocked by**: (Phase 2 completion)
  - **Branch name**: `feat/[initials]-autosave`

- [ ] **AVAILABLE** | game-replay-system
  - Replay past games move by move
  - Speed controls (slow/normal/fast)
  - Review specific games from history
  - **Blocked by**: game-history-database, move-history-log
  - **Branch name**: `feat/[initials]-replay`

### Advanced Features

- [ ] **AVAILABLE** | push-notifications
  - Notify when it's your turn
  - Notify when game is finished
  - Browser notification permission handling
  - **Blocked by**: (Phase 2 completion)
  - **Branch name**: `feat/[initials]-notifications`

- [ ] **AVAILABLE** | network-multiplayer
  - Play against other players online
  - Requires backend/server setup
  - Real-time move synchronization
  - **Blocked by**: player-profiles, all Phase 3 modes
  - **Branch name**: `feat/[initials]-multiplayer`
  - **Note**: This is a large project, may need separate planning

- [ ] **AVAILABLE** | elo-rating-system
  - Track player skill rating across games
  - Matchmaking based on rating
  - Leaderboard display
  - **Blocked by**: player-profiles, network-multiplayer
  - **Branch name**: `feat/[initials]-elo`

---

## Bugs & Known Issues

Found a bug? Add it here!

- **None currently known** ✅

Check **BLOCKERS.md** for blockers and what's preventing progress.

---

## In Progress

Currently being worked on:

- **None** (All team members available for new tasks)

---

## Recently Completed

Tasks finished in the last session(s):

- ✅ **game-engine** — Core gameplay mechanics
- ✅ **bug-fix-branch-tips** — Fixed move validation
- ✅ **basic-ui** — Initial board and hand display
- ✅ **plan-roadmap** — Development plan created

---

## Notes for Team

### Starting Your First Task?
1. Pick a task from Phase 2 (highest priority)
2. Read CONTRIBUTING.md first (takes 10 minutes)
3. Ask questions before starting if unclear
4. Remember: async communication takes time, over-document!

### Picked a Task?
1. Create your feature branch now
2. Update this file (mark as IN PROGRESS)
3. Commit: `git commit -m "claim: task-name"`
4. Push: `git push origin feat/yourname-taskname`
5. **Post a message to notify team** (Slack, Discord, email, etc.)

### Testing Guidelines
- Test on multiple screen sizes (mobile, tablet, desktop)
- Test in different browsers (Chrome, Firefox, Safari)
- Play multiple games to verify nothing broke
- Check console for errors (F12)
- Test edge cases

### Stuck?
1. Update this file: `IN PROGRESS (Your Name, BLOCKED)`
2. Document issue in BLOCKERS.md with details
3. Notify team
4. Someone will help unblock you

---

## Statistics

| Metric | Count |
|--------|-------|
| Total Tasks | 31 |
| Completed | 3 |
| In Progress | 0 |
| Available | 28 |
| Phase 2 Priority | 9 |

---

**Next Team Member**: Start with Phase 2! Mobile responsiveness is the #1 blocker for making the game usable. Thanks for your help! 🚀

---

*Last updated: 2026-05-30 by AI Session*  
*Update this file every time you claim, start, or complete a task*
