// --- 1. Define the 28 Standard Domino Tiles ---
const FULL_DECK = [
  [6,6], [6,5], [6,4], [6,3], [6,2], [6,1], [6,0],
  [5,5], [5,4], [5,3], [5,2], [5,1], [5,0],
  [4,4], [4,3], [4,2], [4,1], [4,0],
  [3,3], [3,2], [3,1], [3,0],
  [2,2], [2,1], [2,0],
  [1,1], [1,0],
  [0,0]
];

// --- 1b. User settings (persisted) ---
const SETTINGS_STORAGE_KEY = "houseDominoesSettings";
const DEFAULT_SETTINGS = {
  pipStyle: "black",
  rulesMode: "house",
  displayMode: "pips",
  gameTarget: 150,
};

const GAME_TARGET_OPTIONS = [100, 150, 200, 250, 300];

const PIP_COLORS = {
  1: "#87CEEB",
  2: "#228B22",
  3: "#CC0000",
  4: "#C71585",
  5: "#000080",
  6: "#FFD700",
};

const PIP_WORDS = ["blank", "one", "two", "three", "four", "five", "six"];

// Pip positions on a 3×3 grid (row, col) — standard domino layouts
const PIP_LAYOUTS = {
  0: [],
  1: [[1, 1]],
  2: [[0, 0], [2, 2]],
  3: [[0, 0], [1, 1], [2, 2]],
  4: [[0, 0], [0, 2], [2, 0], [2, 2]],
  5: [[0, 0], [0, 2], [1, 1], [2, 0], [2, 2]],
  6: [[0, 0], [0, 2], [1, 0], [1, 2], [2, 0], [2, 2]],
};

function loadSettings() {
  try {
    const raw = localStorage.getItem(SETTINGS_STORAGE_KEY);
    if (!raw) return { ...DEFAULT_SETTINGS };
    const parsed = { ...DEFAULT_SETTINGS, ...JSON.parse(raw) };
    parsed.gameTarget = Number(parsed.gameTarget);
    if (!GAME_TARGET_OPTIONS.includes(parsed.gameTarget)) {
      parsed.gameTarget = DEFAULT_SETTINGS.gameTarget;
    }
    return parsed;
  } catch {
    return { ...DEFAULT_SETTINGS };
  }
}

function saveSettings() {
  localStorage.setItem(SETTINGS_STORAGE_KEY, JSON.stringify(gameSettings));
}

function pipWord(value) {
  return PIP_WORDS[value] ?? String(value);
}

function tileAriaLabel(top, bottom) {
  if (top === bottom) {
    return top === 0 ? "Double blank domino" : `Double ${pipWord(top)} domino`;
  }
  return `${pipWord(top)}-${pipWord(bottom)} domino`;
}

function shouldUseNumerals() {
  if (gameSettings.displayMode === "numerals") return true;
  if (gameSettings.displayMode === "pips") return false;
  return typeof window !== "undefined" && window.matchMedia("(max-width: 480px)").matches;
}

function getPipColor(value) {
  if (value === 0) return "transparent";
  if (gameSettings.pipStyle === "color") return PIP_COLORS[value] ?? "#1a1a1a";
  return "#1a1a1a";
}

function createPipHalf(value) {
  const half = document.createElement("div");
  half.className = "domino-half";
  half.setAttribute("aria-hidden", "true");

  const grid = document.createElement("div");
  grid.className = "domino-pip-grid";
  (PIP_LAYOUTS[value] ?? []).forEach(([row, col]) => {
    const pip = document.createElement("span");
    pip.className = "domino-pip";
    pip.style.gridRow = String(row + 1);
    pip.style.gridColumn = String(col + 1);
    pip.style.backgroundColor = getPipColor(value);
    grid.appendChild(pip);
  });
  half.appendChild(grid);
  return half;
}

function createNumeralHalf(value) {
  const half = document.createElement("div");
  half.className = "domino-half domino-half--numeral";
  half.textContent = String(value);
  half.setAttribute("aria-hidden", "true");
  return half;
}

/**
 * Build a domino tile face (or ivory back). Fallback tile size: 28×56px portrait
 * (see --domino-w / --domino-h in style.css; alt 56×112 documented there).
 */
function createDominoTile(top, bottom, options = {}) {
  const {
    faceDown = false,
    horizontal = false,
    settled = false,
    selected = false,
    disabled = false,
    peek = false,
    tag = "div",
    className = "",
    onClick = null,
    title = null,
    ariaLabel = null,
  } = options;

  const el = document.createElement(tag);
  el.className = ["domino-tile", className].filter(Boolean).join(" ");
  if (faceDown) el.classList.add("domino-tile--face-down");
  if (horizontal) el.classList.add("domino-tile--horizontal");
  if (settled) el.classList.add("domino-tile--settled");
  if (selected) el.classList.add("domino-tile--selected");
  if (disabled) el.classList.add("domino-tile--disabled");
  if (peek) el.classList.add("domino-tile--peek");

  const label = ariaLabel ?? (faceDown ? "Face-down domino" : tileAriaLabel(top, bottom));
  el.setAttribute("aria-label", label);
  if (title) el.title = title;

  if (faceDown) {
    if (onClick && tag === "button") {
      el.onclick = onClick;
      el.type = "button";
    }
    if (disabled && tag === "button") el.disabled = true;
    return el;
  }

  const useNumerals = shouldUseNumerals();
  if (useNumerals) el.classList.add("domino-tile--numerals");

  const face = document.createElement("div");
  face.className = "domino-face";
  face.setAttribute("aria-hidden", "true");

  const topHalf = useNumerals ? createNumeralHalf(top) : createPipHalf(top);
  const bottomHalf = useNumerals ? createNumeralHalf(bottom) : createPipHalf(bottom);
  face.appendChild(topHalf);
  face.appendChild(bottomHalf);
  el.appendChild(face);

  if (onClick && tag === "button") {
    el.type = "button";
    el.onclick = onClick;
  }
  if (disabled && tag === "button") el.disabled = true;

  return el;
}

function isHorizontalBranch(branchName) {
  return branchName === "left" || branchName === "right";
}

/** Doubles play perpendicular to the branch; singles follow the branch axis. */
function boardTileHorizontal(branchName, isDouble) {
  return isHorizontalBranch(branchName) !== isDouble;
}

function applyChainLinkSize(linkEl, branchName, isDouble) {
  const horizontal = boardTileHorizontal(branchName, isDouble);
  if (isHorizontalBranch(branchName)) {
    linkEl.style.width = horizontal ? "var(--domino-h)" : "var(--domino-w)";
    linkEl.style.flexShrink = "0";
  } else {
    linkEl.style.height = horizontal ? "var(--domino-w)" : "var(--domino-h)";
    linkEl.style.flexShrink = "0";
  }
}

const MAX_VISIBLE_PER_BRANCH = 2;
const MAX_VISIBLE_OPEN_END = 2;
const MAX_HOBO_LINE_PER_SIDE = MAX_VISIBLE_PER_BRANCH;
const BRANCH_ARROWS = { up: "▲", down: "▼", left: "◄", right: "►" };
const HOBO_CENTER = "hobo:center";
const HOBO_LINE_LEFT = "hobo:line-left";
const HOBO_LINE_RIGHT = "hobo:line-right";
const BRANCH_NAMES = ["left", "right", "up", "down"];

function moveToTileValues(move, branchName) {
  const [inner, outer] = move.tile;
  if (branchName === "left" || branchName === "up") {
    return [outer, inner];
  }
  return [inner, outer];
}

function isHouseRules() {
  return gameSettings.rulesMode === "house";
}

function isHoboRules() {
  return gameSettings.rulesMode === "hobo";
}

function isHoboLinePhase() {
  return isHoboRules() && hoboCenterLineActive;
}

function shouldRenderHoboLineBoard() {
  return isHoboRules() && hoboCenterLineActive;
}

function activateHoboSpinnerBoard(spinnerVal) {
  hoboCenterLineActive = false;
  hoboLine = [];
  board.branches = { left: [], right: [], up: [], down: [] };
  board.spinner = [spinnerVal, spinnerVal];
}

function isHoboPlayTarget(target) {
  return target === HOBO_CENTER || target === HOBO_LINE_LEFT || target === HOBO_LINE_RIGHT;
}

function getHoboLineLeftTip() {
  return hoboLine.length > 0 ? hoboLine[0].leftEnd : null;
}

function getHoboLineRightTip() {
  return hoboLine.length > 0 ? hoboLine[hoboLine.length - 1].rightEnd : null;
}

function getActivePlayTargets() {
  if (isHouseRules()) {
    return BRANCH_NAMES.filter((name) => shouldShowBranchPlaySlot(name));
  }
  if (board.spinner) {
    return BRANCH_NAMES;
  }
  if (hoboLine.length === 0) {
    return [HOBO_CENTER];
  }
  return [HOBO_LINE_LEFT, HOBO_LINE_RIGHT];
}

function shouldShowBranchPlaySlot(branchName) {
  return isHouseRules() || board.spinner != null;
}

function snapshotBoardState() {
  return {
    spinner: board.spinner,
    branches: {
      left: board.branches.left.map((m) => ({ ...m, tile: [...m.tile] })),
      right: board.branches.right.map((m) => ({ ...m, tile: [...m.tile] })),
      up: board.branches.up.map((m) => ({ ...m, tile: [...m.tile] })),
      down: board.branches.down.map((m) => ({ ...m, tile: [...m.tile] })),
    },
    hoboLine: hoboLine.map((entry) => ({ ...entry, tile: [...entry.tile] })),
    hoboCenterLineActive,
  };
}

function restoreBoardState(snap) {
  board.spinner = snap.spinner;
  board.branches = snap.branches;
  hoboLine = snap.hoboLine;
  hoboCenterLineActive = snap.hoboCenterLineActive;
}

function getGameTarget() {
  return gameSettings.gameTarget ?? 150;
}

function applyScore(who, points) {
  if (points > 0) {
    if (who === "player") playerScore += points;
    else computerScore += points;
  }
  return checkMatchWin();
}

function checkMatchWin() {
  if (isMatchOver) return true;

  const target = getGameTarget();
  const playerReached = playerScore >= target;
  const computerReached = computerScore >= target;
  if (!playerReached && !computerReached) return false;

  isMatchOver = true;
  isGameOver = true;

  if (playerReached && computerReached) {
    if (playerScore > computerScore) {
      gameLog = `🏆 You win the game! ${playerScore}–${computerScore} (played to ${target})`;
      paperTapeHistory.unshift(`[GAME OVER] Player wins the game ${playerScore}–${computerScore}.`);
    } else if (computerScore > playerScore) {
      gameLog = `Game over — computer wins ${computerScore}–${playerScore} (played to ${target}).`;
      paperTapeHistory.unshift(`[GAME OVER] Computer wins the game ${computerScore}–${playerScore}.`);
    } else {
      gameLog = `Game tied at ${playerScore} (target ${target}).`;
      paperTapeHistory.unshift(`[GAME OVER] Match tied at ${playerScore}.`);
    }
  } else if (playerReached) {
    gameLog = `🏆 You win the game! ${playerScore}–${computerScore} (played to ${target})`;
    paperTapeHistory.unshift(`[GAME OVER] Player wins the game ${playerScore}–${computerScore}.`);
  } else {
    gameLog = `Game over — computer wins ${computerScore}–${playerScore} (played to ${target}).`;
    paperTapeHistory.unshift(`[GAME OVER] Computer wins the game ${computerScore}–${playerScore}.`);
  }
  return true;
}

function roundSweepPips(pips) {
  if (isHouseRules()) {
    return Math.floor(pips / 5) * 5;
  }
  return pips === 0 ? 0 : Math.ceil(pips / 5) * 5;
}

// --- 2. Game State Variables ---
let boneyard = [];
let playerHand = [];
let computerHand = [];
let playerScore = 0;
let computerScore = 0;
let isPlayerTurn = true; 
let isGameOver = false;
let isMatchOver = false;
let board = {
  spinner: null, 
  branches: { left: [], right: [], up: [], down: [] }
};
let gameLog = "";
let selectedTileIndex = null;
let selectedBoneyardIndex = null;
let feedbackToast = null;
let feedbackToastTimer = null;
let moveFeedbackIsError = false;
let gameSettings = loadSettings();
let settingsPanelOpen = false;
let lastRoundWinner = null;
let lastRoundBlocked = false;
let nextRoundOpener = null;
let hoboLine = [];
let hoboCenterLineActive = true;

// --- Diagnostic Variables ---
let liveCalculationText = "No tiles played yet.";
let paperTapeHistory = [];
let auditTapeOpen = typeof window !== "undefined" && !window.matchMedia("(max-width: 768px)").matches;

// --- 3. Shuffle Algorithm ---
function shuffleBoneyard() {
  boneyard = [...FULL_DECK];
  for (let i = boneyard.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [boneyard[i], boneyard[j]] = [boneyard[j], boneyard[i]];
  }
}

// --- 4. Deal the Hands ---
function dealHands() {
  playerHand = [];
  computerHand = [];
  for (let i = 0; i < 7; i++) {
    playerHand.push(boneyard.pop());
    computerHand.push(boneyard.pop());
  }
}

// --- 5. Game start (House vs Hobo) ---
function countBranchesWithTiles() {
  return ["left", "right", "up", "down"].filter((name) => board.branches[name].length > 0).length;
}

function boardHasAnyTiles() {
  return hoboLine.length > 0 || board.spinner != null || countBranchesWithTiles() > 0;
}

function handleHouseAutomaticStart() {
  if (lastRoundBlocked) {
    startRoundAfterBlocked();
    return;
  }

  let highestDouble = -1;
  let starter = null;
  let targetIndex = -1;

  playerHand.forEach((tile, index) => {
    if (tile[0] === tile[1] && tile[0] > highestDouble) {
      highestDouble = tile[0];
      starter = "player";
      targetIndex = index;
    }
  });

  computerHand.forEach((tile, index) => {
    if (tile[0] === tile[1] && tile[0] > highestDouble) {
      highestDouble = tile[0];
      starter = "computer";
      targetIndex = index;
    }
  });

  if (highestDouble !== -1) {
    board.spinner = [highestDouble, highestDouble];
    paperTapeHistory.push(`[START] Spinner set to Big ${highestDouble}.`);

    if (starter === "player") {
      playerHand.splice(targetIndex, 1);
      isPlayerTurn = false;
      gameLog = `You started with Big ${highestDouble}. Computer's turn!`;
      setTimeout(executeComputerTurn, 1500);
    } else {
      computerHand.splice(targetIndex, 1);
      isPlayerTurn = true;
      gameLog = `Computer started with Big ${highestDouble}. Your turn!`;
    }
  } else {
    startNextRound();
  }
}

function determineFirstPlayerByDraw({ afterDeal = false, logPrefix = "Draw" } = {}) {
  if (!afterDeal) {
    shuffleBoneyard();
  }

  let playerDraw = boneyard.pop();
  let computerDraw = boneyard.pop();
  let playerPips = playerDraw[0] + playerDraw[1];
  let computerPips = computerDraw[0] + computerDraw[1];

  while (playerPips === computerPips) {
    boneyard.push(playerDraw, computerDraw);
    if (!afterDeal) {
      shuffleBoneyard();
    }
    playerDraw = boneyard.pop();
    computerDraw = boneyard.pop();
    playerPips = playerDraw[0] + playerDraw[1];
    computerPips = computerDraw[0] + computerDraw[1];
  }

  boneyard.push(playerDraw, computerDraw);

  if (!afterDeal) {
    shuffleBoneyard();
    dealHands();
  }

  if (playerPips > computerPips) {
    isPlayerTurn = true;
    gameLog = `${logPrefix}: you had the high tile (${playerPips} vs ${computerPips} pips).`;
    paperTapeHistory.push(`[START] ${logPrefix} — player opens (${playerPips} vs ${computerPips} pips).`);
  } else {
    isPlayerTurn = false;
    gameLog = `${logPrefix}: computer had the high tile (${computerPips} vs ${playerPips} pips).`;
    paperTapeHistory.push(`[START] ${logPrefix} — computer opens (${computerPips} vs ${playerPips} pips).`);
    setTimeout(executeComputerTurn, 1500);
  }
}

function hoboDrawForFirstPlayer() {
  determineFirstPlayerByDraw({ logPrefix: "Hobo draw" });
  if (isPlayerTurn) {
    gameLog = "Hobo draw: you had the high tile. Play any tile in the center to open.";
  } else {
    gameLog = "Hobo draw: computer had the high tile. Waiting…";
  }
}

function startRoundAfterBlocked() {
  dealHands();
  lastRoundBlocked = false;

  if (nextRoundOpener === "player") {
    isPlayerTurn = true;
    gameLog = isHoboRules()
      ? "Blocked round — no points awarded. You open in the center (most pips held)."
      : "Blocked round — no points awarded. You open next round (most pips held).";
    paperTapeHistory.push("[START] Blocked round — player opens (most pips).");
    nextRoundOpener = null;
    return;
  }

  if (nextRoundOpener === "computer") {
    isPlayerTurn = false;
    gameLog = isHoboRules()
      ? "Blocked round — no points awarded. Computer opens in the center (most pips held)."
      : "Blocked round — no points awarded. Computer opens next round (most pips held).";
    paperTapeHistory.push("[START] Blocked round — computer opens (most pips).");
    nextRoundOpener = null;
    setTimeout(executeComputerTurn, 1500);
    return;
  }

  nextRoundOpener = null;
  determineFirstPlayerByDraw({
    afterDeal: true,
    logPrefix: "Blocked tie draw",
  });
  if (isPlayerTurn) {
    gameLog = isHoboRules()
      ? "Blocked round — pip tie. You won the draw. Open in the center."
      : "Blocked round — pip tie. You won the draw and open next round.";
  } else {
    gameLog = isHoboRules()
      ? "Blocked round — pip tie. Computer won the draw and opens in the center."
      : "Blocked round — pip tie. Computer won the draw and opens next round.";
  }
}

function handleHoboStart() {
  hoboCenterLineActive = true;
  hoboLine = [];
  board.spinner = null;

  if (lastRoundBlocked) {
    startRoundAfterBlocked();
    return;
  }

  if (lastRoundWinner === "player") {
    dealHands();
    isPlayerTurn = true;
    gameLog = "You won last round — play any tile in the center to open.";
    paperTapeHistory.push("[START] Hobo — previous winner (player) opens.");
  } else if (lastRoundWinner === "computer") {
    dealHands();
    isPlayerTurn = false;
    gameLog = "Computer won last round — opening play…";
    paperTapeHistory.push("[START] Hobo — previous winner (computer) opens.");
    setTimeout(executeComputerTurn, 1500);
  } else {
    hoboDrawForFirstPlayer();
  }
}

function handleAutomaticStart() {
  if (isHouseRules()) {
    handleHouseAutomaticStart();
  } else {
    handleHoboStart();
  }
}

// --- 6. Core Rule Engine: Get Active Tip of a Branch ---
function getBranchTip(branchName) {
  const branchArray = board.branches[branchName];
  if (!branchArray || branchArray.length === 0) {
    return board.spinner ? board.spinner[0] : null;
  }
  
  const lastMove = branchArray[branchArray.length - 1];
  if (!lastMove) return board.spinner ? board.spinner[0] : null;
  
  // Always use the stored outerEdge value - it's guaranteed to be correct
  // regardless of how the tile was stored or oriented
  return lastMove.outerEdge;
}

// Board tiles are stored as [innerEdge, outerEdge]: matching pip toward the chain, exposed pip outward.
function orientTileForBranch(tile, tipValue) {
  const isDouble = tile[0] === tile[1];
  if (isDouble) {
    return { tile: [tile[0], tile[0]], outerEdge: tile[0], isDouble: true };
  }
  const innerEdge = tipValue;
  const outerEdge = tile[0] === tipValue ? tile[1] : tile[0];
  return { tile: [innerEdge, outerEdge], outerEdge, isDouble: false };
}

function formatTileBadgeLabel(move, branchName) {
  // move.tile is [innerEdge, outerEdge]; open end is left/up or right/down by branch.
  if (branchName === "left" || branchName === "up") {
    return `${move.tile[1]}·${move.tile[0]}`;
  }
  return `${move.tile[0]}·${move.tile[1]}`;
}

// --- 6.5. DEBUG TOOLS: State Inspection & Repair ---
function dumpBoardState(label = "Board State Dump") {
  console.log(`\n=== ${label} ===`);
  console.log("Spinner:", board.spinner);
  const branchNames = ["left", "right", "up", "down"];
  branchNames.forEach(name => {
    const branch = board.branches[name];
    console.log(`\n${name.toUpperCase()} Branch:`, branch);
    if (branch.length > 0) {
      console.log(`  Tip value from getBranchTip: ${getBranchTip(name)}`);
      const lastMove = branch[branch.length - 1];
      console.log(`  Last move tile: [${lastMove.tile[0]}, ${lastMove.tile[1]}]`);
      console.log(`  Stored outerEdge: ${lastMove.outerEdge}`);
      console.log(`  Stored isDouble: ${lastMove.isDouble}`);
    }
  });
}

function repairBoardState(label = "State Repaired") {
  console.log(`\n>>> REPAIRING STATE: ${label}`);
  const branchNames = ["left", "right", "up", "down"];
  
  branchNames.forEach(branchName => {
    const branch = board.branches[branchName];
    branch.forEach((move, index) => {
      // Recalculate the tip value that should connect to this tile
      let connectorValue;
      if (index === 0) {
        // First move connects to spinner
        connectorValue = board.spinner ? board.spinner[0] : null;
      } else {
        // Subsequent moves connect to the previous tile's outerEdge
        connectorValue = branch[index - 1].outerEdge;
      }
      
      // Determine which side of the tile is the outer edge
      const tile = move.tile;
      const isDouble = (tile[0] === tile[1]);
      let outerEdge;
      
      if (isDouble) {
        outerEdge = tile[0];
      } else {
        // The outer edge is whichever side is NOT the connector
        outerEdge = (tile[0] === connectorValue) ? tile[1] : tile[0];
      }
      
      // Keep tile stored as [innerEdge, outerEdge] for consistent display
      if (isDouble) {
        move.tile = [outerEdge, outerEdge];
      } else {
        move.tile = [connectorValue, outerEdge];
      }
      
      // Update the stored outerEdge
      move.outerEdge = outerEdge;
      move.isDouble = isDouble;
      
      console.log(`  ${branchName}[${index}]: Tile [${tile[0]},${tile[1]}] -> outerEdge=${outerEdge}, isDouble=${isDouble}`);
    });
  });
  
  console.log(">>> STATE REPAIR COMPLETE\n");
}

// --- 7. Check if Selected Tile Matches a Play Target ---
function tileMatchesTip(tile, tipValue) {
  return tile[0] === tipValue || tile[1] === tipValue;
}

function isValidMove(tile, target) {
  if (isGameOver || !tile) return false;

  if (isHoboPlayTarget(target)) {
    if (!isHoboLinePhase()) return false;
    if (target === HOBO_CENTER) {
      return hoboLine.length === 0;
    }
    const tipValue = target === HOBO_LINE_LEFT ? getHoboLineLeftTip() : getHoboLineRightTip();
    return tipValue !== null && tileMatchesTip(tile, tipValue);
  }

  if (isHoboLinePhase()) return false;

  const tipValue = getBranchTip(target);
  if (tipValue === null) return false;
  return tileMatchesTip(tile, tipValue);
}

function formatPlayTargetLabel(target) {
  if (target === HOBO_CENTER) return "center";
  if (target === HOBO_LINE_LEFT) return "left end";
  if (target === HOBO_LINE_RIGHT) return "right end";
  return formatBranchLabel(target);
}

function formatBranchLabel(branchName) {
  return branchName.charAt(0).toUpperCase() + branchName.slice(1);
}

function getMoveRejectionReason(tile, target) {
  if (isGameOver) return "The game is over.";
  if (!isPlayerTurn) return "Wait — it's the computer's turn.";
  if (selectedTileIndex === null || !tile) return "Select a tile from your hand first.";

  if (isHoboPlayTarget(target)) {
    if (!isHoboLinePhase()) {
      return "Use the spinner branches for this play.";
    }
    if (target === HOBO_CENTER) {
      if (hoboLine.length > 0) {
        return "Extend the center line from the left or right end.";
      }
      return null;
    }
    const tipValue = target === HOBO_LINE_LEFT ? getHoboLineLeftTip() : getHoboLineRightTip();
    if (tipValue === null) {
      return "Play the opening tile in the center first.";
    }
    if (!tileMatchesTip(tile, tipValue)) {
      return `${tile[0]}·${tile[1]} doesn't match the exposed ${tipValue} on the ${formatPlayTargetLabel(target)}.`;
    }
    return null;
  }

  if (isHoboLinePhase()) {
    if (hoboLine.length === 0) {
      return "Hobo opens in the center — play any tile there first.";
    }
    return `Extend the center line from the left (${getHoboLineLeftTip()}) or right (${getHoboLineRightTip()}) end.`;
  }

  const tipValue = getBranchTip(target);
  if (tipValue === null) {
    return `The ${formatBranchLabel(target)} branch isn't open yet.`;
  }
  if (!tileMatchesTip(tile, tipValue)) {
    return `${tile[0]}·${tile[1]} doesn't match the exposed ${tipValue} on the ${target} branch.`;
  }
  return null;
}

function showFeedbackToast(message, variant, durationMs = 2500) {
  feedbackToast = { message, variant };
  if (feedbackToastTimer) clearTimeout(feedbackToastTimer);
  feedbackToastTimer = setTimeout(() => {
    feedbackToast = null;
    feedbackToastTimer = null;
    renderGame();
  }, durationMs);
}

function showMoveError(message) {
  gameLog = message;
  moveFeedbackIsError = true;
  showFeedbackToast(message, "error", 3000);
}

function announceScoreFeedback(pointsEarned, who) {
  if (pointsEarned > 0) {
    showFeedbackToast(
      `+${pointsEarned} points!`,
      who === "player" ? "score-player" : "score-computer"
    );
  } else {
    showFeedbackToast("No score", "no-score", 1800);
  }
}

function handleInvalidPlayClick(target) {
  const tile = selectedTileIndex !== null ? playerHand[selectedTileIndex] : null;
  const reason = getMoveRejectionReason(tile, target);
  if (reason) {
    showMoveError(reason);
    renderGame();
  }
}

function hasAnyValidMoves(hand) {
  return hand.some((tile) => getActivePlayTargets().some((target) => isValidMove(tile, target)));
}

// --- 8. Check End-Game Conditions & Sweep Hand Pips ---
function checkWinCondition() {
  const tallyHandPips = (hand) => hand.reduce((sum, tile) => sum + tile[0] + tile[1], 0);
  const sweepLabel = isHouseRules() ? "House (round down)" : "Hobo (round up)";

  if (playerHand.length === 0) {
    isGameOver = true;
    lastRoundBlocked = false;
    lastRoundWinner = "player";
    const rawPips = tallyHandPips(computerHand);
    const endPoints = roundSweepPips(rawPips);
    applyScore("player", endPoints);

    if (!isMatchOver) {
      gameLog = `🎉 Round won! You dominoed. Opponent held ${rawPips} pips. +${endPoints} points!`;
    }
    paperTapeHistory.unshift(` [ROUND END] Player dominoed. Swept ${rawPips} pips (${sweepLabel}) -> +${endPoints} pts.`);
    checkMatchWin();
    return true;
  }

  if (computerHand.length === 0) {
    isGameOver = true;
    lastRoundBlocked = false;
    lastRoundWinner = "computer";
    const rawPips = tallyHandPips(playerHand);
    const endPoints = roundSweepPips(rawPips);
    applyScore("computer", endPoints);

    if (!isMatchOver) {
      gameLog = `💻 Computer wins the round! You held ${rawPips} pips. Computer earns +${endPoints} points!`;
    }
    paperTapeHistory.unshift(` [ROUND END] Computer dominoed. Swept ${rawPips} pips (${sweepLabel}) -> +${endPoints} pts.`);
    checkMatchWin();
    return true;
  }

  if (boneyard.length === 0 && !hasAnyValidMoves(playerHand) && !hasAnyValidMoves(computerHand)) {
    isGameOver = true;
    lastRoundBlocked = true;
    const playerPips = tallyHandPips(playerHand);
    const computerPips = tallyHandPips(computerHand);

    let finalSummary = `Round blocked! Pips remaining: You (${playerPips}), Computer (${computerPips}). No points awarded. `;

    if (playerPips > computerPips) {
      nextRoundOpener = "player";
      finalSummary += "You open next round (most pips held).";
      paperTapeHistory.unshift(` [ROUND END] Blocked round. Player opens next (${playerPips} vs ${computerPips} pips).`);
    } else if (computerPips > playerPips) {
      nextRoundOpener = "computer";
      finalSummary += "Computer opens next round (most pips held).";
      paperTapeHistory.unshift(` [ROUND END] Blocked round. Computer opens next (${computerPips} vs ${playerPips} pips).`);
    } else {
      nextRoundOpener = null;
      finalSummary += "Pip tie — drawing for first player next round.";
      paperTapeHistory.unshift(` [ROUND END] Blocked round. Pip tie (${playerPips} each) — draw for first.`);
    }

    if (!isMatchOver) {
      gameLog = finalSummary;
    }
    return true;
  }
  return false;
}

function evaluateBoardScoreHouse(updateLiveDisplay = false, contextLabel = "") {
  let totalBoardPips = 0;
  let breakdownParts = [];
  const branchNames = ["left", "right", "up", "down"];

  branchNames.forEach(name => {
    const branchArray = board.branches[name];
    if (branchArray.length > 0) {
      const lastMove = branchArray[branchArray.length - 1];
      let itemValue = 0;
      let label = "";

      if (lastMove.isDouble) {
        itemValue = lastMove.outerEdge * 2;
        label = `${name.toUpperCase()} (Double): ${itemValue}`;
      } else {
        itemValue = lastMove.outerEdge;
        label = `${name.toUpperCase()}: ${itemValue}`;
      }

      totalBoardPips += itemValue;
      breakdownParts.push(label);
    }
  });

  let mathExpression = breakdownParts.length > 0 ? breakdownParts.join(" + ") : "No active branch tips";
  let pointResult = (totalBoardPips > 0 && totalBoardPips % 5 === 0) ? totalBoardPips : 0;
  let summaryString = `[${contextLabel}] ${mathExpression} = ${totalBoardPips} Pips -> ` +
                      (pointResult > 0 ? `Scored ${pointResult} points!` : `0 points`);

  if (updateLiveDisplay) {
    liveCalculationText = `${mathExpression} = ${totalBoardPips} Pips (${pointResult > 0 ? 'Scores!' : 'No Score'})`;
    paperTapeHistory.unshift(summaryString);
  }

  return pointResult;
}

function evaluateBoardScoreHobo(updateLiveDisplay = false, contextLabel = "", playMeta = null) {
  if (!playMeta) {
    if (updateLiveDisplay) {
      liveCalculationText = "No score context for this board state.";
    }
    return 0;
  }

  if (playMeta.kind === "spinner-multi-branch") {
    return evaluateBoardScoreHouse(updateLiveDisplay, contextLabel);
  }

  let totalBoardPips = 0;
  let mathExpression = "";

  switch (playMeta.kind) {
    case "first":
      totalBoardPips = playMeta.tilePips;
      mathExpression = `Opening tile ${playMeta.left}+${playMeta.right}`;
      break;
    case "first-double":
    case "line-double":
      totalBoardPips = playMeta.spinnerPips;
      mathExpression = `Spinner double ${playMeta.spinnerVal}+${playMeta.spinnerVal}`;
      break;
    case "line-extend":
      totalBoardPips = playMeta.leftEnd + playMeta.rightEnd;
      mathExpression = `Line ends ${playMeta.leftEnd}+${playMeta.rightEnd}`;
      break;
    case "spinner-first-branch":
    case "spinner-extend-branch":
      totalBoardPips = playMeta.outerPip + playMeta.spinnerPips;
      mathExpression = `Branch tip ${playMeta.outerPip} + spinner ${playMeta.spinnerPips}`;
      break;
    default:
      break;
  }

  const pointResult = (totalBoardPips > 0 && totalBoardPips % 5 === 0) ? totalBoardPips : 0;
  const tag = playMeta.kind.startsWith("line") ? "Hobo line"
    : playMeta.kind.includes("spinner") ? "Hobo spinner"
    : "Hobo opener";
  const summaryString = `[${contextLabel}] ${mathExpression} = ${totalBoardPips} Pips -> ` +
                        (pointResult > 0 ? `Scored ${pointResult} points!` : `0 points`);

  if (updateLiveDisplay) {
    liveCalculationText = `${mathExpression} = ${totalBoardPips} Pips (${pointResult > 0 ? "Scores!" : "No Score"}) [${tag}]`;
    paperTapeHistory.unshift(summaryString);
  }

  return pointResult;
}

function evaluateBoardScore(updateLiveDisplay = false, contextLabel = "") {
  if (isHouseRules()) {
    return evaluateBoardScoreHouse(updateLiveDisplay, contextLabel);
  }
  return evaluateBoardScoreHobo(updateLiveDisplay, contextLabel);
}

function orientTileForLineEnd(tile, tipValue, side) {
  const isDouble = tile[0] === tile[1];
  if (isDouble) {
    return {
      tile: [tile[0], tile[0]],
      leftEnd: tile[0],
      rightEnd: tile[0],
      isDouble: true,
    };
  }

  const innerEdge = tipValue;
  const outerEdge = tile[0] === tipValue ? tile[1] : tile[0];
  if (side === "left") {
    return {
      tile: [outerEdge, innerEdge],
      leftEnd: outerEdge,
      rightEnd: innerEdge,
      isDouble: false,
    };
  }
  return {
    tile: [innerEdge, outerEdge],
    leftEnd: innerEdge,
    rightEnd: outerEdge,
    isDouble: false,
  };
}

function convertHoboLineToBranch(tilesLeftToRight, branchName) {
  if (tilesLeftToRight.length === 0) return;

  const spinnerVal = board.spinner[0];
  const chain = [];

  if (branchName === "right") {
    tilesLeftToRight.forEach((entry, index) => {
      let innerEdge;
      let outerEdge;
      if (index === 0) {
        innerEdge = entry.leftEnd === spinnerVal ? entry.leftEnd : entry.rightEnd;
        outerEdge = innerEdge === entry.leftEnd ? entry.rightEnd : entry.leftEnd;
      } else {
        innerEdge = entry.leftEnd;
        outerEdge = entry.rightEnd;
      }
      chain.push({
        tile: [innerEdge, outerEdge],
        outerEdge,
        isDouble: entry.isDouble,
      });
    });
    board.branches.right = chain;
    return;
  }

  if (branchName === "left") {
    for (let i = tilesLeftToRight.length - 1; i >= 0; i--) {
      const entry = tilesLeftToRight[i];
      let innerEdge;
      let outerEdge;
      if (i === tilesLeftToRight.length - 1) {
        innerEdge = entry.rightEnd === spinnerVal ? entry.rightEnd : entry.leftEnd;
        outerEdge = innerEdge === entry.rightEnd ? entry.leftEnd : entry.rightEnd;
      } else {
        innerEdge = entry.rightEnd;
        outerEdge = entry.leftEnd;
      }
      chain.unshift({
        tile: [innerEdge, outerEdge],
        outerEdge,
        isDouble: entry.isDouble,
      });
    }
    board.branches.left = chain;
  }
}

function promoteLineDoubleToSpinner(side, tile) {
  const spinnerVal = tile[0];
  const remaining = hoboLine.slice();
  activateHoboSpinnerBoard(spinnerVal);

  if (side === "left") {
    convertHoboLineToBranch(remaining, "right");
    paperTapeHistory.unshift(`[HOBO] Double ${spinnerVal} on left end — spinner set; line shifted to right branch.`);
  } else {
    convertHoboLineToBranch(remaining, "left");
    paperTapeHistory.unshift(`[HOBO] Double ${spinnerVal} on right end — spinner set; line shifted to left branch.`);
  }
}

function clearHoboLineLatest() {
  hoboLine.forEach((entry) => {
    entry.isLatest = false;
  });
}

function commitHoboPlay(target, tile, whoLabel) {
  if (target === HOBO_CENTER) {
    if (hoboLine.length > 0) {
      return { error: "The opening tile must be played in the center." };
    }

    if (tile[0] === tile[1]) {
      activateHoboSpinnerBoard(tile[0]);
      paperTapeHistory.unshift(`[START] ${whoLabel} opened with double ${tile[0]} — spinner set.`);
      return {
        playMeta: {
          kind: "first-double",
          spinnerVal: tile[0],
          spinnerPips: tile[0] * 2,
        },
        placedOnBranch: false,
      };
    }

    hoboLine = [{
      tile: [tile[0], tile[1]],
      leftEnd: tile[0],
      rightEnd: tile[1],
      isDouble: false,
      isLatest: true,
    }];
    paperTapeHistory.unshift(`[START] ${whoLabel} opened with ${tile[0]}·${tile[1]} in the center.`);
    return {
      playMeta: {
        kind: "first",
        left: tile[0],
        right: tile[1],
        tilePips: tile[0] + tile[1],
      },
      placedOnBranch: false,
    };
  }

  if (target === HOBO_LINE_LEFT || target === HOBO_LINE_RIGHT) {
    const side = target === HOBO_LINE_LEFT ? "left" : "right";
    const tipValue = side === "left" ? getHoboLineLeftTip() : getHoboLineRightTip();
    if (tipValue === null) {
      return { error: "Play the opening tile in the center first." };
    }
    if (!tileMatchesTip(tile, tipValue)) {
      return { error: `${tile[0]}·${tile[1]} doesn't match the exposed ${tipValue}.` };
    }

    const oriented = orientTileForLineEnd(tile, tipValue, side);
    if (oriented.isDouble || tile[0] === tile[1]) {
      promoteLineDoubleToSpinner(side, tile);
      return {
        playMeta: {
          kind: "line-double",
          spinnerVal: oriented.leftEnd,
          spinnerPips: oriented.leftEnd * 2,
        },
        placedOnBranch: false,
      };
    }

    clearHoboLineLatest();
    const entry = {
      tile: oriented.tile,
      leftEnd: oriented.leftEnd,
      rightEnd: oriented.rightEnd,
      isDouble: false,
      isLatest: true,
    };
    if (side === "left") {
      hoboLine.unshift(entry);
    } else {
      hoboLine.push(entry);
    }
    paperTapeHistory.unshift(`[HOBO] ${whoLabel} extended the center line on the ${side}.`);
    return {
      playMeta: {
        kind: "line-extend",
        leftEnd: hoboLine[0].leftEnd,
        rightEnd: hoboLine[hoboLine.length - 1].rightEnd,
      },
      placedOnBranch: false,
    };
  }

  const branchesBefore = countBranchesWithTiles();
  const tipValue = getBranchTip(target);
  const oriented = orientTileForBranch(tile, tipValue);
  board.branches[target].push({
    tile: oriented.tile,
    outerEdge: oriented.outerEdge,
    isDouble: oriented.isDouble,
  });
  paperTapeHistory.unshift(`[HOBO] ${whoLabel} played on the ${target} branch.`);

  const branchesAfter = countBranchesWithTiles();
  if (branchesAfter >= 2) {
    return { playMeta: { kind: "spinner-multi-branch" }, placedOnBranch: true };
  }

  const spinnerPips = board.spinner[0] + board.spinner[1];
  return {
    playMeta: {
      kind: branchesBefore === 0 ? "spinner-first-branch" : "spinner-extend-branch",
      outerPip: oriented.outerEdge,
      spinnerPips,
    },
    placedOnBranch: true,
  };
}

// --- 10. Handle Placing a Tile onto the Board ---
function playToTarget(target) {
  const tile = selectedTileIndex !== null ? playerHand[selectedTileIndex] : null;
  const rejectionReason = getMoveRejectionReason(tile, target);
  if (rejectionReason) {
    showMoveError(rejectionReason);
    renderGame();
    return;
  }

  let result;
  if (isHoboRules()) {
    result = commitHoboPlay(target, tile, "Player");
  } else {
    const tipValue = getBranchTip(target);
    const oriented = orientTileForBranch(tile, tipValue);
    board.branches[target].push({
      tile: oriented.tile,
      outerEdge: oriented.outerEdge,
      isDouble: oriented.isDouble,
    });
    result = { placedOnBranch: true, playMeta: null };
  }

  if (result.error) {
    showMoveError(result.error);
    renderGame();
    return;
  }

  playerHand.splice(selectedTileIndex, 1);
  selectedTileIndex = null;
  moveFeedbackIsError = false;

  const pointsEarned = isHouseRules()
    ? evaluateBoardScore(true, "PLAYER")
    : evaluateBoardScoreHobo(true, "PLAYER", result.playMeta);

  const targetLabel = formatPlayTargetLabel(target);
  if (applyScore("player", pointsEarned)) {
    if (pointsEarned > 0) {
      announceScoreFeedback(pointsEarned, "player");
    }
    renderGame();
    return;
  }

  if (pointsEarned > 0) {
    gameLog = `You scored ${pointsEarned} points on the ${targetLabel}!`;
  } else if (isHoboRules() && result.playMeta?.kind === "first-double") {
    gameLog = `You set the spinner with ${board.spinner[0]}·${board.spinner[1]}.`;
  } else if (isHoboRules() && result.playMeta?.kind === "line-double") {
    gameLog = `You set the spinner with ${board.spinner[0]}·${board.spinner[1]} — line reorganized.`;
  } else {
    gameLog = `You played on the ${targetLabel} — no score.`;
  }
  announceScoreFeedback(pointsEarned, "player");

  if (checkWinCondition()) {
    renderGame();
    return;
  }

  isPlayerTurn = false;
  renderGame();
  setTimeout(executeComputerTurn, 1500);
}

// --- 11. Player Manual Draw Action ---
function handlePlayerManualDraw(index) {
  if (!isPlayerTurn || hasAnyValidMoves(playerHand) || boneyard.length === 0 || isGameOver) return;

  if (selectedBoneyardIndex === index) {
    const drawnTile = boneyard.splice(index, 1)[0];
    playerHand.push(drawnTile);
    selectedBoneyardIndex = null;

    if (hasAnyValidMoves([drawnTile])) {
      selectedTileIndex = playerHand.length - 1; 
      gameLog = `You pulled [${drawnTile[0]}·${drawnTile[1]}]! It matches! Choose where to play.`;
    } else {
      gameLog = `You pulled [${drawnTile[0]}·${drawnTile[1]}], but it doesn't match. Draw another or use Auto-Draw!`;
    }
    renderGame();
  } else {
    selectedBoneyardIndex = index;
    renderGame();
  }
}

// --- 12. Player Auto-draw Action ---
function handlePlayerAutoDraw() {
  if (!isPlayerTurn || hasAnyValidMoves(playerHand) || boneyard.length === 0 || isGameOver) return;

  let tilesDrawnCount = 0;
  let foundMatch = false;

  while (boneyard.length > 0 && !foundMatch) {
    const drawnTile = boneyard.pop();
    playerHand.push(drawnTile);
    tilesDrawnCount++;

    if (hasAnyValidMoves([drawnTile])) {
      selectedTileIndex = playerHand.length - 1; 
      foundMatch = true;
      gameLog = `Auto-draw pulled ${tilesDrawnCount} tiles and found [${drawnTile[0]}·${drawnTile[1]}]. Place your move!`;
    }
  }

  if (!foundMatch && boneyard.length === 0) {
    if (!checkWinCondition()) {
      gameLog = `Auto-draw emptied boneyard with no playable options. Passing turn.`;
      isPlayerTurn = false;
      setTimeout(executeComputerTurn, 1500);
    }
  }

  renderGame();
}

// --- 13. Computer AI Strategy Execution ---
function executeComputerTurn() {
  if (isPlayerTurn || isGameOver) return;

  const findLegalMoves = () => {
    let moves = [];
    computerHand.forEach((tile, handIndex) => {
      getActivePlayTargets().forEach((target) => {
        if (isValidMove(tile, target)) {
          moves.push({ tile, handIndex, target });
        }
      });
    });
    return moves;
  };

  let legalMoves = findLegalMoves();

  let tilesDrawnCount = 0;
  while (legalMoves.length === 0 && boneyard.length > 0) {
    const drawnTile = boneyard.pop();
    computerHand.push(drawnTile);
    tilesDrawnCount++;
    legalMoves = findLegalMoves();
  }

  if (legalMoves.length === 0) {
    if (!checkWinCondition()) {
      gameLog = `Computer has no plays and boneyard is empty! Passing. Your turn!`;
      isPlayerTurn = true;
    }
    renderGame();
    return;
  }

  let bestMove = null;
  let maximumPointsFound = -1;

  legalMoves.forEach((move) => {
    const snap = snapshotBoardState();
    let result;

    if (isHoboRules()) {
      result = commitHoboPlay(move.target, move.tile, "Sim");
      if (result.error) {
        restoreBoardState(snap);
        return;
      }
    } else {
      const tipValue = getBranchTip(move.target);
      const oriented = orientTileForBranch(move.tile, tipValue);
      board.branches[move.target].push({ ...oriented });
      result = { playMeta: null };
    }

    const possibleScore = isHouseRules()
      ? evaluateBoardScore(false, "")
      : evaluateBoardScoreHobo(false, "", result.playMeta);
    restoreBoardState(snap);

    if (possibleScore > maximumPointsFound) {
      maximumPointsFound = possibleScore;
      bestMove = move;
    }
  });

  if (bestMove === null) {
    bestMove = legalMoves[0];
  }

  let result;
  if (isHoboRules()) {
    result = commitHoboPlay(bestMove.target, bestMove.tile, "Computer");
  } else {
    const tipValue = getBranchTip(bestMove.target);
    const oriented = orientTileForBranch(bestMove.tile, tipValue);
    board.branches[bestMove.target].push({
      tile: oriented.tile,
      outerEdge: oriented.outerEdge,
      isDouble: oriented.isDouble,
    });
    result = { playMeta: null, placedOnBranch: true };
  }

  const exactIndex = computerHand.findIndex(t => t[0] === bestMove.tile[0] && t[1] === bestMove.tile[1]);
  if (exactIndex !== -1) {
    computerHand.splice(exactIndex, 1);
  }

  const pointsEarned = isHouseRules()
    ? evaluateBoardScore(true, "COMPUTER")
    : evaluateBoardScoreHobo(true, "COMPUTER", result.playMeta);
  let drawContext = tilesDrawnCount > 0 ? `after drawing ${tilesDrawnCount} tiles ` : "";
  const targetLabel = formatPlayTargetLabel(bestMove.target);

  if (applyScore("computer", pointsEarned)) {
    if (pointsEarned > 0) {
      announceScoreFeedback(pointsEarned, "computer");
    }
    renderGame();
    return;
  }

  if (pointsEarned > 0) {
    gameLog = `Computer ${drawContext}scored ${pointsEarned} points on the ${targetLabel}!`;
  } else if (isHoboRules() && result.playMeta?.kind === "first-double") {
    gameLog = `Computer ${drawContext}set the spinner with ${board.spinner[0]}·${board.spinner[1]}.`;
  } else if (isHoboRules() && result.playMeta?.kind === "line-double") {
    gameLog = `Computer ${drawContext}set the spinner with ${board.spinner[0]}·${board.spinner[1]} — line reorganized.`;
  } else {
    gameLog = `Computer ${drawContext}played on the ${targetLabel} — no score.`;
  }
  announceScoreFeedback(pointsEarned, "computer");

  if (checkWinCondition()) {
    renderGame();
    return;
  }

  isPlayerTurn = true;
  renderGame();
}

// --- 14. Settings & title ---
function requestSettingsChange(partialSettings) {
  const next = { ...gameSettings, ...partialSettings };
  const rulesChanging = next.rulesMode !== gameSettings.rulesMode;
  const targetChanging = next.gameTarget !== gameSettings.gameTarget;
  const inProgress = boardHasAnyTiles() || playerHand.length > 0 || computerHand.length > 0;

  if ((rulesChanging || targetChanging) && inProgress) {
    if (!window.confirm("Changing this starts a new game. Continue?")) {
      return;
    }
    Object.assign(gameSettings, next);
    saveSettings();
    initMatch();
    return;
  }

  if (rulesChanging || targetChanging) {
    Object.assign(gameSettings, next);
    saveSettings();
    initMatch();
    return;
  }

  Object.assign(gameSettings, next);
  saveSettings();
  renderGame();
}

function renderGameTitle() {
  const title = document.createElement("h1");
  title.className = "game-title";

  if (gameSettings.rulesMode === "hobo") {
    title.innerHTML = '<span class="game-title__house game-title__house--struck">House</span> <span class="game-title__hobo">Hobo</span> <span class="game-title__suffix">Dominoes</span>';
  } else {
    title.innerHTML = '<span class="game-title__house">House</span> <span class="game-title__suffix">Dominoes</span>';
  }
  return title;
}

function renderSettingsPanel(container) {
  const wrapper = document.createElement("section");
  wrapper.className = "settings-panel";

  const toggle = document.createElement("button");
  toggle.type = "button";
  toggle.className = "settings-toggle";
  toggle.setAttribute("aria-expanded", String(settingsPanelOpen));
  toggle.textContent = settingsPanelOpen ? "Hide settings" : "Settings";
  toggle.onclick = () => {
    settingsPanelOpen = !settingsPanelOpen;
    renderGame();
  };
  wrapper.appendChild(toggle);

  if (!settingsPanelOpen) {
    container.appendChild(wrapper);
    return;
  }

  const body = document.createElement("div");
  body.className = "settings-body";

  const pipField = document.createElement("fieldset");
  pipField.className = "settings-field";
  pipField.innerHTML = "<legend>Pip style</legend>";
  [["black", "Black pips"], ["color", "Color pips"]].forEach(([value, label]) => {
    const id = `pip-${value}`;
    pipField.innerHTML += `
      <label class="settings-option">
        <input type="radio" name="pipStyle" id="${id}" value="${value}" ${gameSettings.pipStyle === value ? "checked" : ""}>
        ${label}
      </label>`;
  });
  pipField.querySelectorAll('input[name="pipStyle"]').forEach((input) => {
    input.onchange = () => requestSettingsChange({ pipStyle: input.value });
  });
  body.appendChild(pipField);

  const rulesField = document.createElement("fieldset");
  rulesField.className = "settings-field";
  rulesField.innerHTML = "<legend>Rules</legend>";
  [["house", "House rules (Louisiana)"], ["hobo", "Hobo rules"]].forEach(([value, label]) => {
    const id = `rules-${value}`;
    rulesField.innerHTML += `
      <label class="settings-option">
        <input type="radio" name="rulesMode" id="${id}" value="${value}" ${gameSettings.rulesMode === value ? "checked" : ""}>
        ${label}
      </label>`;
  });
  rulesField.querySelectorAll('input[name="rulesMode"]').forEach((input) => {
    input.onchange = () => requestSettingsChange({ rulesMode: input.value });
  });
  body.appendChild(rulesField);

  const displayField = document.createElement("fieldset");
  displayField.className = "settings-field";
  displayField.innerHTML = "<legend>Tile display</legend>";
  [["pips", "Pips"], ["numerals", "Numerals"], ["auto", "Auto (numerals on small screens)"]].forEach(([value, label]) => {
    const id = `display-${value}`;
    displayField.innerHTML += `
      <label class="settings-option">
        <input type="radio" name="displayMode" id="${id}" value="${value}" ${gameSettings.displayMode === value ? "checked" : ""}>
        ${label}
      </label>`;
  });
  displayField.querySelectorAll('input[name="displayMode"]').forEach((input) => {
    input.onchange = () => requestSettingsChange({ displayMode: input.value });
  });
  body.appendChild(displayField);

  const targetField = document.createElement("fieldset");
  targetField.className = "settings-field";
  targetField.innerHTML = "<legend>Play to (game target)</legend>";
  GAME_TARGET_OPTIONS.forEach((value) => {
    const id = `target-${value}`;
    targetField.innerHTML += `
      <label class="settings-option">
        <input type="radio" name="gameTarget" id="${id}" value="${value}" ${gameSettings.gameTarget === value ? "checked" : ""}>
        ${value} points
      </label>`;
  });
  targetField.querySelectorAll('input[name="gameTarget"]').forEach((input) => {
    input.onchange = () => requestSettingsChange({ gameTarget: Number(input.value) });
  });
  body.appendChild(targetField);

  if (gameSettings.rulesMode === "hobo") {
    const note = document.createElement("p");
    note.className = "settings-note";
    note.textContent = "Hobo: center line until a double sets the spinner; sweep rounds up at round end.";
    body.appendChild(note);
  }

  wrapper.appendChild(body);
  container.appendChild(wrapper);
}

// --- 15. Integrated Layout & Interface Pipeline ---
function getVisibleBranchSegments(branchArray) {
  if (branchArray.length <= MAX_VISIBLE_PER_BRANCH) {
    return { hiddenCount: 0, outer: branchArray };
  }
  const outer = branchArray.slice(-MAX_VISIBLE_OPEN_END);
  const hiddenCount = branchArray.length - outer.length;
  return { hiddenCount, outer };
}

function scrollHorizontalArmsToOpenEnd(boardWrapper) {
  requestAnimationFrame(() => {
    boardWrapper.querySelectorAll(".board-arm--left").forEach((arm) => {
      arm.scrollLeft = 0;
    });
    boardWrapper.querySelectorAll(".board-arm--right").forEach((arm) => {
      arm.scrollLeft = arm.scrollWidth - arm.clientWidth;
    });
  });
}

function scrollBranchPlaySlotsIntoView(boardWrapper) {
  requestAnimationFrame(() => {
    boardWrapper.querySelectorAll(".board-arm--up .chain-link--slot, .board-arm--down .chain-link--slot").forEach((slot) => {
      slot.scrollIntoView({ block: "nearest", inline: "nearest", behavior: "instant" });
    });
  });
}

function scrollBoardToCenterInWrapper(boardWrapper) {
  requestAnimationFrame(() => {
    const spinnerCenter = boardWrapper.querySelector(".board-center");
    const lineChain = boardWrapper.querySelector(".hobo-line-chain");
    const target = spinnerCenter || lineChain;
    if (!target) return;
    const wrapperRect = boardWrapper.getBoundingClientRect();
    const targetRect = target.getBoundingClientRect();
    const offset = targetRect.left + targetRect.width / 2 - (wrapperRect.left + wrapperRect.width / 2);
    if (Math.abs(offset) > 1) {
      boardWrapper.scrollLeft += offset;
    }
  });
}

function renderGame() {
  const appDiv = document.getElementById("app");
  appDiv.innerHTML = "";

  const mainframe = document.createElement("div");
  mainframe.className = "mainframe";

  const gameTableSide = document.createElement("div");
  gameTableSide.className = "game-table";

  gameTableSide.appendChild(renderGameTitle());

  const target = getGameTarget();
  const statusBar = document.createElement("div");
  statusBar.className = "game-status";

  const scoresRow = document.createElement("div");
  scoresRow.className = "game-status__scores";
  scoresRow.innerHTML = `
    <span class="game-status__you">You <strong>${playerScore}</strong></span>
    <span class="game-status__sep" aria-hidden="true">·</span>
    <span class="game-status__cpu">CPU <strong>${computerScore}</strong></span>
    <span class="game-status__target">to ${target}</span>
    <span class="game-status__sep" aria-hidden="true">·</span>
    <span class="game-status__meta">Boneyard ${boneyard.length}</span>
  `;
  statusBar.appendChild(scoresRow);

  const turnLine = document.createElement("div");
  turnLine.className = "turn-line";
  if (isMatchOver || isGameOver) {
    turnLine.classList.add("turn-line--over");
    turnLine.textContent = gameLog;
  } else if (isPlayerTurn) {
    turnLine.classList.add("turn-line--player");
    turnLine.textContent = "Your turn · tap a branch";
  } else {
    turnLine.classList.add("turn-line--computer");
    turnLine.textContent = "Computer thinking…";
  }
  statusBar.appendChild(turnLine);

  const showBoardPips = boardHasAnyTiles() && liveCalculationText !== "No tiles played yet.";
  if (showBoardPips) {
    const pipsLine = document.createElement("p");
    pipsLine.className = "board-pips";
    pipsLine.textContent = liveCalculationText;
    statusBar.appendChild(pipsLine);
  }

  const showLastAction = gameLog && !isGameOver && !isMatchOver && !moveFeedbackIsError;
  if (showLastAction) {
    const lastAction = document.createElement("p");
    lastAction.className = "last-action";
    lastAction.textContent = gameLog;
    statusBar.appendChild(lastAction);
  }

  gameTableSide.appendChild(statusBar);

  const opponentHandDiv = document.createElement("div");
  opponentHandDiv.className = "opponent-rack";

  computerHand.forEach(tile => {
    if (isGameOver) {
      const revealed = createDominoTile(tile[0], tile[1], { className: "opponent-tile opponent-tile--revealed" });
      opponentHandDiv.appendChild(revealed);
    } else {
      const hidden = createDominoTile(0, 0, {
        faceDown: true,
        peek: true,
        className: "opponent-tile opponent-tile--hidden",
      });
      opponentHandDiv.appendChild(hidden);
    }
  });
  gameTableSide.appendChild(opponentHandDiv);

  if (moveFeedbackIsError && gameLog) {
    const logBox = document.createElement("p");
    logBox.className = "game-log game-log--error";
    logBox.textContent = gameLog;
    gameTableSide.appendChild(logBox);
  }

  if (feedbackToast) {
    const toast = document.createElement("div");
    toast.className = `feedback-toast feedback-toast--${feedbackToast.variant}`;
    toast.textContent = feedbackToast.message;
    toast.setAttribute("role", "status");
    toast.setAttribute("aria-live", "polite");
    gameTableSide.appendChild(toast);
  }

  const boardWrapper = document.createElement("div");
  boardWrapper.className = "board-wrapper";

  const boardScaler = document.createElement("div");
  boardScaler.className = "board-scaler";

  const boardDiv = document.createElement("div");
  boardDiv.className = "board-hub";

  const createBoardTile = (move, isLatest, branchName) => {
    const [top, bottom] = moveToTileValues(move, branchName);
    return createDominoTile(top, bottom, {
      horizontal: boardTileHorizontal(branchName, move.isDouble),
      settled: !isLatest,
      className: "board-tile",
      title: `${top}·${bottom}`,
    });
  };

  const wrapChainLink = (child, branchName, isDouble) => {
    const link = document.createElement("div");
    link.className = "chain-link";
    applyChainLinkSize(link, branchName, isDouble);
    link.appendChild(child);
    return link;
  };

  const createBreakBadge = (branchName, hiddenCount) => {
    const breakBadge = document.createElement("div");
    breakBadge.className = "branch-break";
    breakBadge.textContent = "···";
    breakBadge.title = `${hiddenCount} earlier tile${hiddenCount === 1 ? "" : "s"} on this branch`;
    const link = document.createElement("div");
    link.className = "chain-link chain-link--break";
    if (isHorizontalBranch(branchName)) {
      link.classList.add("chain-link--break-h");
    } else {
      link.classList.add("chain-link--break-v");
    }
    link.appendChild(breakBadge);
    return link;
  };

  const createBranchPlaySlot = (branchName, tipValue) => {
    const slotBtn = document.createElement("button");
    slotBtn.className = "branch-slot";
    slotBtn.innerHTML = `${BRANCH_ARROWS[branchName]}(${tipValue ?? "?"})`;

    if (selectedTileIndex !== null && isPlayerTurn && !isGameOver) {
      const selectedTile = playerHand[selectedTileIndex];
      if (isValidMove(selectedTile, branchName)) {
        slotBtn.classList.add("branch-slot--valid");
        slotBtn.onclick = () => playToTarget(branchName);
      } else {
        const rejectionReason = getMoveRejectionReason(selectedTile, branchName);
        slotBtn.classList.add("branch-slot--invalid");
        slotBtn.title = rejectionReason || "Invalid move";
        slotBtn.onclick = () => handleInvalidPlayClick(branchName);
      }
    } else {
      slotBtn.disabled = true;
      slotBtn.classList.add("branch-slot--dim");
    }

    const link = document.createElement("div");
    link.className = "chain-link chain-link--slot";
    const slotIsHorizontal = isHorizontalBranch(branchName);
    if (slotIsHorizontal) {
      link.classList.add("chain-link--slot-h");
    } else {
      link.classList.add("chain-link--slot-v");
    }
    link.style.flexShrink = "0";
    link.appendChild(slotBtn);
    return link;
  };

  const createHoboPlaySlot = (target, label) => {
    const slotBtn = document.createElement("button");
    slotBtn.className = "branch-slot branch-slot--hobo";
    const arrow = target === HOBO_LINE_LEFT ? "◄" : target === HOBO_LINE_RIGHT ? "►" : "●";
    slotBtn.innerHTML = `${arrow}(${label})`;

    if (selectedTileIndex !== null && isPlayerTurn && !isGameOver) {
      const selectedTile = playerHand[selectedTileIndex];
      if (isValidMove(selectedTile, target)) {
        slotBtn.classList.add("branch-slot--valid");
        slotBtn.onclick = () => playToTarget(target);
      } else {
        const rejectionReason = getMoveRejectionReason(selectedTile, target);
        slotBtn.classList.add("branch-slot--invalid");
        slotBtn.title = rejectionReason || "Invalid move";
        slotBtn.onclick = () => handleInvalidPlayClick(target);
      }
    } else {
      slotBtn.disabled = true;
      slotBtn.classList.add("branch-slot--dim");
    }

    const link = document.createElement("div");
    link.className = "chain-link chain-link--slot chain-link--slot-h";
    link.appendChild(slotBtn);
    return link;
  };

  const createHoboLineBreakBadge = (hiddenCount) => {
    const breakBadge = document.createElement("div");
    breakBadge.className = "branch-break";
    breakBadge.textContent = "···";
    breakBadge.title = `${hiddenCount} tile${hiddenCount === 1 ? "" : "s"} omitted from the middle of the line`;
    const link = document.createElement("div");
    link.className = "chain-link chain-link--break";
    link.style.width = "var(--domino-w)";
    link.style.flexShrink = "0";
    link.appendChild(breakBadge);
    return link;
  };

  const appendHoboLineTile = (chain, entry) => {
    const tile = createDominoTile(entry.leftEnd, entry.rightEnd, {
      horizontal: true,
      settled: !entry.isLatest,
      className: "board-tile board-tile--hobo-line",
      title: `${entry.leftEnd}·${entry.rightEnd}`,
    });
    const link = document.createElement("div");
    link.className = "chain-link";
    link.style.width = "var(--domino-h)";
    link.style.flexShrink = "0";
    link.appendChild(tile);
    chain.appendChild(link);
  };

  const renderHoboLineBoard = (parent) => {
    const lineBoard = document.createElement("div");
    lineBoard.className = "hobo-line-board";

    const chain = document.createElement("div");
    chain.className = "hobo-line-chain";

    if (hoboLine.length === 0) {
      chain.appendChild(createHoboPlaySlot(HOBO_CENTER, "any"));
    } else {
      chain.appendChild(createHoboPlaySlot(HOBO_LINE_LEFT, getHoboLineLeftTip()));

      const lineLength = hoboLine.length;
      const needsBreak = lineLength > MAX_HOBO_LINE_PER_SIDE * 2;
      const leftVisible = needsBreak
        ? hoboLine.slice(0, MAX_HOBO_LINE_PER_SIDE)
        : hoboLine;
      const rightVisible = needsBreak
        ? hoboLine.slice(lineLength - MAX_HOBO_LINE_PER_SIDE)
        : [];
      const hiddenCount = needsBreak ? lineLength - MAX_HOBO_LINE_PER_SIDE * 2 : 0;

      leftVisible.forEach((entry) => {
        appendHoboLineTile(chain, entry);
      });

      if (needsBreak) {
        chain.appendChild(createHoboLineBreakBadge(hiddenCount));
        rightVisible.forEach((entry) => {
          appendHoboLineTile(chain, entry);
        });
      }

      chain.appendChild(createHoboPlaySlot(HOBO_LINE_RIGHT, getHoboLineRightTip()));
    }

    lineBoard.appendChild(chain);
    parent.appendChild(lineBoard);
  };

  const renderBranchChain = (branchName) => {
    const branchArray = board.branches[branchName];
    const tipValue = getBranchTip(branchName);
    const { hiddenCount, outer } = getVisibleBranchSegments(branchArray);
    const showSlot = shouldShowBranchPlaySlot(branchName);
    const playSlot = showSlot ? createBranchPlaySlot(branchName, tipValue ?? "?") : null;

    const appendTileLink = (parent, move, isLatest) => {
      const tile = createBoardTile(move, isLatest, branchName);
      parent.appendChild(wrapChainLink(tile, branchName, move.isDouble));
    };

    const appendOuterTiles = (parent) => {
      outer.forEach((move, index) => {
        appendTileLink(parent, move, index === outer.length - 1);
      });
    };

    if (isHorizontalBranch(branchName)) {
      const row = document.createElement("div");
      row.className = `branch-arm-row branch-arm-row--${branchName}`;

      const openEnd = document.createElement("div");
      openEnd.className = "branch-open-end";

      const spinnerEnd = document.createElement("div");
      spinnerEnd.className = "branch-spinner-end";

      if (hiddenCount > 0) {
        spinnerEnd.appendChild(createBreakBadge(branchName, hiddenCount));
        appendOuterTiles(openEnd);
        if (playSlot) openEnd.appendChild(playSlot);
      } else if (branchArray.length >= 2) {
        appendTileLink(spinnerEnd, branchArray[0], false);
        for (let i = 1; i < branchArray.length; i++) {
          appendTileLink(openEnd, branchArray[i], i === branchArray.length - 1);
        }
        if (playSlot) openEnd.appendChild(playSlot);
      } else if (branchArray.length === 1) {
        appendTileLink(spinnerEnd, branchArray[0], true);
        if (playSlot) openEnd.appendChild(playSlot);
      } else if (playSlot) {
        spinnerEnd.appendChild(playSlot);
      }

      if (branchName === "left") {
        if (openEnd.childNodes.length > 0) row.appendChild(openEnd);
        if (spinnerEnd.childNodes.length > 0) row.appendChild(spinnerEnd);
      } else {
        if (spinnerEnd.childNodes.length > 0) row.appendChild(spinnerEnd);
        if (openEnd.childNodes.length > 0) row.appendChild(openEnd);
      }
      if (openEnd.childNodes.length === 0) {
        row.classList.add("branch-arm-row--spinner-only");
      }
      return row;
    }

    const chain = document.createElement("div");
    chain.className = `branch-chain branch-chain--${branchName}`;

    if (hiddenCount > 0) {
      chain.appendChild(createBreakBadge(branchName, hiddenCount));
    }

    appendOuterTiles(chain);

    if (playSlot) {
      chain.appendChild(playSlot);
    }

    return chain;
  };

  const armUp = document.createElement("div");
  armUp.className = "board-arm board-arm--up";
  armUp.appendChild(renderBranchChain("up"));

  const armDown = document.createElement("div");
  armDown.className = "board-arm board-arm--down";
  armDown.appendChild(renderBranchChain("down"));

  const armLeft = document.createElement("div");
  armLeft.className = "board-arm board-arm--left";
  armLeft.appendChild(renderBranchChain("left"));

  const armRight = document.createElement("div");
  armRight.className = "board-arm board-arm--right";
  armRight.appendChild(renderBranchChain("right"));

  const centerEl = document.createElement("div");
  centerEl.className = "board-center";
  const spinnerElement = document.createElement("div");
  spinnerElement.className = "spinner-slot";
  if (board.spinner) {
    const spinnerTile = createDominoTile(board.spinner[0], board.spinner[1], {
      horizontal: false,
      className: "board-tile board-tile--spinner",
      title: `Spinner ${board.spinner[0]}·${board.spinner[1]}`,
    });
    spinnerElement.appendChild(spinnerTile);
  } else {
    spinnerElement.classList.add("spinner-slot--empty");
    spinnerElement.setAttribute("aria-label", "Spinner not set");
  }
  centerEl.appendChild(spinnerElement);

  boardDiv.appendChild(armUp);
  boardDiv.appendChild(armLeft);
  boardDiv.appendChild(centerEl);
  boardDiv.appendChild(armRight);
  boardDiv.appendChild(armDown);

  if (shouldRenderHoboLineBoard()) {
    renderHoboLineBoard(boardScaler);
  } else {
    boardScaler.appendChild(boardDiv);
  }
  boardWrapper.appendChild(boardScaler);
  gameTableSide.appendChild(boardWrapper);
  scrollBoardToCenterInWrapper(boardWrapper);
  scrollHorizontalArmsToOpenEnd(boardWrapper);
  scrollBranchPlaySlotsIntoView(boardWrapper);

  const playerNeedsToDraw = isPlayerTurn && !hasAnyValidMoves(playerHand) && boneyard.length > 0 && !isGameOver;
  if (playerNeedsToDraw) {
    const drawSection = document.createElement("div");
    drawSection.className = "draw-section";

    const drawHeader = document.createElement("div");
    drawHeader.className = "draw-header";

    const boneLabel = document.createElement("h3");
    boneLabel.textContent = `Boneyard (${boneyard.length})`;
    drawHeader.appendChild(boneLabel);

    const autoBtn = document.createElement("button");
    autoBtn.className = "btn btn-primary btn-auto-draw";
    autoBtn.textContent = "⚡ Auto-Draw";
    autoBtn.onclick = handlePlayerAutoDraw;
    drawHeader.appendChild(autoBtn);
    drawSection.appendChild(drawHeader);

    const manualLabel = document.createElement("p");
    manualLabel.className = "draw-manual-hint";
    manualLabel.textContent = "Or pick manually:";
    drawSection.appendChild(manualLabel);

    const manualPoolContainer = document.createElement("div");
    manualPoolContainer.className = "boneyard-pool";

    boneyard.forEach((tile, bIndex) => {
      const isTargeted = (bIndex === selectedBoneyardIndex);
      const boneBtn = createDominoTile(0, 0, {
        tag: "button",
        faceDown: true,
        className: isTargeted ? "boneyard-tile boneyard-tile--selected" : "boneyard-tile",
        title: isTargeted ? "Confirm draw?" : `Boneyard tile ${bIndex + 1}`,
        ariaLabel: isTargeted ? "Confirm boneyard draw" : `Face-down boneyard tile ${bIndex + 1}`,
        onClick: () => handlePlayerManualDraw(bIndex),
      });
      if (isTargeted) {
        const confirm = document.createElement("span");
        confirm.className = "boneyard-tile__confirm";
        confirm.textContent = "?";
        confirm.setAttribute("aria-hidden", "true");
        boneBtn.appendChild(confirm);
      }
      manualPoolContainer.appendChild(boneBtn);
    });
    drawSection.appendChild(manualPoolContainer);
    gameTableSide.appendChild(drawSection);
  }

  const handContainer = document.createElement("div");
  handContainer.className = "hand-container";

  playerHand.forEach((tile, index) => {
    const isSelected = (index === selectedTileIndex);
    const tileBtn = createDominoTile(tile[0], tile[1], {
      tag: "button",
      selected: isSelected,
      disabled: !isPlayerTurn || isGameOver,
      className: "hand-tile",
      onClick: isPlayerTurn && !isGameOver
        ? () => {
            selectedTileIndex = isSelected ? null : index;
            moveFeedbackIsError = false;
            renderGame();
          }
        : null,
    });
    handContainer.appendChild(tileBtn);
  });
  gameTableSide.appendChild(handContainer);

  if (isMatchOver) {
    const newGameBtn = document.createElement("button");
    newGameBtn.className = "btn btn-success";
    newGameBtn.textContent = "🔄 New Game";
    newGameBtn.onclick = initMatch;
    gameTableSide.appendChild(newGameBtn);
  } else if (isGameOver) {
    const restartBtn = document.createElement("button");
    restartBtn.className = "btn btn-success";
    restartBtn.textContent = "▶️ Next Round";
    restartBtn.onclick = startNextRound;
    gameTableSide.appendChild(restartBtn);
  }

  const auditPanel = document.createElement("aside");
  auditPanel.className = auditTapeOpen ? "audit-panel" : "audit-panel audit-panel--collapsed";

  const tapeEntryCount = paperTapeHistory.length;
  const toggleBtn = document.createElement("button");
  toggleBtn.type = "button";
  toggleBtn.className = "audit-toggle";
  toggleBtn.setAttribute("aria-expanded", String(auditTapeOpen));
  toggleBtn.innerHTML = auditTapeOpen
    ? `📋 Hide Audit Tape <span class="audit-count">(${tapeEntryCount})</span>`
    : `📋 Show Audit Tape <span class="audit-count">(${tapeEntryCount})</span>`;
  toggleBtn.onclick = () => {
    auditTapeOpen = !auditTapeOpen;
    renderGame();
  };
  auditPanel.appendChild(toggleBtn);

  const auditBody = document.createElement("div");
  auditBody.className = "audit-panel-body";

  const debugTools = document.createElement("div");
  debugTools.className = "audit-debug-tools";

  const debugBtn = document.createElement("button");
  debugBtn.className = "btn-debug";
  debugBtn.textContent = "🔍 Debug State";
  debugBtn.onclick = () => {
    console.clear();
    dumpBoardState("DEBUG: Current Board State");
    const branchNames = ["left", "right", "up", "down"];
    console.log("\n=== BRANCH TIPS ===");
    branchNames.forEach(name => {
      console.log(`${name}: ${getBranchTip(name)}`);
    });
  };
  debugTools.appendChild(debugBtn);

  const repairBtn = document.createElement("button");
  repairBtn.className = "btn-repair";
  repairBtn.textContent = "🔧 Repair State";
  repairBtn.onclick = () => {
    repairBoardState("UI: State Repair Triggered");
    renderGame();
  };
  debugTools.appendChild(repairBtn);
  auditBody.appendChild(debugTools);

  const tapeContainer = document.createElement("div");
  tapeContainer.className = "tape-container";

  if (paperTapeHistory.length === 0) {
    tapeContainer.innerHTML = `<span class="tape-empty">Tape is clean. Make a move to print calculations.</span>`;
  } else {
    paperTapeHistory.forEach(entry => {
      const line = document.createElement("div");
      line.className = "tape-line";
      if (entry.includes("Scored") || entry.includes("Swept")) {
        line.classList.add("tape-line--score");
      } else if (entry.includes("PLAYER")) {
        line.classList.add("tape-line--player");
      } else if (entry.includes("COMPUTER")) {
        line.classList.add("tape-line--computer");
      } else if (entry.includes("ROUND END")) {
        line.classList.add("tape-line--round");
      }
      line.textContent = entry;
      tapeContainer.appendChild(line);
    });
  }
  auditBody.appendChild(tapeContainer);
  auditPanel.appendChild(auditBody);

  mainframe.appendChild(gameTableSide);
  mainframe.appendChild(auditPanel);

  appDiv.appendChild(mainframe);
  renderSettingsPanel(gameTableSide);
}

// --- 16. TEST & DEBUG HELPERS (Call from console) ---
window.testMove = function(tileA, tileB, branchName) {
  console.log(`\n>>> Testing tile [${tileA}·${tileB}] on ${branchName} branch...`);
  const tile = [tileA, tileB];
  const tipValue = getBranchTip(branchName);
  const result = isValidMove(tile, branchName);
  console.log(`  Tip value: ${tipValue}`);
  console.log(`  Tile values: [${tile[0]}, ${tile[1]}]`);
  console.log(`  Valid move? ${result}`);
  return result;
};

window.testAllBranches = function(tileA, tileB) {
  console.log(`\n>>> Testing tile [${tileA}·${tileB}] on all branches...`);
  const tile = [tileA, tileB];
  const branches = ["left", "right", "up", "down"];
  branches.forEach(branch => {
    const tipValue = getBranchTip(branch);
    const valid = isValidMove(tile, branch);
    console.log(`  ${branch}: tip=${tipValue}, valid=${valid}`);
  });
};

window.inspectBranch = function(branchName) {
  console.log(`\n>>> Inspecting ${branchName} branch...`);
  const branch = board.branches[branchName];
  console.log(branch);
  console.log(`Tip value: ${getBranchTip(branchName)}`);
};

window.setState = function() {
  console.log("\n=== CURRENT BOARD STATE ===");
  dumpBoardState("Inspection from console");
  console.log("hoboCenterLineActive:", hoboCenterLineActive);
  console.log("shouldRenderHoboLineBoard:", shouldRenderHoboLineBoard());
  console.log("hoboLine length:", hoboLine.length);
  console.log("spinner:", board.spinner);
  const hub = document.querySelector(".board-hub");
  const line = document.querySelector(".hobo-line-board");
  const center = document.querySelector(".board-center");
  console.log("DOM:", { hub: !!hub, line: !!line, center: !!center, spinnerTile: !!document.querySelector(".board-tile--spinner") });
  if (center) {
    const wr = document.querySelector(".board-wrapper")?.getBoundingClientRect();
    const cr = center.getBoundingClientRect();
    const hr = hub?.getBoundingClientRect();
    if (wr) {
      const mid = wr.left + wr.width / 2;
      console.log("center offset from wrapper mid:", cr.left + cr.width / 2 - mid);
      if (hr) console.log("hub offset from wrapper mid:", hr.left + hr.width / 2 - mid);
    }
  }
};

window.repairState = function() {
  console.log("\n=== REPAIRING BOARD STATE ===");
  repairBoardState("Manual repair from console");
  console.log("State repaired. Run setState() to verify.");
};

window.previewSpinnerOnly = function(val = 1) {
  gameSettings.rulesMode = "hobo";
  isGameOver = false;
  isPlayerTurn = true;
  activateHoboSpinnerBoard(val);
  renderGame();
};

window.previewHoboSpinnerFromLine = function(side = "right") {
  gameSettings.rulesMode = "hobo";
  isGameOver = false;
  isPlayerTurn = true;
  hoboLine = [
    { tile: [1, 2], leftEnd: 1, rightEnd: 2, isDouble: false, isLatest: false },
    { tile: [2, 3], leftEnd: 2, rightEnd: 3, isDouble: false, isLatest: false },
    { tile: [3, 4], leftEnd: 3, rightEnd: 4, isDouble: false, isLatest: false },
    { tile: [4, 5], leftEnd: 4, rightEnd: 5, isDouble: false, isLatest: false },
    { tile: [5, 6], leftEnd: 5, rightEnd: 6, isDouble: false, isLatest: true },
  ];
  promoteLineDoubleToSpinner(side, [6, 6]);
  renderGame();
  setTimeout(() => setState(), 50);
};

window.previewHouseEmptySpinner = function(val = 6) {
  gameSettings.rulesMode = "house";
  isGameOver = false;
  isPlayerTurn = true;
  board.spinner = [val, val];
  board.branches = { left: [], right: [], up: [], down: [] };
  renderGame();
};

window.previewHouseSingleLeftBranch = function() {
  gameSettings.rulesMode = "house";
  isGameOver = false;
  isPlayerTurn = true;
  board.spinner = [6, 6];
  board.branches = {
    left: [{ tile: [6, 5], outerEdge: 5, isDouble: false }],
    right: [{ tile: [6, 4], outerEdge: 4, isDouble: false }],
    up: [],
    down: [],
  };
  playerHand = [[5, 3], [0, 0], [1, 1], [2, 2], [3, 3], [4, 4], [5, 5]];
  renderGame();
};

window.previewHouseTwoTileLeftBranch = function() {
  gameSettings.rulesMode = "house";
  isGameOver = false;
  isPlayerTurn = true;
  board.spinner = [6, 6];
  board.branches = {
    left: [
      { tile: [6, 5], outerEdge: 5, isDouble: false },
      { tile: [5, 4], outerEdge: 4, isDouble: false },
    ],
    right: [],
    up: [],
    down: [],
  };
  playerHand = [[4, 3], [0, 0], [1, 1], [2, 2], [3, 3], [4, 4], [5, 5]];
  renderGame();
};

window.previewHouseThreeTileLeftBranch = function() {
  gameSettings.rulesMode = "house";
  isGameOver = false;
  isPlayerTurn = true;
  board.spinner = [6, 6];
  board.branches = {
    left: [
      { tile: [6, 2], outerEdge: 2, isDouble: false },
      { tile: [2, 5], outerEdge: 5, isDouble: false },
      { tile: [5, 4], outerEdge: 4, isDouble: false },
    ],
    right: [{ tile: [6, 0], outerEdge: 0, isDouble: false }],
    up: [
      { tile: [6, 5], outerEdge: 5, isDouble: false },
      { tile: [5, 5], outerEdge: 5, isDouble: true },
      { tile: [5, 5], outerEdge: 5, isDouble: true },
    ],
    down: [
      { tile: [6, 5], outerEdge: 5, isDouble: false },
      { tile: [5, 6], outerEdge: 6, isDouble: false },
      { tile: [6, 6], outerEdge: 6, isDouble: true },
    ],
  };
  playerHand = [[4, 0], [1, 0], [4, 4], [0, 0], [4, 3]];
  renderGame();
};

window.previewHouseLongLeftBranch = function() {
  gameSettings.rulesMode = "house";
  hoboCenterLineActive = true;
  isGameOver = false;
  isPlayerTurn = true;
  board.spinner = [6, 6];
  board.branches = {
    left: [
      { tile: [6, 5], outerEdge: 5, isDouble: false },
      { tile: [5, 4], outerEdge: 4, isDouble: false },
      { tile: [4, 3], outerEdge: 3, isDouble: false },
      { tile: [3, 2], outerEdge: 2, isDouble: false },
    ],
    right: [],
    up: [],
    down: [],
  };
  playerHand = [[2, 1], [0, 0], [1, 1], [2, 2], [3, 3], [4, 4], [5, 5]];
  renderGame();
  setTimeout(() => {
    const arm = document.querySelector(".board-arm--left");
    const slot = arm?.querySelector(".chain-link--slot");
    const br = arm?.querySelector(".branch-break");
    const outerTiles = arm?.querySelectorAll(".branch-open-end .board-tile");
    console.log("Long left branch layout:", {
      hasBreak: !!br,
      openEndTileCount: outerTiles?.length ?? 0,
      slotVisible: !!slot && slot.getBoundingClientRect().width > 0,
      armScrollLeft: arm?.scrollLeft,
    });
  }, 100);
};

window.runHoboScoringChecklist = function() {
  const savedRules = gameSettings.rulesMode;
  gameSettings.rulesMode = "hobo";
  const results = [];
  const check = (name, got, expected) => {
    const pass = got === expected;
    results.push({ name, pass, got, expected });
    console.log(`${pass ? "✅" : "❌"} ${name}: got ${got}, expected ${expected}`);
    return pass;
  };

  console.log("\n=== HOBO SCORING CHECKLIST ===\n");

  check("1. First tile 5·0 → 5 pips scores",
    evaluateBoardScoreHobo(false, "TEST", { kind: "first", left: 5, right: 0, tilePips: 5 }), 5);
  check("1b. First tile 5·2 → 7 pips no score",
    evaluateBoardScoreHobo(false, "TEST", { kind: "first", left: 5, right: 2, tilePips: 7 }), 0);

  check("2. Line ends 6+4 → 10 scores",
    evaluateBoardScoreHobo(false, "TEST", { kind: "line-extend", leftEnd: 6, rightEnd: 4 }), 10);
  check("2b. Line ends 6+2 → 8 no score",
    evaluateBoardScoreHobo(false, "TEST", { kind: "line-extend", leftEnd: 6, rightEnd: 2 }), 0);

  check("3. Double opener 5·5 → 10 scores",
    evaluateBoardScoreHobo(false, "TEST", { kind: "first-double", spinnerVal: 5, spinnerPips: 10 }), 10);
  check("3b. Line-end double 3·3 → 6 no score",
    evaluateBoardScoreHobo(false, "TEST", { kind: "line-double", spinnerVal: 3, spinnerPips: 6 }), 0);

  check("4. Spinner + one branch: outer 0 + spinner 10 → 10 scores",
    evaluateBoardScoreHobo(false, "TEST", { kind: "spinner-first-branch", outerPip: 0, spinnerPips: 10 }), 10);
  check("4b. Spinner + one branch: outer 2 + spinner 10 → 12 no score",
    evaluateBoardScoreHobo(false, "TEST", { kind: "spinner-first-branch", outerPip: 2, spinnerPips: 10 }), 0);

  board.spinner = [5, 5];
  board.branches = {
    left: [{ tile: [5, 0], outerEdge: 0, isDouble: false }],
    right: [{ tile: [5, 5], outerEdge: 5, isDouble: true }],
    up: [],
    down: [],
  };
  check("5. Two branches (House tips): 0 + 10 → 10 scores",
    evaluateBoardScoreHobo(false, "TEST", { kind: "spinner-multi-branch" }), 10);
  board.branches.right = [{ tile: [5, 3], outerEdge: 3, isDouble: false }];
  check("5b. Two branches: tips 0+3 → 3 no score",
    evaluateBoardScoreHobo(false, "TEST", { kind: "spinner-multi-branch" }), 0);

  check("6. Round sweep rounds up 7 → 10",
    roundSweepPips(7), 10);
  check("6b. Round sweep rounds up 5 → 5",
    roundSweepPips(5), 5);
  check("6c. Round sweep 0 → 0",
    roundSweepPips(0), 0);

  gameSettings.rulesMode = savedRules;
  board.spinner = null;
  board.branches = { left: [], right: [], up: [], down: [] };

  const passed = results.filter((r) => r.pass).length;
  console.log(`\n=== ${passed}/${results.length} checks passed ===\n`);
  return results;
};

window.runHouseRulesChecklist = function() {
  const savedRules = gameSettings.rulesMode;
  gameSettings.rulesMode = "house";
  hoboCenterLineActive = true;
  board.spinner = [6, 6];
  board.branches = { left: [], right: [], up: [], down: [] };
  const results = [];
  const check = (name, pass) => {
    results.push({ name, pass });
    console.log(`${pass ? "✅" : "❌"} ${name}`);
    return pass;
  };

  console.log("\n=== HOUSE RULES CHECKLIST ===\n");

  check("Uses hub board (not Hobo line)", !shouldRenderHoboLineBoard());
  check("All four branch slots shown", BRANCH_NAMES.every((b) => shouldShowBranchPlaySlot(b)));
  check("Hobo line targets blocked", !isValidMove([3, 2], HOBO_CENTER));
  check("House branch move valid", isValidMove([6, 5], "left"));
  check("House uses House in-play scoring path", evaluateBoardScore(false, "TEST") === evaluateBoardScoreHouse(false, "TEST"));
  check("House sweep rounds down 7 → 5", roundSweepPips(7) === 5);

  const threeTileBranch = [
    { tile: [6, 2], outerEdge: 2, isDouble: false },
    { tile: [2, 5], outerEdge: 5, isDouble: false },
    { tile: [5, 4], outerEdge: 4, isDouble: false },
  ];
  const threeTileVisibility = getVisibleBranchSegments(threeTileBranch);
  check("3-tile branch triggers overflow (···)", threeTileVisibility.hiddenCount === 1);
  check("3-tile branch shows 2 open-end tiles", threeTileVisibility.outer.length === 2);
  check("3-tile open-end is latest two tiles", threeTileVisibility.outer[0].tile[1] === 5 && threeTileVisibility.outer[1].tile[1] === 4);

  gameSettings.rulesMode = savedRules;
  board.spinner = null;
  board.branches = { left: [], right: [], up: [], down: [] };

  const passed = results.filter((r) => r.pass).length;
  console.log(`\n=== ${passed}/${results.length} checks passed ===\n`);
  return results;
};

// --- 15. Execution Loop ---
function startNextRound() {
  isGameOver = false;
  paperTapeHistory = [];
  liveCalculationText = "No tiles played yet.";
  board.branches = { left: [], right: [], up: [], down: [] };
  board.spinner = null;
  hoboLine = [];
  hoboCenterLineActive = isHoboRules();
  selectedTileIndex = null;
  selectedBoneyardIndex = null;
  feedbackToast = null;
  moveFeedbackIsError = false;
  if (feedbackToastTimer) {
    clearTimeout(feedbackToastTimer);
    feedbackToastTimer = null;
  }

  shuffleBoneyard();
  if (lastRoundBlocked) {
    handleAutomaticStart();
    renderGame();
    return;
  }

  if (isHouseRules()) {
    isPlayerTurn = true;
    dealHands();
  }
  handleAutomaticStart();
  renderGame();
}

function initMatch() {
  playerScore = 0;
  computerScore = 0;
  lastRoundWinner = null;
  lastRoundBlocked = false;
  nextRoundOpener = null;
  isMatchOver = false;
  startNextRound();
}

initMatch();