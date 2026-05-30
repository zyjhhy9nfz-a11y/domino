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
  appDiv.innerHTML = "<h1>Dominoes Prototype (Louisiana Rules Mode)</h1>";

  const mainframe = document.createElement("div");
  mainframe.style.display = "flex";
  mainframe.style.gap = "25px";
  mainframe.style.flexWrap = "wrap";
  mainframe.style.justifyContent = "center";

  const gameTableSide = document.createElement("div");
  gameTableSide.style.flex = "2";
  gameTableSide.style.minWidth = "320px";
  gameTableSide.style.maxWidth = "500px";

  const diagnosticSide = document.createElement("div");
  diagnosticSide.style.flex = "1";
  diagnosticSide.style.minWidth = "260px";
  diagnosticSide.style.background = "#1c1c1e";
  diagnosticSide.style.color = "#3aee3a";
  diagnosticSide.style.fontFamily = "monospace";
  diagnosticSide.style.padding = "15px";
  diagnosticSide.style.borderRadius = "8px";
  diagnosticSide.style.boxShadow = "inset 0 0 10px #000";

  // Dashboard Summary Layout
  const scoreDiv = document.createElement("div");
  scoreDiv.style.background = "#f4f4f6";
  scoreDiv.style.border = "1px solid #ccc";
  scoreDiv.style.padding = "12px";
  scoreDiv.style.borderRadius = "6px";
  scoreDiv.style.fontWeight = "bold";
  scoreDiv.style.fontSize = "1.05rem";
  scoreDiv.style.textAlign = "center";
  scoreDiv.innerHTML = `
    <div style="display:flex; justify-content:space-around; margin-bottom:8px;">
      <div style="color:#0055cc">Player Total: ${playerScore}</div>
      <div style="color:#cc2200">Computer Total: ${computerScore}</div>
    </div>
    <div style="font-size:0.95rem; color:#111; border-top:1px solid #bbb; padding-top:6px; font-weight:800;">
      🤖 Opponent Status: ${computerHand.length} Tiles Held
    </div>
  `;
  gameTableSide.appendChild(scoreDiv);

  // Hidden Opponent Hand Rack
  const opponentHandDiv = document.createElement("div");
  opponentHandDiv.style.display = "flex";
  opponentHandDiv.style.gap = "6px";
  opponentHandDiv.style.justifyContent = "center";
  opponentHandDiv.style.margin = "12px 0";

  computerHand.forEach(tile => {
    const card = document.createElement("div");
    card.style.border = "2px solid #333333";
    card.style.borderRadius = "5px";
    card.style.padding = "8px 12px";
    card.style.fontSize = "0.9rem";
    card.style.fontWeight = "bold";
    card.style.textAlign = "center";
    card.style.minWidth = "24px";
    card.style.height = "18px";
    card.style.boxShadow = "0 2px 4px rgba(0,0,0,0.15)";

    if (isGameOver) {
      card.style.background = "#ffffff";
      card.style.color = "#d9381e";
      card.textContent = `${tile[0]}·${tile[1]}`;
    } else {
      card.style.background = "#ffffff";
      card.style.color = "transparent";
      card.textContent = "··"; 
    }
    opponentHandDiv.appendChild(card);
  });
  gameTableSide.appendChild(opponentHandDiv);

  const liveCalcBox = document.createElement("div");
  liveCalcBox.style.margin = "10px 0";
  liveCalcBox.style.padding = "8px";
  liveCalcBox.style.background = "#eef6ff";
  liveCalcBox.style.borderLeft = "4px solid #007aff";
  liveCalcBox.style.fontWeight = "600";
  liveCalcBox.style.fontSize = "0.95rem";
  liveCalcBox.style.color = "#000000";
  liveCalcBox.innerHTML = `<span style="color:#555">Live Board Pips:</span> ${liveCalculationText}`;
  gameTableSide.appendChild(liveCalcBox);

  const logBox = document.createElement("p");
  logBox.style.fontStyle = "italic";
  logBox.style.margin = "10px 0";
  logBox.style.minHeight = "35px";
  logBox.style.fontWeight = "bold";
  logBox.textContent = gameLog;
  gameTableSide.appendChild(logBox);

  // Board Matrix Configuration Node
  const boardDiv = document.createElement("div");
  boardDiv.style.display = "grid";
  boardDiv.style.gridTemplateColumns = "55px 55px 55px 75px 55px 55px 55px";
  boardDiv.style.gridTemplateRows = "45px 45px 45px 65px 45px 45px 45px";
  boardDiv.style.gap = "5px";
  boardDiv.style.justifyContent = "center";
  boardDiv.style.alignItems = "center";
  boardDiv.style.margin = "15px auto";

  const createTileBadge = (move, isActiveOuterTip, branchName) => {
    const badge = document.createElement("div");
    badge.style.border = "2px solid #333333";
    badge.style.borderRadius = "5px";
    badge.style.padding = "4px 2px";
    
    if (move.isDouble) {
      badge.style.background = isActiveOuterTip ? "#fff4de" : "#eadeca";
      badge.style.border = "2px solid #b07d00";
    } else {
      badge.style.background = isActiveOuterTip ? "#ffffff" : "#e0e0e0";
    }
    
    badge.style.color = "#000000";
    badge.style.fontWeight = "bold";
    badge.style.fontSize = "0.85rem";
    badge.style.textAlign = "center";
    if (!isActiveOuterTip) badge.style.opacity = "0.5";
    
    // VISUAL RENDERING SHIFT FIXED HERE:
    // The data is universally [inner, outer]. For Left and Up tracks, flip text to point outwards.
    if (branchName === "left" || branchName === "up") {
      badge.textContent = `${move.tile[1]}·${move.tile[0]}`;
    } else {
      badge.textContent = `${move.tile[0]}·${move.tile[1]}`;
    }
    return badge;
  };

  const createBreakBadge = () => {
    const breakBadge = document.createElement("div");
    breakBadge.style.color = "#888888";
    breakBadge.style.fontWeight = "bold";
    breakBadge.style.fontSize = "1.2rem";
    breakBadge.style.textPadding = "center";
    breakBadge.style.letterSpacing = "2px";
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
      slotBtn.style.gridColumn = targetCoord.col;
      slotBtn.style.gridRow = targetCoord.row;
      slotBtn.style.height = "85%";
      slotBtn.style.border = "2px dashed #333333";
      slotBtn.style.borderRadius = "5px";
      slotBtn.style.background = "transparent";
      slotBtn.style.color = "#333333";
      slotBtn.style.cursor = (!isGameOver && isPlayerTurn) ? "pointer" : "not-allowed";
      slotBtn.style.fontSize = "0.75rem";
      slotBtn.innerHTML = `${targetCoord.arrow}<br>(${tipValue})`;

      if (selectedTileIndex !== null && isPlayerTurn && !isGameOver) {
        const selectedTile = playerHand[selectedTileIndex];
        if (isValidMove(selectedTile, name)) {
          slotBtn.style.background = "rgba(40, 167, 69, 0.2)";
          slotBtn.style.border = "2px solid #28a745";
          slotBtn.style.color = "#155724";
          slotBtn.onclick = () => playTileToBranch(name);
        } else {
          slotBtn.disabled = true;
          slotBtn.style.opacity = "0.1";
        }
      } else {
        slotBtn.disabled = true;
        slotBtn.style.opacity = "0.3"; 
      }
      boardDiv.appendChild(slotBtn);
    }
  };

  // Center Spinner Badge Assembly
  const spinnerElement = document.createElement("div");
  spinnerElement.style.gridColumn = "4";
  spinnerElement.style.gridRow = "4";
  spinnerElement.style.border = "2px solid #333333";
  spinnerElement.style.borderRadius = "6px";
  spinnerElement.style.padding = "6px 2px";
  spinnerElement.style.background = "#ffffff";
  spinnerElement.style.color = "#000000";
  spinnerElement.style.fontWeight = "bold";
  spinnerElement.style.textAlign = "center";
  spinnerElement.style.fontSize = "0.9rem";
  spinnerElement.innerHTML = `⚙️<br>[${board.spinner[0]}·${board.spinner[1]}]`;
  boardDiv.appendChild(spinnerElement);

  // Coordinate Layout Maps
  renderBranchRoute("up", [{ col: "4", row: "3", arrow: "▲" }, { col: "4", row: "2", arrow: "▲" }, { col: "4", row: "1", arrow: "▲" }]);
  renderBranchRoute("left", [{ col: "3", row: "4", arrow: "◄" }, { col: "2", row: "4", arrow: "◄" }, { col: "1", row: "4", arrow: "◄" }]);
  renderBranchRoute("right", [{ col: "5", row: "4", arrow: "►" }, { col: "6", row: "4", arrow: "►" }, { col: "7", row: "4", arrow: "►" }]);
  renderBranchRoute("down", [{ col: "4", row: "5", arrow: "▼" }, { col: "4", row: "6", arrow: "▼" }, { col: "4", row: "7", arrow: "▼" }]);
  
  gameTableSide.appendChild(boardDiv);

  // Drawing Deck Pipeline Elements
  const playerNeedsToDraw = isPlayerTurn && !hasAnyValidMoves(playerHand) && boneyard.length > 0 && !isGameOver;
  if (playerNeedsToDraw) {
    const drawSection = document.createElement("div");
    drawSection.style.background = "#fff0f0";
    drawSection.style.border = "1px solid #ffcccc";
    drawSection.style.padding = "10px";
    drawSection.style.borderRadius = "6px";
    drawSection.style.marginTop = "15px";

    const boneLabel = document.createElement("h3");
    boneLabel.textContent = `Boneyard Pool (${boneyard.length} tiles available)`;
    boneLabel.style.color = "#d9381e";
    boneLabel.style.margin = "0 0 10px 0";
    drawSection.appendChild(boneLabel);

    const drawActionsWrapper = document.createElement("div");
    drawActionsWrapper.style.display = "flex";
    drawActionsWrapper.style.gap = "10px";
    drawActionsWrapper.style.alignItems = "center";
    drawActionsWrapper.style.flexWrap = "wrap";

    const autoBtn = document.createElement("button");
    autoBtn.textContent = "⚡ Instant Auto-Draw";
    autoBtn.style.padding = "8px 12px";
    autoBtn.style.border = "none";
    autoBtn.style.borderRadius = "5px";
    autoBtn.style.background = "#007aff";
    autoBtn.style.color = "#ffffff";
    autoBtn.style.fontWeight = "bold";
    autoBtn.style.cursor = "pointer";
    autoBtn.onclick = handlePlayerAutoDraw;
    drawActionsWrapper.appendChild(autoBtn);

    const manualLabel = document.createElement("span");
    manualLabel.textContent = "Or pick manually below:";
    manualLabel.style.fontSize = "0.85rem";
    manualLabel.style.fontWeight = "bold";
    drawActionsWrapper.appendChild(manualLabel);
    drawSection.appendChild(drawActionsWrapper);

    const manualPoolContainer = document.createElement("div");
    manualPoolContainer.style.display = "flex";
    manualPoolContainer.style.gap = "6px";
    manualPoolContainer.style.flexWrap = "wrap";
    manualPoolContainer.style.marginTop = "10px";

    boneyard.forEach((tile, bIndex) => {
      const boneBtn = document.createElement("button");
      const isTargeted = (bIndex === selectedBoneyardIndex);
      boneBtn.style.background = isTargeted ? "#d9381e" : "#555555";
      boneBtn.style.color = "#ffffff";
      boneBtn.style.border = "none";
      boneBtn.style.borderRadius = "4px";
      boneBtn.style.padding = "6px 10px";
      boneBtn.style.fontSize = "0.8rem";
      boneBtn.style.cursor = "pointer";
      boneBtn.textContent = isTargeted ? "Confirm?" : `Tile ${bIndex + 1}`;
      boneBtn.onclick = () => handlePlayerManualDraw(bIndex);
      manualPoolContainer.appendChild(boneBtn);
    });
    drawSection.appendChild(manualPoolContainer);
    gameTableSide.appendChild(drawSection);
  }

  // Hand Interface
  const handContainer = document.createElement("div");
  handContainer.style.display = "flex";
  handContainer.style.gap = "8px";
  handContainer.style.justifyContent = "center";
  handContainer.style.flexWrap = "wrap";
  handContainer.style.marginTop = "20px";

  playerHand.forEach((tile, index) => {
    const tileBtn = document.createElement("button");
    const isSelected = (index === selectedTileIndex);
    
    tileBtn.style.color = "#000000"; 
    tileBtn.style.background = "#ffffff"; 
    tileBtn.style.border = isSelected ? "3px solid #007aff" : "2px solid #333333";
    tileBtn.style.borderRadius = "6px";
    tileBtn.style.padding = "10px 14px";
    tileBtn.style.fontWeight = "bold";
    tileBtn.style.fontSize = "1.1rem";
    tileBtn.style.boxShadow = "0 2px 4px rgba(0,0,0,0.1)";
    tileBtn.style.cursor = (isPlayerTurn && !isGameOver) ? "pointer" : "not-allowed";
    
    if (!isPlayerTurn || isGameOver) {
      tileBtn.style.opacity = "0.7";
      tileBtn.style.background = "#f0f0f0";
    }
    
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
    restartBtn.textContent = "🔄 Play Next Round";
    restartBtn.style.display = "block";
    restartBtn.style.margin = "20px auto";
    restartBtn.style.padding = "12px 24px";
    restartBtn.style.background = "#28a745";
    restartBtn.style.color = "#fff";
    restartBtn.style.border = "none";
    restartBtn.style.borderRadius = "6px";
    restartBtn.style.fontWeight = "bold";
    restartBtn.style.fontSize = "1.1rem";
    restartBtn.style.cursor = "pointer";
    restartBtn.onclick = initGame;
    gameTableSide.appendChild(restartBtn);
  }

  diagnosticSide.innerHTML = `<h3 style="margin-top:0; border-bottom: 1px solid #3aee3a; padding-bottom:5px; color:#fff;">📋 Scoring Audit Tape</h3>`;
  
  // ADD DEBUG INFO BUTTON
  const debugBtn = document.createElement("button");
  debugBtn.textContent = "🔍 Debug State";
  debugBtn.style.background = "#444";
  debugBtn.style.color = "#3aee3a";
  debugBtn.style.border = "1px solid #3aee3a";
  debugBtn.style.borderRadius = "4px";
  debugBtn.style.padding = "6px 10px";
  debugBtn.style.fontSize = "0.75rem";
  debugBtn.style.marginBottom = "10px";
  debugBtn.style.cursor = "pointer";
  debugBtn.style.fontWeight = "bold";
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
  repairBtn.textContent = "🔧 Repair State";
  repairBtn.style.background = "#662200";
  repairBtn.style.color = "#ffaa00";
  repairBtn.style.border = "1px solid #ffaa00";
  repairBtn.style.borderRadius = "4px";
  repairBtn.style.padding = "6px 10px";
  repairBtn.style.fontSize = "0.75rem";
  repairBtn.style.marginBottom = "10px";
  repairBtn.style.marginLeft = "6px";
  repairBtn.style.cursor = "pointer";
  repairBtn.style.fontWeight = "bold";
  repairBtn.onclick = () => {
    repairBoardState("UI: State Repair Triggered");
    renderGame();
  };
  diagnosticSide.appendChild(repairBtn);
  
  const tapeContainer = document.createElement("div");
  tapeContainer.style.maxHeight = "450px";
  tapeContainer.style.overflowY = "auto";
  tapeContainer.style.fontSize = "0.85rem";
  tapeContainer.style.lineHeight = "1.4";

  if (paperTapeHistory.length === 0) {
    tapeContainer.innerHTML = `<span style="color:#777">Tape is clean. Make a move to print calculations.</span>`;
  } else {
    paperTapeHistory.forEach(entry => {
      const line = document.createElement("div");
      line.style.marginBottom = "8px";
      line.style.borderBottom = "1px dashed #333";
      line.style.paddingBottom = "4px";
      
      if (entry.includes("Scored") || entry.includes("Swept")) {
        line.style.color = "#00ffcc";
        line.style.fontWeight = "bold";
      } else if (entry.includes("PLAYER")) {
        line.style.color = "#e5c158";
      } else if (entry.includes("COMPUTER")) {
        line.style.color = "#a2b4ff";
      } else if (entry.includes("ROUND END")) {
        line.style.color = "#ff4d4d";
        line.style.fontWeight = "bold";
      }
      
      line.textContent = entry;
      tapeContainer.appendChild(line);
    });
  }
  diagnosticSide.appendChild(tapeContainer);

  mainframe.appendChild(gameTableSide);
  mainframe.appendChild(diagnosticSide);
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