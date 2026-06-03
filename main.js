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

// --- 2. Game State Variables ---
let boneyard = [];
let playerHand = [];
let computerHand = [];
let playerScore = 0;
let computerScore = 0;
let isPlayerTurn = true; 
let isGameOver = false;
let board = {
  spinner: null, 
  branches: { left: [], right: [], up: [], down: [] }
};
let gameLog = "";
let selectedTileIndex = null;
let selectedBoneyardIndex = null; 

// --- Diagnostic Variables ---
let liveCalculationText = "No tiles played yet.";
let paperTapeHistory = []; 

// --- Mobile Detection ---
function isMobileDevice() {
  return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent) 
    || window.matchMedia("(max-width: 768px)").matches;
} 

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

// --- 5. Find and Play Highest Double Automatically ---
function handleAutomaticStart() {
  let highestDouble = -1;
  let starter = null;
  let targetIndex = -1;

  playerHand.forEach((tile, index) => {
    if (tile[0] === tile[1] && tile[0] > highestDouble) {
      highestDouble = tile[0];
      starter = 'player';
      targetIndex = index;
    }
  });

  computerHand.forEach((tile, index) => {
    if (tile[0] === tile[1] && tile[0] > highestDouble) {
      highestDouble = tile[0];
      starter = 'computer';
      targetIndex = index;
    }
  });

  if (highestDouble !== -1) {
    board.spinner = [highestDouble, highestDouble];
    paperTapeHistory.push(`[START] Spinner set to Big ${highestDouble}.`);
    
    if (starter === 'player') {
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
    initGame(); 
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
      
      // Update the stored outerEdge
      move.outerEdge = outerEdge;
      move.isDouble = isDouble;
      
      console.log(`  ${branchName}[${index}]: Tile [${tile[0]},${tile[1]}] -> outerEdge=${outerEdge}, isDouble=${isDouble}`);
    });
  });
  
  console.log(">>> STATE REPAIR COMPLETE\n");
}

// --- 7. Check if Selected Tile Matches a Specific Branch ---
function isValidMove(tile, branchName) {
  if (isGameOver) return false;
  const tipValue = getBranchTip(branchName);
  if (tipValue === null) return false;
  return tile[0] === tipValue || tile[1] === tipValue;
}

function hasAnyValidMoves(hand) {
  const branchNames = ["left", "right", "up", "down"];
  return hand.some(tile => branchNames.some(name => isValidMove(tile, name)));
}

// --- 8. Check End-Game Conditions & Sweep Hand Pips ---
function checkWinCondition() {
  const tallyHandPips = (hand) => hand.reduce((sum, tile) => sum + tile[0] + tile[1], 0);
  const roundToNearestFive = (pips) => Math.round(pips / 5) * 5;

  if (playerHand.length === 0) {
    isGameOver = true;
    const rawPips = tallyHandPips(computerHand);
    const endPoints = roundToNearestFive(rawPips);
    playerScore += endPoints;

    gameLog = `🎉 DOMINO! You win! Cleared your hand. Opponent held ${rawPips} pips. You earn +${endPoints} points!`;
    paperTapeHistory.unshift(` [ROUND END] Player dominoed. Swept ${rawPips} pips from computer hand -> Earned +${endPoints} pts.`);
    return true;
  }

  if (computerHand.length === 0) {
    isGameOver = true;
    const rawPips = tallyHandPips(playerHand);
    const endPoints = roundToNearestFive(rawPips);
    computerScore += endPoints;

    gameLog = `💻 Computer dominoed and won! You held ${rawPips} pips. Computer earns +${endPoints} points!`;
    paperTapeHistory.unshift(` [ROUND END] Computer dominoed. Swept ${rawPips} pips from player hand -> Earned +${endPoints} pts.`);
    return true;
  }

  if (boneyard.length === 0 && !hasAnyValidMoves(playerHand) && !hasAnyValidMoves(computerHand)) {
    isGameOver = true;
    const playerPips = tallyHandPips(playerHand);
    const computerPips = tallyHandPips(computerHand);

    let finalSummary = `Board Blocked! Pips remaining: You (${playerPips}), Computer (${computerPips}). `;
    
    if (playerPips < computerPips) {
      const swept = roundToNearestFive(computerPips);
      playerScore += swept;
      finalSummary += `You win lowest count! Swept hand for +${swept} points.`;
      paperTapeHistory.unshift(` [ROUND END] Blocked Game. Player wins lowest pips (${playerPips} vs ${computerPips}). Earned +${swept} pts.`);
    } else if (computerPips < playerPips) {
      const swept = roundToNearestFive(playerPips);
      computerScore += swept;
      finalSummary += `Computer wins lowest count! Swept hand for +${swept} points.`;
      paperTapeHistory.unshift(` [ROUND END] Blocked Game. Computer wins lowest pips (${computerPips} vs ${playerPips}). Earned +${swept} pts.`);
    } else {
      finalSummary += "Dead tie pips. No bonus points awarded.";
      paperTapeHistory.unshift(` [ROUND END] Blocked Game. Absolute pip tie. No points swept.`);
    }
    gameLog = finalSummary;
    return true;
  }
  return false;
}

// --- 9. STRICT Louisiana Scoring Engine ---
function evaluateBoardScore(updateLiveDisplay = false, contextLabel = "") {
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

// --- 10. Handle Placing a Tile onto a Branch ---
function playTileToBranch(branchName) {
  if (selectedTileIndex === null || !isPlayerTurn || isGameOver) return;
  
  const tile = playerHand[selectedTileIndex];
  if (!isValidMove(tile, branchName)) return;

  const tipValue = getBranchTip(branchName);
  const isDouble = (tile[0] === tile[1]);
  
  // LOGIC FIX:
  // If we play on a branch, the 'outerEdge' MUST be the number that 
  // is NOT the tipValue.
  let outerEdge = (tile[0] === tipValue) ? tile[1] : tile[0];
  
  if (isDouble) {
    outerEdge = tile[0];
  }

  // FORCE STORE:
  // We store the tile exactly as the engine expects to read it later.
  board.branches[branchName].push({ 
    tile: tile, 
    outerEdge: outerEdge, 
    isDouble: isDouble 
  });
  
  playerHand.splice(selectedTileIndex, 1);
  selectedTileIndex = null;
 
  const pointsEarned = evaluateBoardScore(true, "PLAYER");
  if (pointsEarned > 0) {
    playerScore += pointsEarned;
    gameLog = `You scored ${pointsEarned} points on the ${branchName} branch!`;
  } else {
    gameLog = `You played on the ${branchName} branch.`;
  }
  
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

    if (isValidMove(drawnTile, "left") || isValidMove(drawnTile, "right") || isValidMove(drawnTile, "up") || isValidMove(drawnTile, "down")) {
      selectedTileIndex = playerHand.length - 1; 
      gameLog = `You pulled [${drawnTile[0]}·${drawnTile[1]}]! It matches! Click an open arrow target.`;
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

  const branchNames = ["left", "right", "up", "down"];
  let legalMoves = [];

  const findLegalMoves = () => {
    let moves = [];
    computerHand.forEach((tile, handIndex) => {
      branchNames.forEach(branchName => {
        if (isValidMove(tile, branchName)) {
          moves.push({ tile, handIndex, branchName });
        }
      });
    });
    return moves;
  };

  legalMoves = findLegalMoves();

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
  let optimizedOrientedTile = null;
  let optimizedOuterEdge = null;
  let optimizedIsDouble = false;

  legalMoves.forEach(move => {
    const tipValue = getBranchTip(move.branchName);
    const isDouble = (move.tile[0] === move.tile[1]);
    
    let innerEdge = tipValue;
    let outerEdge = (move.tile[0] === tipValue) ? move.tile[1] : move.tile[0];
    
    if (isDouble) {
      innerEdge = move.tile[0];
      outerEdge = move.tile[0];
    }

    const simulatedOriented = [innerEdge, outerEdge];
    
    board.branches[move.branchName].push({ tile: [...simulatedOriented], outerEdge: outerEdge, isDouble: isDouble });
    let possibleScore = evaluateBoardScore(false, "");
    board.branches[move.branchName].pop(); 

    if (possibleScore > maximumPointsFound) {
      maximumPointsFound = possibleScore;
      bestMove = move;
      optimizedOrientedTile = simulatedOriented;
      optimizedOuterEdge = outerEdge;
      optimizedIsDouble = isDouble;
    }
  });

  board.branches[bestMove.branchName].push({ 
    tile: optimizedOrientedTile, 
    outerEdge: optimizedOuterEdge,
    isDouble: optimizedIsDouble
  });
  
  const exactIndex = computerHand.findIndex(t => t[0] === bestMove.tile[0] && t[1] === bestMove.tile[1]);
  if (exactIndex !== -1) {
    computerHand.splice(exactIndex, 1);
  }

  const pointsEarned = evaluateBoardScore(true, "COMPUTER");
  let drawContext = tilesDrawnCount > 0 ? `after drawing ${tilesDrawnCount} tiles ` : "";

  if (pointsEarned > 0) {
    computerScore += pointsEarned;
    gameLog = `Computer ${drawContext}scored ${pointsEarned} points on the ${bestMove.branchName} branch!`;
  } else {
    gameLog = `Computer ${drawContext}played on the ${bestMove.branchName} branch.`;
  }

  if (checkWinCondition()) {
    renderGame();
    return;
  }

  isPlayerTurn = true;
  renderGame();
}

// --- 14. Integrated Layout & Interface Pipeline ---
function renderGame() {
  const appDiv = document.getElementById("app");
  appDiv.innerHTML = '<h1 class="game-title">Dominoes Prototype (Louisiana Rules Mode)</h1>';

  const mainframe = document.createElement("div");
  mainframe.className = "mainframe";

  const gameTableSide = document.createElement("div");
  gameTableSide.className = "game-table";

  const diagnosticSide = document.createElement("div");
  diagnosticSide.className = "diagnostic-panel";

  const scoreDiv = document.createElement("div");
  scoreDiv.className = "score-panel";
  scoreDiv.innerHTML = `
    <div class="score-row">
      <div class="score-player">Player Total: ${playerScore}</div>
      <div class="score-computer">Computer Total: ${computerScore}</div>
    </div>
    <div class="score-status">
      🤖 Opponent: ${computerHand.length} tiles · Boneyard: ${boneyard.length}
    </div>
  `;
  gameTableSide.appendChild(scoreDiv);

  const turnBanner = document.createElement("div");
  turnBanner.className = "turn-banner";
  if (isGameOver) {
    turnBanner.classList.add("turn-banner--over");
    turnBanner.textContent = gameLog;
  } else if (isPlayerTurn) {
    turnBanner.classList.add("turn-banner--player");
    turnBanner.textContent = "Your turn — select a tile, then tap a branch";
  } else {
    turnBanner.classList.add("turn-banner--computer");
    turnBanner.textContent = "Computer is thinking…";
  }
  gameTableSide.appendChild(turnBanner);

  const opponentHandDiv = document.createElement("div");
  opponentHandDiv.className = "opponent-rack";

  computerHand.forEach(tile => {
    const card = document.createElement("div");
    card.className = isGameOver ? "opponent-tile opponent-tile--revealed" : "opponent-tile opponent-tile--hidden";
    card.textContent = isGameOver ? `${tile[0]}·${tile[1]}` : "··";
    opponentHandDiv.appendChild(card);
  });
  gameTableSide.appendChild(opponentHandDiv);

  const liveCalcBox = document.createElement("div");
  liveCalcBox.className = "live-calc";
  liveCalcBox.innerHTML = `<span style="color:#555">Live Board Pips:</span> ${liveCalculationText}`;
  gameTableSide.appendChild(liveCalcBox);

  const logBox = document.createElement("p");
  logBox.className = "game-log";
  if (!isGameOver) logBox.textContent = gameLog;
  gameTableSide.appendChild(logBox);

  const boardWrapper = document.createElement("div");
  boardWrapper.className = "board-wrapper";

  const boardScaler = document.createElement("div");
  boardScaler.className = "board-scaler";

  const boardDiv = document.createElement("div");
  boardDiv.className = "board";

  const createTileBadge = (move, isActiveOuterTip, branchName) => {
    const badge = document.createElement("div");
    badge.className = "tile-badge";
    if (move.isDouble) {
      badge.classList.add("tile-badge--double");
      if (isActiveOuterTip) badge.classList.add("tile-badge--double-active");
    } else if (isActiveOuterTip) {
      badge.classList.add("tile-badge--active");
    } else {
      badge.classList.add("tile-badge--inactive");
    }

    if (branchName === "left" || branchName === "up") {
      badge.textContent = `${move.tile[1]}·${move.tile[0]}`;
    } else {
      badge.textContent = `${move.tile[0]}·${move.tile[1]}`;
    }
    return badge;
  };

  const createBreakBadge = () => {
    const breakBadge = document.createElement("div");
    breakBadge.className = "branch-break";
    breakBadge.textContent = "···";
    return breakBadge;
  };

  const renderBranchRoute = (name, pipelineCoords) => {
    const branchArray = board.branches[name];
    const tipValue = getBranchTip(name);

    const maxVisible = 2; 
    const hasHiddenTiles = branchArray.length > maxVisible;
    
    const startIndex = hasHiddenTiles ? branchArray.length - maxVisible : 0;
    const visibleMoves = branchArray.slice(startIndex);

    if (hasHiddenTiles) {
      const breakCoord = pipelineCoords[0];
      const breakIndicator = createBreakBadge();
      breakIndicator.style.gridColumn = breakCoord.col;
      breakIndicator.style.gridRow = breakCoord.row;
      boardDiv.appendChild(breakIndicator);
    }

    visibleMoves.forEach((move, index) => {
      const coordIndex = hasHiddenTiles ? index + 1 : index;
      const coord = pipelineCoords[coordIndex];
      
      const isLatest = (startIndex + index === branchArray.length - 1);
      const badge = createTileBadge(move, isLatest, name);
      badge.style.gridColumn = coord.col;
      badge.style.gridRow = coord.row;
      boardDiv.appendChild(badge);
    });

    const buttonTargetIndex = hasHiddenTiles ? visibleMoves.length + 1 : visibleMoves.length;
    const targetCoord = pipelineCoords[buttonTargetIndex];
    
    if (targetCoord) {
      const slotBtn = document.createElement("button");
      slotBtn.className = "branch-slot";
      slotBtn.style.gridColumn = targetCoord.col;
      slotBtn.style.gridRow = targetCoord.row;
      slotBtn.innerHTML = `${targetCoord.arrow}<br>(${tipValue})`;

      if (selectedTileIndex !== null && isPlayerTurn && !isGameOver) {
        const selectedTile = playerHand[selectedTileIndex];
        if (isValidMove(selectedTile, name)) {
          slotBtn.classList.add("branch-slot--valid");
          slotBtn.onclick = () => playTileToBranch(name);
        } else {
          slotBtn.disabled = true;
          slotBtn.classList.add("branch-slot--hidden");
        }
      } else {
        slotBtn.disabled = true;
        slotBtn.classList.add("branch-slot--dim");
      }
      boardDiv.appendChild(slotBtn);
    }
  };

  const spinnerElement = document.createElement("div");
  spinnerElement.className = "spinner";
  spinnerElement.style.gridColumn = "4";
  spinnerElement.style.gridRow = "4";
  spinnerElement.innerHTML = `⚙️<br>[${board.spinner[0]}·${board.spinner[1]}]`;
  boardDiv.appendChild(spinnerElement);

  // Coordinate Layout Maps
  renderBranchRoute("up", [{ col: "4", row: "3", arrow: "▲" }, { col: "4", row: "2", arrow: "▲" }, { col: "4", row: "1", arrow: "▲" }]);
  renderBranchRoute("left", [{ col: "3", row: "4", arrow: "◄" }, { col: "2", row: "4", arrow: "◄" }, { col: "1", row: "4", arrow: "◄" }]);
  renderBranchRoute("right", [{ col: "5", row: "4", arrow: "►" }, { col: "6", row: "4", arrow: "►" }, { col: "7", row: "4", arrow: "►" }]);
  renderBranchRoute("down", [{ col: "4", row: "5", arrow: "▼" }, { col: "4", row: "6", arrow: "▼" }, { col: "4", row: "7", arrow: "▼" }]);
  
  boardScaler.appendChild(boardDiv);
  boardWrapper.appendChild(boardScaler);
  gameTableSide.appendChild(boardWrapper);

  const playerNeedsToDraw = isPlayerTurn && !hasAnyValidMoves(playerHand) && boneyard.length > 0 && !isGameOver;
  if (playerNeedsToDraw) {
    const drawSection = document.createElement("div");
    drawSection.className = "draw-section";

    const boneLabel = document.createElement("h3");
    boneLabel.textContent = `Boneyard (${boneyard.length} tiles)`;
    drawSection.appendChild(boneLabel);

    const drawActionsWrapper = document.createElement("div");
    drawActionsWrapper.className = "draw-actions";

    const autoBtn = document.createElement("button");
    autoBtn.className = "btn btn-primary";
    autoBtn.textContent = "⚡ Auto-Draw";
    autoBtn.onclick = handlePlayerAutoDraw;
    drawActionsWrapper.appendChild(autoBtn);

    const manualLabel = document.createElement("span");
    manualLabel.textContent = "Or pick manually:";
    manualLabel.style.fontSize = "0.85rem";
    manualLabel.style.fontWeight = "bold";
    drawActionsWrapper.appendChild(manualLabel);
    drawSection.appendChild(drawActionsWrapper);

    const manualPoolContainer = document.createElement("div");
    manualPoolContainer.className = "boneyard-pool";

    boneyard.forEach((tile, bIndex) => {
      const boneBtn = document.createElement("button");
      const isTargeted = (bIndex === selectedBoneyardIndex);
      boneBtn.className = isTargeted ? "btn-boneyard btn-boneyard--selected" : "btn-boneyard";
      boneBtn.textContent = isTargeted ? "Confirm?" : `Tile ${bIndex + 1}`;
      boneBtn.onclick = () => handlePlayerManualDraw(bIndex);
      manualPoolContainer.appendChild(boneBtn);
    });
    drawSection.appendChild(manualPoolContainer);
    gameTableSide.appendChild(drawSection);
  }

  const handContainer = document.createElement("div");
  handContainer.className = "hand-container";

  playerHand.forEach((tile, index) => {
    const tileBtn = document.createElement("button");
    const isSelected = (index === selectedTileIndex);
    tileBtn.className = "hand-tile";
    if (isSelected) tileBtn.classList.add("hand-tile--selected");
    if (!isPlayerTurn || isGameOver) tileBtn.classList.add("hand-tile--disabled");
    tileBtn.textContent = `${tile[0]}·${tile[1]}`;

    if (isPlayerTurn && !isGameOver) {
      tileBtn.onclick = () => {
        selectedTileIndex = isSelected ? null : index;
        renderGame();
      };
    }
    handContainer.appendChild(tileBtn);
  });
  gameTableSide.appendChild(handContainer);

  if (isGameOver) {
    const restartBtn = document.createElement("button");
    restartBtn.className = "btn btn-success";
    restartBtn.textContent = "🔄 Play Next Round";
    restartBtn.onclick = initGame;
    gameTableSide.appendChild(restartBtn);
  }

  diagnosticSide.innerHTML = `<h3 class="diagnostic-title">📋 Scoring Audit Tape</h3>`;

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
  diagnosticSide.appendChild(debugBtn);
  
  const repairBtn = document.createElement("button");
  repairBtn.className = "btn-repair";
  repairBtn.textContent = "🔧 Repair State";
  repairBtn.onclick = () => {
    repairBoardState("UI: State Repair Triggered");
    renderGame();
  };
  diagnosticSide.appendChild(repairBtn);
  
  const tapeContainer = document.createElement("div");
  tapeContainer.className = "tape-container";

  if (paperTapeHistory.length === 0) {
    tapeContainer.innerHTML = `<span style="color:#777">Tape is clean. Make a move to print calculations.</span>`;
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
  diagnosticSide.appendChild(tapeContainer);

  mainframe.appendChild(gameTableSide);
  
  // Only show diagnostic panel on desktop
  if (!isMobileDevice()) {
    mainframe.appendChild(diagnosticSide);
  }
  
  appDiv.appendChild(mainframe);
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
};

window.repairState = function() {
  console.log("\n=== REPAIRING BOARD STATE ===");
  repairBoardState("Manual repair from console");
  console.log("State repaired. Run setState() to verify.");
};

// --- 15. Execution Loop ---
function initGame() {
  isGameOver = false;
  isPlayerTurn = true;
  paperTapeHistory = [];
  liveCalculationText = "No tiles played yet.";
  board.branches = { left: [], right: [], up: [], down: [] };
  board.spinner = null;
  selectedTileIndex = null;
  selectedBoneyardIndex = null;
  
  shuffleBoneyard();
  dealHands();
  handleAutomaticStart();
  renderGame();
}

initGame();