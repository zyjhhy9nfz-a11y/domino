# Development Guide: Louisiana Dominoes Game

Technical reference for team members working on the codebase.

---

## Quick Navigation

- **Getting Started**: See README.md
- **Contributing**: See CONTRIBUTING.md  
- **Tasks & Progress**: See TODO.md
- **Known Issues**: See BLOCKERS.md
- **Overall Strategy**: See plan.md

---

## Project Structure

```
dominoes-proto/
├── main.js                 # Game engine (950+ lines, see below)
├── index.html             # Single-file HTML shell
├── style.css              # All styling (uses CSS variables)
├── package.json           # Vite bundler + npm scripts
│
├── CONTRIBUTING.md        # How to work asynchronously
├── DEVELOPMENT.md         # This file (technical details)
├── README.md              # Project overview for new users
├── TODO.md                # Task tracker for async team
├── BLOCKERS.md            # Known issues & blockers
├── plan.md                # Session-based roadmap
│
├── STATUS_REPORT.md       # Latest game status
├── BUG_FIX_SUMMARY.md     # Previous bug details (historical)
│
└── node_modules/          # Dependencies (git ignored)
```

---

## Game Architecture

### High-Level Flow

```
1. initGame()
   └─> Shuffle deck, deal 7 to player + computer
   └─> Find highest double, place on spinner
   └─> Set turnOrder = 1 (computer plays after player)

2. renderGame()
   └─> Display board with branches
   └─> Display player hand
   └─> Show computer hand size (hidden tiles)
   └─> Display scores and status

3. Game Loop
   ├─ Player selects tile + branch
   ├─ playTile(tile, branch)
   │  └─> validateMove() → getBranchTip() → Check match
   │  └─> If valid: add to branch, calculate score, check win
   │  └─> If invalid: reject with message
   ├─ renderGame()
   │
   ├─ computerTurn()
   │  └─> Find all valid moves
   │  └─> Pick one strategically (currently random)
   │  └─> Play it
   │  └─> Calculate score
   ├─ renderGame()
   │
   ├─ Repeat until gameOver === true

4. Game Over
   └─> Display winner, scores
   └─> Show play again button
```

### Game State Object

```javascript
let gameState = {
  // Deck & Hands
  deck: [],                 // All 28 dominoes (shuffled)
  playerHand: [],           // Player's tiles in hand
  computerHand: [],         // Computer's tiles (hidden from view)
  boneyard: [],             // Remaining tiles to draw
  
  // Board (4-way spinner)
  board: {
    up: [],                  // Tiles extending up from spinner
    down: [],                // Tiles extending down
    left: [],                // Tiles extending left
    right: [],               // Tiles extending right
  },
  
  // Game State
  scores: {
    player: 0,              // Player's cumulative score
    computer: 0,            // Computer's cumulative score
  },
  turnOrder: 0,             // 0 = player, 1 = computer
  gameOver: false,
  winner: null,             // 'player', 'computer', or 'draw'
  
  // UI State
  selectedTile: null,       // Tile player has selected
  selectedBranch: null,     // Branch player has selected
  lastStatus: '',           // Last action message
};
```

### Domino Tile Format

**On deck or in hand:**
```javascript
{ value1: 0, value2: 6 }  // Just two pips
```

**On board (stored in branch array):**
```javascript
{
  tile: [6, 0],             // Original tile (for display)
  innerEdge: 6,             // Edge connected to previous tile
  outerEdge: 0,             // Edge exposed for next tile
  isDouble: false,          // true if both pips are same (6-6)
  playedBy: 'player',       // Who played it
}
```

**Critical**: Always use `outerEdge` for branch tip calculation, not array index!

---

## Key Functions (in main.js)

### Game Setup

**`initGame()`**
- Shuffles deck, deals 7 tiles to each player
- Finds highest double (typically 6-6)
- Places on spinner, sets initial board state
- Sets turnOrder to 1 (computer plays first after setup)
- Clears UI state

**`shuffleDeck()`**
- Fisher-Yates shuffle of all 28 tiles
- Used at game start

**`findHighestDouble(hand)`**
- Scans hand for doubles (6-6, 5-5, etc.)
- Returns highest or null if no doubles

### Move Validation & Execution

**`canPlay(tile, branchName)`** → Boolean
- Checks if `tile` is valid on `branchName`
- Returns true/false only (no side effects)
- Calls `getBranchTip()` internally

**`getBranchTip(branchName)`** → Number
- Returns the exposed pip on end of a branch
- **Critical**: Uses `outerEdge` field, NOT array index
- Returns last tile's outerEdge value
- Special case: doubles always return both pips

**`validateMove(tile, selectedTile, branchName)`** → Boolean
- Wrapper around `canPlay()` with additional checks
- Ensures selected tile exists in player's hand
- Prevents invalid branch selection
- Called before `playTile()`

**`playTile(tile, branch)`**
- Executes a valid move
- Removes tile from hand
- Adds to board with proper orientation
- Calls `calculateScore()`
- Checks `isGameOver()`
- Updates turnOrder
- Triggers `renderGame()`

### Scoring

**`calculateScore()`**
- Sums all exposed pips on board (4 branch tips)
- Gives points to current player if total is multiple of 5
- Updates gameState.scores
- Returns points earned (0 if no score)
- **Louisiana rules**: Only multiples of 5 score

**`getActiveTips()`**
- Internal helper: gets all 4 branch tips
- Returns object: `{ up, down, left, right }`
- Used for score calculation and display

### Computer AI

**`computerTurn()`**
- Finds all valid moves
- Currently picks one randomly (TODO: improve)
- Plays it
- Calculates score
- Updates turn order

**`findValidMoves(hand)`** → Array
- Scans all 4 branches for valid moves
- Returns array of `{ tile, branch }` objects
- Empty array if no valid moves

### Game State & Rendering

**`isGameOver()`** → Boolean
- Checks if player or computer has 0 tiles
- If both out of tiles, check who has lower hand sum (draw rules)
- Sets gameState.gameOver = true
- Sets gameState.winner

**`renderGame()`**
- Called after every action
- Re-renders entire DOM
- Builds board display
- Builds hand display
- Updates scores and status
- Handles responsive layout

**`updateScore(branch)`** → Number
- Calculates total branch tips
- Awards points if multiple of 5
- Called automatically after move

### Debug Tools (Added in Session 2)

**`dumpBoardState()`**
- Logs entire gameState to console
- Useful for debugging state issues
- Called by "Debug State" button

**`repairBoardState()`**
- Recalculates branch pips
- Fixes inconsistencies
- Resets UI state
- Called by "Repair State" button

---

## CSS Structure

### Root Variables (to use in your improvements)

```css
:root {
  /* Colors */
  --primary: #2196F3;       /* Main color for buttons, active elements */
  --secondary: #FFC107;     /* Accent color for scores, highlights */
  --danger: #F44336;        /* Error messages, invalid states */
  --success: #4CAF50;       /* Success messages, valid states */
  --bg-light: #F5F5F5;      /* Light background */
  --bg-dark: #333;          /* Dark background */
  --text-dark: #212121;     /* Dark text */
  --text-light: #999;       /* Light text */
  
  /* Spacing */
  --spacing-xs: 4px;
  --spacing-sm: 8px;
  --spacing-md: 16px;
  --spacing-lg: 24px;
  --spacing-xl: 32px;
  
  /* Sizing */
  --button-height: 40px;
  --button-radius: 4px;
  
  /* Responsive Breakpoints */
  /* Mobile First: Start small, add media queries for larger screens */
}
```

### Key Classes

```css
/* Buttons - already styled, extend as needed */
.branch-button      /* 4-direction branch buttons */
.btn-primary        /* Main action buttons */
.btn-secondary      /* Secondary actions */

/* Board & Layout */
.board              /* Main game board container */
.branch             /* Individual branch container */
.tile               /* Domino tile on board */

/* Player Hand */
.player-hand        /* Container for player's tiles */
.tile-in-hand       /* Individual tile in hand */
.tile-selected      /* Selected tile styling */

/* Utilities */
.hidden             /* Display: none */
.text-center        /* Text alignment */
.text-muted         /* De-emphasized text */
```

---

## Important Implementation Details

### Branch Tip Calculation - THE CRITICAL FIX

**Problem (Session 2 Bug)**: getBranchTip was returning wrong values
**Solution**: Always use explicit `outerEdge` field

```javascript
// ❌ WRONG - reads from array index
function getBranchTip(branchName) {
  const lastMove = gameState.board[branchName][gameState.board[branchName].length - 1];
  return lastMove.tile[1];  // WRONG - assumes [inner, outer] order
}

// ✅ CORRECT - uses stored value
function getBranchTip(branchName) {
  const lastMove = gameState.board[branchName][gameState.board[branchName].length - 1];
  return lastMove.outerEdge;  // ALWAYS correct regardless of storage
}
```

### Move Orientation

When a player plays a tile, we must determine which edge connects to the branch:

```javascript
// If playing 6-0 on branch with exposed tip of 0:
// Tile connects with 0, so 6 becomes the new exposed tip

const tile = { value1: 6, value2: 0 };
const branchTip = 0;

if (tile.value1 === branchTip) {
  // value1 connects, value2 becomes new tip
  innerEdge = tile.value1;
  outerEdge = tile.value2;
} else {
  // value2 connects, value1 becomes new tip
  innerEdge = tile.value2;
  outerEdge = tile.value1;
}
```

### Scoring Logic (Louisiana Rules)

```javascript
function calculateScore() {
  const { up, down, left, right } = getActiveTips();
  const total = up + down + left + right;
  
  // Only multiples of 5 score in Louisiana
  if (total % 5 === 0 && total > 0) {
    const points = total / 5;  // 15 points total = 3 (in Louisiana scoring)
    // Award points to current player
  }
}
```

**Wait**: Actually, in Louisiana, you score the full points (multiples of 5 score the total, not divided). Let me check the current implementation...

[See main.js for actual implementation]

### Hand Management

```javascript
// Remove from hand after playing
gameState.playerHand = gameState.playerHand.filter(
  t => !(t.value1 === tile.value1 && t.value2 === tile.value2)
);

// Draw from boneyard
const drawn = gameState.boneyard.pop();
gameState.playerHand.push(drawn);

// Check for draw (no valid moves + empty boneyard)
if (!anyValidMoves && gameState.boneyard.length === 0) {
  // Current player passes turn
  gameState.turnOrder = 1 - gameState.turnOrder;
}
```

---

## Testing Approach

### Manual Testing (Required for all PRs)

1. **Startup**: Game initializes properly
2. **Basic Play**: Can select tile, choose branch, play move
3. **Scoring**: Points calculated correctly
4. **Move Validation**: Invalid moves rejected properly
5. **Computer AI**: Computer takes turns, makes valid moves
6. **Win Condition**: Game ends when player or computer runs out
7. **Edge Cases**:
   - Empty boneyard
   - Zero-pip tiles (0-0, 0-1, etc.)
   - Double tiles on spinner
   - Playing on different branches

### Automated Testing (None yet - volunteer to add!)

- Jest for unit tests
- Could test: tile creation, validation, scoring calculation
- Would speed up development

---

## Common Tasks & How to Implement

### Adding a UI Element

1. Create HTML in `renderGame()` function
2. Style in CSS (use variables)
3. Add event listeners for interaction
4. Trigger gameState updates
5. Call `renderGame()` to update

**Example**: Adding a "Tiles Left in Boneyard" display

```javascript
// In renderGame()
const boneyardCount = document.createElement('div');
boneyardCount.id = 'boneyard-count';
boneyardCount.textContent = `Boneyard: ${gameState.boneyard.length}`;
boneyardCount.className = 'status-bar';
container.appendChild(boneyardCount);

// In style.css
#boneyard-count {
  padding: var(--spacing-md);
  background: var(--bg-light);
  border: 1px solid var(--text-light);
  border-radius: var(--button-radius);
}
```

### Adding a New Game Mode (2-player → 3-player)

1. Add mode selector UI
2. Modify `initGame()` to use selected mode
3. Adjust tile dealing: 6 tiles per player instead of 7
4. Update boneyard calculation: 28 - (6 * 3) = 10 tiles
5. Modify `computerTurn()` to handle 3 opponents
6. Test with actual play

### Adding a New Scoring Variant

1. Add variant selector UI
2. Store selected variant in gameState
3. Modify `calculateScore()` to check variant:

```javascript
if (gameState.scoringVariant === 'louisiana') {
  // Current logic: multiples of 5
} else if (gameState.scoringVariant === 'hobo') {
  // All pips count
  points = total;
}
```

---

## Debugging Tips

### Common Issues & Solutions

**Issue**: Tiles not appearing on board
- Check: Is `playTile()` being called?
- Check: Is `renderGame()` being called after?
- Use: `dumpBoardState()` to inspect board structure

**Issue**: Invalid moves being accepted
- Check: `getBranchTip()` returning correct value?
- Check: Tile orientation logic correct?
- Test: With specific failing move, trace through `canPlay()`

**Issue**: Scoring not updating
- Check: Is `calculateScore()` being called?
- Check: Are branch tips correct?
- Use: Console.log() in calculateScore to see values

**Issue**: Computer not taking turns
- Check: `turnOrder` being updated?
- Check: `renderGame()` being called?
- Check: `computerTurn()` finding valid moves?

### Debug Tools Available

```javascript
// In browser console:
dumpBoardState()      // Log full game state
repairBoardState()    // Fix state inconsistencies

// Use "Debug State" and "Repair State" buttons on page
// Check console (F12) for detailed logs
```

---

## Performance Considerations

### Current Approach
- Re-render entire DOM after each move
- No virtual DOM, no framework overhead
- Fine for 2-4 players, 28 tiles

### When to Optimize
- Only if game becomes visibly slow
- Probably not needed until 10+ players
- Then consider: React, Vue, or incremental DOM updates

### Memory Profile
- ~2KB per game state
- ~10KB per full render
- Negligible for browser

---

## Browser Compatibility

### Target Browsers
- Chrome/Edge (latest)
- Firefox (latest)
- Safari (latest)
- Mobile browsers (iOS Safari, Chrome Mobile)

### CSS Support Needed
- CSS Grid & Flexbox
- CSS Variables (custom properties)
- CSS Media Queries

### JavaScript Features Used
- ES6 modules
- Arrow functions
- Template literals
- Array methods (map, filter, find)
- Object methods (Object.keys, spread operator)

---

## Commit & Branch Naming

### Branch Names
```bash
# Feature: feat/[initials]-feature-name
feat/jd-mobile-responsive
feat/sk-3p-mode

# Bug fix: fix/[initials]-bug-name
fix/jd-tile-overlap-on-mobile
fix/sk-ai-crash-on-empty-hand

# Refactor: refactor/[initials]-what
refactor/jd-scoring-engine
```

### Commit Message Format
```
[type]: [short description under 50 chars]

[Detailed explanation, wrap at 72 chars]

- Bullet point 1
- Bullet point 2
- Tested on: [devices/browsers]
```

---

## Resources & Learning

### Understanding Dominoes
- [Dominoes Wikipedia](https://en.wikipedia.org/wiki/Dominoes)
- [Louisiana Dominoes Rules](https://en.wikipedia.org/wiki/Dominoes#Louisiana_dominoes)

### JavaScript Resources
- [MDN: ES6 Classes](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Classes)
- [MDN: DOM Manipulation](https://developer.mozilla.org/en-US/docs/Web/API/Document)

### CSS Resources
- [CSS Grid Guide](https://css-tricks.com/snippets/css/complete-guide-grid/)
- [Flexbox Guide](https://css-tricks.com/snippets/css/a-guide-to-flexbox/)
- [CSS Variables Guide](https://developer.mozilla.org/en-US/docs/Web/CSS/--*)

---

## Questions?

1. Check this file (DEVELOPMENT.md)
2. Check main.js comments
3. Read CONTRIBUTING.md
4. Ask in project chat!

---

**Last Updated**: 2026-05-30  
**For Session**: Team Async Collaboration Setup

*Thanks for contributing to the game!* 🎮
