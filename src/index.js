import "./style.css";

const createShip = (length) => {
  let hitbox = [];
  const hp = length;
  let hitCount = 0;

  const resetHitbox = () => {
    hitbox = [];
  };

  const hit = () => {
    hitCount++;
  };

  const pushCoord = (row, col) => {
    hitbox.push(`${row}${col}`);
  };

  const isSunk = () => {
    return hp === hitCount;
  };

  return {
    get hitbox() {
      return hitbox;
    },
    resetHitbox,
    pushCoord,
    length,
    hit,
    isSunk,
  };
};

const createGameBoard = () => {
  const BOARD_SIZE = 10;
  let initShipCoord = [];

  const createBoard = () => {
    let board = [];
    for (let i = 0; i < BOARD_SIZE; i++) {
      board.push([]);
    }
    board.forEach((row) => {
      for (let i = 0; i < BOARD_SIZE; i++) {
        row.push({ hasShip: false, hasShot: false });
      }
    });
    return board;
  };

  let board = createBoard();

  const checkSpace = (row, col, length, vert) => {
    if (vert) {
      // return true if within bound
      return row >= 0 && row + length - 1 < BOARD_SIZE;
    } else {
      return col >= 0 && col + length - 1 < BOARD_SIZE;
    }
  };

  const checkCollision = (row, col, length, vert = true, shipObject = null) => {
    // return true if no collision
    if (vert) {
      for (let i = row; i < row + length; i++) {
        if (shipObject !== null) {
          if (
            board[i][col]["hasShip"] &&
            board[i][col]["hasShip"] !== shipObject
          )
            return false;
        } else {
          if (board[i][col]["hasShip"]) return false;
        }
      }
    } else {
      for (let j = col; j < col + length; j++) {
        if (shipObject !== null) {
          if (
            board[row][j]["hasShip"] &&
            board[row][j]["hasShip"] !== shipObject
          )
            return false;
        } else {
          if (board[row][j]["hasShip"]) return false;
        }
      }
    }
    return true;
  };

  const checkPosition = (row, col, length, vert = true, shipObject = null) => {
    if (!checkSpace(row, col, length, vert)) return false;
    if (!checkCollision(row, col, length, vert, shipObject)) return false;
    return true;
  };

  const placeShip = (shipObject, row, col, vert = true) => {
    const length = shipObject.length;
    if (!checkPosition(row, col, length, vert)) return false;
    initShipCoord.push({
      row: row,
      col: col,
      length: length,
      vert: vert,
    });
    if (vert) {
      for (let i = row; i < row + length; i++) {
        board[i][col]["hasShip"] = shipObject;
        shipObject.pushCoord(i, col);
      }
    } else {
      for (let j = col; j < col + length; j++) {
        board[row][j]["hasShip"] = shipObject;
        shipObject.pushCoord(row, j);
      }
    }
    return true;
  };

  const receiveAttack = (row, col) => {
    if (!board[row][col]["hasShot"] === false) return false;
    board[row][col]["hasShot"] = true;
    let potentialShipObj = board[row][col]["hasShip"];
    if (!potentialShipObj !== false) return false;
    potentialShipObj.hit();
    return true;
  };
  return {
    get board() {
      return board;
    },
    get BOARD_SIZE() {
      return BOARD_SIZE;
    },
    get initShipPlacement() {
      return initShipCoord;
    },
    placeShip,
    receiveAttack,
    checkPosition,
  };
};

const humanPlayer = () => {
  const mode = "human";
  let moveHistory = [];
  const checkNoRepeatMove = (row, col) => {
    return !moveHistory.includes(`${row}${col}`);
  };
  const registerMove = (row, col) => {
    moveHistory.push(`${row}${col}`);
  };

  return {
    get mode() {
      return mode;
    },
    get moveHistory() {
      return moveHistory;
    },
    registerMove,
    checkNoRepeatMove,
  };
};

const computerPlayer = () => {
  let moveHistory = [];
  const mode = "computer";
  let hitHistory = [];
  let triedDirection = [];
  let potentialMovesSets = [];

  const checkNoRepeatMove = (row, col) => {
    return !moveHistory.includes(`${row}${col}`);
  };

  const registerMove = (row, col) => {
    moveHistory.push(`${row}${col}`);
  };

  const randomCheckerMove = () => {
    let row = Math.floor(Math.random() * 10);
    let col = null;
    if (row % 2 == 0) {
      col = Math.floor(Math.random() * 5) * 2;
    } else {
      col = Math.floor(Math.random() * 5) * 2 + 1;
    }
    return [row, col];
  };

  const registerHit = (row, col) => {
    hitHistory.push(`${row}${col}`);
  };

  const checkInBoundMove = (row, col) => {
    const BOARD_SIZE = 10;
    return 0 <= row && row < BOARD_SIZE && 0 <= col && col < BOARD_SIZE;
  };

  const randomDirection = () => {
    let vert = null;
    let inc = null;
    Math.round(Math.random()) == 1 ? (vert = true) : (vert = false);
    Math.round(Math.random()) == 1 ? (inc = 1) : (inc = -1);
    return [inc, vert];
  };

  const seekDirectionMove = () => {
    let row = parseInt(hitHistory[0][0]);
    let col = parseInt(hitHistory[0][1]);

    if (triedDirection.length === 0) {
      triedDirection = randomDirection();
      potentialMovesSets = getFourDirCoord(
        row,
        col,
        triedDirection[0],
        triedDirection[1]
      );
    }
    let i = 0;
    let j = 0;
    while (i < 4) {
      if (potentialMovesSets[i].length === 0) {
        i++;
        continue;
      }
      if (
        potentialMovesSets[i].every((move) =>
          moveHistory.includes(`${move[0]}${move[1]}`)
        )
      ) {
        i++;
        continue;
      }
      for (const move of potentialMovesSets[i]) {
        let strMove = `${move[0]}${move[1]}`;
        if (moveHistory.includes(strMove) && !hitHistory.includes(strMove)) {
          i++;
          break;
        } else if (!moveHistory.includes(strMove)) {
          return move;
        }
      }
    }
  };

  const createPotentialCoord = (row, col, inc, vert) => {
    let arr = [];
    let newRow = row;
    let newCol = col;
    for (let i = 1; i < 5; i++) {
      if (vert) {
        newRow += inc;
      } else {
        newCol += inc;
      }

      if (!checkInBoundMove(newRow, newCol)) {
        break;
      }
      arr.push([newRow, newCol]);
    }
    return arr;
  };

  const getFourDirCoord = (row, col, inc, vert) => {
    const arr1 = createPotentialCoord(row, col, inc, vert);
    const arr2 = createPotentialCoord(row, col, -inc, vert);
    const arr3 = createPotentialCoord(row, col, -inc, !vert);
    const arr4 = createPotentialCoord(row, col, inc, !vert);
    let output = [arr1, arr2, arr3, arr4];
    return output;
  };

  const shoot = () => {
    let coord = null;
    if (hitHistory.length === 0) {
      coord = randomCheckerMove();
    } else {
      coord = seekDirectionMove();
    }
    console.log(coord);
    let [row, col] = coord;
    while (!checkNoRepeatMove(row, col) || !checkInBoundMove(row, col)) {
      if (hitHistory.length === 0) {
        coord = randomCheckerMove();
      } else {
        coord = seekDirectionMove();
      }
      console.log(coord);
      [row, col] = coord;
    }
    return [row, col];
  };

  const clearMemoryWhenSunkShip = (ship) => {
    for (let coord of ship.hitbox) {
      hitHistory.splice(hitHistory.indexOf(coord), 1);
    }
    triedDirection = [];
  };

  return {
    get mode() {
      return mode;
    },
    get moveHistory() {
      return moveHistory;
    },
    registerHit,
    shoot,
    registerMove,
    clearMemoryWhenSunkShip,
  };
};

const gameControl = () => {
  const randomPlaceShipsOnBoard = (ships, board) => {
    for (const ship of ships) {
      let [row, col, vert] = generateCoordAlign();
      while (!board.placeShip(ship, row, col, vert)) {
        [row, col, vert] = generateCoordAlign();
      }
    }
  };

  const shipSizeGroup = [5, 4, 3, 3, 2];

  const createShipLoop = (groupSize) => {
    let group = [];
    for (let size of groupSize) {
      let ship = createShip(size);
      group.push(ship);
    }
    return group;
  };

  let p1Ships = createShipLoop(shipSizeGroup);
  let p2Ships = createShipLoop(shipSizeGroup);

  const generateCoordAlign = () => {
    let row = Math.floor(Math.random() * 10);
    let col = Math.floor(Math.random() * 10);
    let vert = null;
    Math.random() > 0.5 ? (vert = true) : (vert = false);
    return [row, col, vert];
  };

  const initiateGame = () => {
    const player1 = humanPlayer();
    const player2 = computerPlayer();
    const p1Board = createGameBoard();
    const p2Board = createGameBoard();
    randomPlaceShipsOnBoard(p1Ships, p1Board);
    randomPlaceShipsOnBoard(p2Ships, p2Board);
    return [player1, player2, p1Board, p2Board];
  };

  const updateBoard = (board, ShipNum, newRow, newCol, rotate = false) => {
    let { length, vert } = board.initShipPlacement[ShipNum];
    let currShipObj = p1Ships[ShipNum];
    for (let coord of currShipObj.hitbox) {
      let row = parseInt(coord[0]);
      let col = parseInt(coord[1]);
      board.board[row][col]["hasShip"] = false;
    }
    currShipObj.resetHitbox();
    if (rotate) vert = !vert;
    board.initShipPlacement[ShipNum]["vert"] = vert;
    if (vert) {
      for (let i = newRow; i < newRow + length; i++) {
        board.board[i][newCol]["hasShip"] = currShipObj;
        currShipObj.pushCoord(i, newCol);
      }
    } else {
      for (let j = newCol; j < newCol + length; j++) {
        board.board[newRow][j]["hasShip"] = currShipObj;
        currShipObj.pushCoord(newRow, j);
      }
    }
    console.log(currShipObj.hitbox);
  };

  let [p1, p2, p1Board, p2Board] = initiateGame();

  //remember to set ship draggable to false after game has been initiated

  /*
  normal mode: 
  player move
  register move
  check if hit, if so, if ship sunk 
  check if win
  computer move 
  register move
  check if hit, if so, register hit
  check if sunk, if so, register sunk
  check if win 
  */

  const checkWin = (ships) => {
    for (let shipObj of ships) {
      if (!shipObj.isSunk()) return false;
    }
    return true;
  };

  const p1Move = (row, col) => {
    if (!p1.checkNoRepeatMove(row, col)) return false;
    p1.registerMove(row, col);
    return true;
  };

  const p2Move = () => {
    let [row, col] = p2.shoot();
    p2.registerMove(row, col);
    return [row, col];
  };

  return {
    get p1Ships() {
      return p1Ships;
    },
    get p2Ships() {
      return p2Ships;
    },
    get p1Board() {
      return p1Board;
    },
    get p2Board() {
      return p2Board;
    },
    get p2() {
      return p2;
    },
    initiateGame,
    updateBoard,
    p1Move,
    p2Move,
    checkWin,
  };
};

const domControl = () => {
  let game = gameControl();

  const container = document.querySelector(".container");

  const SELF_BOARD_GRID = "selfGrids";
  const OPP_BOARD_GRID = "oppGrids";

  const getDivIdNum = (div, index = -1) => {
    if (index < 0) return parseInt(div.id.charAt(div.id.length + index));
    else return parseInt(div.id.charAt(index));
  };

  const makeGrid = (parentDiv, size, classname = null) => {
    let domBoard = [];
    for (let i = 0; i < size; i++) {
      let row = [];
      for (let j = 0; j < size; j++) {
        let grid = document.createElement("div");
        grid.classList.add("squareDiv");
        grid.setAttribute("id", `${classname}${i}${j}`);
        parentDiv.appendChild(grid);
        if (classname) grid.classList.add(classname);
        row.push(grid);
      }
      domBoard.push(row);
    }
    return domBoard;
  };

  const makeBoard = (boardDiv, size, boardId = null, gridClass = null) => {
    if (boardId) boardDiv.setAttribute("id", boardId);
    boardDiv.classList.add("boardContainer");
    let domBoard = makeGrid(boardDiv, size, gridClass);
    container.appendChild(boardDiv);
    return domBoard;
  };

  let selfBoard = document.createElement("div");
  let domSelfBoard = makeBoard(
    selfBoard,
    createGameBoard().BOARD_SIZE,
    "selfBoard",
    SELF_BOARD_GRID
  );

  // initial placement of the ships on the dom
  for (let i = 0; i < game.p1Board.initShipPlacement.length; i++) {
    let coord = game.p1Board.initShipPlacement[i];
    let shipOnScreen = document.createElement("div");
    shipOnScreen.classList.add("ship");
    shipOnScreen.setAttribute("id", `p1Ship${i}`);
    coord["vert"]
      ? (shipOnScreen.style.height = `${(coord["length"] - 1) * 3 + 2.9}rem`)
      : (shipOnScreen.style.width = `${(coord["length"] - 1) * 3 + 2.9}rem`);
    shipOnScreen.setAttribute("draggable", true);
    domSelfBoard[coord["row"]][coord["col"]].appendChild(shipOnScreen);
  }

  //eventlisteners
  let currShipHead = { row: null, col: null };
  let startCursorPos = { row: null, col: null };
  let offset = { x: null, y: null };

  const clickRotateShip = (e) => {
    let currDiv = e.currentTarget;
    let shipNum = getDivIdNum(currDiv);
    let shipCoord = currDiv.parentElement;
    currShipHead["row"] = getDivIdNum(shipCoord, -2);
    currShipHead["col"] = getDivIdNum(shipCoord);
    if (
      checkDomShipPosition(
        currShipHead["row"],
        currShipHead["col"],
        currDiv,
        true
      )
    ) {
      console.log("passed position test (rotate)");
      let temp = currDiv.style.height;
      currDiv.style.height = currDiv.style.width;
      currDiv.style.width = temp;
      game.updateBoard(
        game.p1Board,
        shipNum,
        currShipHead["row"],
        currShipHead["col"],
        true
      );
    } else {
      currDiv.classList.toggle("shipFail");
      setTimeout(() => currDiv.classList.toggle("shipFail"), 500);
      console.log("failed position test (rotate)");
    }
  };

  const makeCross = (div) => {
    let moveIndicator = document.createElement("p");
    moveIndicator.innerText = "X";
    moveIndicator.classList.add("indicatorBase");
    div.appendChild(moveIndicator);
    return moveIndicator;
  };

  const sunkShipDom = (shipObj, GRID) => {
    if (!shipObj.isSunk()) return false;
    for (let coord of shipObj.hitbox) {
      let grid = document.querySelector(`#${GRID}${coord}`);
      grid.classList.add("hit");
      let firstChildDiv = grid.firstChild;
      if (firstChildDiv.classList.contains("ship")) {
        grid.removeChild(firstChildDiv);
      }
    }
    return true;
  };

  const p1AttackFlowOnDOM = (row, col, div) => {
    if (!game.p1Move(row, col)) return false;
    let moveIndicator = makeCross(div);
    if (game.p2Board.receiveAttack(row, col)) {
      console.log("P1 Hit!");
      moveIndicator.classList.add("indicatorHit");
      let shipObj = game.p2Board.board[row][col]["hasShip"];
      if (sunkShipDom(shipObj, OPP_BOARD_GRID)) console.log("P1 Sunk a ship");
    }
    return true;
  };

  const replayButtonOnDOM = () => {
    const replayButton = document.createElement("button");
    replayButton.innerText = "Replay Game";
    const oppBoard = document.querySelector("#oppBoard");
    oppBoard.appendChild(replayButton);
    replayButton.addEventListener("click", replayGame);
  };

  const replayGame = () => {
    const container = document.querySelector(".container");
    const prompt = document.querySelector(".prompt");
    container.innerHTML = "";
    prompt.innerText = "";
    domControl();
  };

  const prompt = document.querySelector(".prompt");

  const computerAttackFlow = () => {
    let [row, col] = game.p2Move();
    let p1grid = document.querySelector(`#${SELF_BOARD_GRID}${row}${col}`);
    let moveIndicator = makeCross(p1grid);
    if (game.p1Board.receiveAttack(row, col)) {
      console.log("P2 hit");
      moveIndicator.classList.add("indicatorHit");
      game.p2.registerHit(row, col);
      let shipObj = game.p1Board.board[row][col]["hasShip"];
      if (sunkShipDom(shipObj, SELF_BOARD_GRID)) {
        console.log("P2 Sunk a Ship");
        game.p2.clearMemoryWhenSunkShip(shipObj);
      }
    }
  };

  const normalGameTurn = (e) => {
    if (game.checkWin(game.p2Ships) || game.checkWin(game.p1Ships)) return;
    let gridDiv = e.currentTarget;
    let rowAttack = getDivIdNum(gridDiv, -2);
    let colAttack = getDivIdNum(gridDiv);
    if (!p1AttackFlowOnDOM(rowAttack, colAttack, gridDiv)) return;
    if (game.checkWin(game.p2Ships)) {
      prompt.innerText = "You Won!";
      let replayButton = replayButtonOnDOM();
      return;
    } else {
      computerAttackFlow();
      if (game.checkWin(game.p1Ships)) {
        prompt.innerText = "You Lose!";
        let replayButton = replayButtonOnDOM();
        return;
      }
    }
  };

  const dragStart = (e) => {
    let currDiv = e.currentTarget;
    currDiv.classList.add("hold");
    // we need a small delay to make sure
    // ship is not invis at the time of dragging
    let shipCoord = currDiv.parentElement;
    currShipHead["row"] = getDivIdNum(shipCoord, -2);
    currShipHead["col"] = getDivIdNum(shipCoord);
    setTimeout(() => (currDiv.className = "invisible"), 2);
  };

  const dragEnd = (e) => {
    //after finishing holding the ship, it needs to not invis
    let currDiv = e.currentTarget;
    currShipHead = { row: null, col: null };
    startCursorPos = { row: null, col: null };
    offset = { x: null, y: null };
    currDiv.className = "ship";
  };

  const dragOver = (e) => {
    e.preventDefault();
    e.currentTarget.classList.add("over");
  };

  const dragEnter = (e) => {
    // the first cell that it enters is almost always where the
    // cursor is
    e.preventDefault();
    let currDiv = e.currentTarget;
    if (startCursorPos["row"] == null) {
      startCursorPos["row"] = getDivIdNum(currDiv, -2);
      startCursorPos["col"] = getDivIdNum(currDiv);
    }
    e.currentTarget.classList.add("hovered");
  };

  const dragLeave = (e) => {
    e.currentTarget.className = `squareDiv ${SELF_BOARD_GRID}`;
  };

  const dragDrop = (e) => {
    // this e is the new cell
    let currDiv = e.currentTarget;
    e.currentTarget.className = `squareDiv ${SELF_BOARD_GRID}`;
    let shipDiv = document.querySelector(".invisible");
    offset["y"] = startCursorPos["row"] - currShipHead["row"];
    offset["x"] = startCursorPos["col"] - currShipHead["col"];
    let endRow = getDivIdNum(currDiv, -2);
    let endCol = getDivIdNum(currDiv);
    let correctedRow = endRow - offset["y"];
    let correctedCol = endCol - offset["x"];
    let shipNum = getDivIdNum(shipDiv);
    if (checkDomShipPosition(correctedRow, correctedCol, shipDiv)) {
      console.log("passed position test");
      let correctedCell = document.querySelector(
        `#${SELF_BOARD_GRID}${correctedRow}${correctedCol}`
      );
      correctedCell.append(shipDiv);
      game.updateBoard(game.p1Board, shipNum, correctedRow, correctedCol);
    } else {
      shipDiv.classList.toggle("shipFail");
      setTimeout(() => shipDiv.classList.toggle("shipFail"), 50);
      console.log("failed check (bound or collision)");
      let originalCell = document.querySelector(
        `#${SELF_BOARD_GRID}${currShipHead["row"]}${currShipHead["col"]}`
      );
      originalCell.append(shipDiv);
      game.updateBoard(
        game.p1Board,
        shipNum,
        currShipHead["row"],
        currShipHead["col"]
      );
    }
  };

  const getCurrShipPosInfo = (shipNum) => {
    let info = game.p1Board.initShipPlacement[shipNum];
    return {
      length: info["length"],
      vert: info["vert"],
    };
  };

  const checkDomShipPosition = (row, col, shipDiv, rotate = false) => {
    let shipNum = getDivIdNum(shipDiv);
    console.log(shipNum);
    let currShipObj = game.p1Ships[shipNum];
    let { length, vert } = getCurrShipPosInfo(shipNum);
    if (rotate) vert = !vert;
    return game.p1Board.checkPosition(row, col, length, vert, currShipObj);
  };

  const toggleGreyedGrids = () => {
    const oppGrids = document.querySelectorAll(`.${OPP_BOARD_GRID}`);
    for (let oppCell of oppGrids) {
      oppCell.classList.toggle("preGameGrids");
      oppCell.addEventListener("click", normalGameTurn);
    }
  };

  const EndShipSetUp = () => {
    const domShips = document.querySelectorAll(".ship");
    const selfGrids = document.querySelectorAll(`.${SELF_BOARD_GRID}`);
    for (const domShip of domShips) {
      domShip.removeEventListener("dragstart", dragStart);
      domShip.removeEventListener("dragend", dragEnd);
      domShip.removeEventListener("click", clickRotateShip);
      domShip.setAttribute("draggable", false);
      domShip.style.cursor = "default";
    }
    for (const cell of selfGrids) {
      cell.removeEventListener("dragover", dragOver);
      cell.removeEventListener("dragenter", dragEnter);
      cell.removeEventListener("dragleave", dragLeave);
      cell.removeEventListener("drop", dragDrop);
    }
  };

  const removeSelf = (e) => {
    let currDiv = e.currentTarget;
    let parent = currDiv.parentElement;
    parent.removeChild(currDiv);
  };

  const startGame = (e) => {
    toggleGreyedGrids();
    removeSelf(e);
    EndShipSetUp();
  };

  // add eventlisteners to the ships and cells
  const domShips = document.querySelectorAll(".ship");
  const selfGrids = document.querySelectorAll(`.${SELF_BOARD_GRID}`);
  for (const domShip of domShips) {
    domShip.addEventListener("dragstart", dragStart);
    domShip.addEventListener("dragend", dragEnd);
    domShip.addEventListener("click", clickRotateShip);
  }

  for (const cell of selfGrids) {
    cell.addEventListener("dragover", dragOver);
    cell.addEventListener("dragenter", dragEnter);
    cell.addEventListener("dragleave", dragLeave);
    cell.addEventListener("drop", dragDrop);
  }

  let oppBoard = document.createElement("div");

  let domOppBoard = makeBoard(
    oppBoard,
    createGameBoard().BOARD_SIZE,
    "oppBoard",
    OPP_BOARD_GRID
  );

  const preGame = () => {
    const oppGrids = document.querySelectorAll(`.${OPP_BOARD_GRID}`);
    oppGrids.forEach((oppCell) => oppCell.classList.toggle("preGameGrids"));
  };

  const startGameButton = () => {
    const button = document.createElement("button");
    button.innerText = "Start Game";
    const oppBoard = document.querySelector("#oppBoard");
    oppBoard.appendChild(button);
    button.addEventListener("click", startGame);
  };

  preGame();
  startGameButton();
};

domControl();

export {
  computerPlayer,
  humanPlayer,
  createShip,
  createGameBoard,
  gameControl,
};
