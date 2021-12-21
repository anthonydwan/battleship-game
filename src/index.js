import "./style.css";

const createShip = (length) => {
  let hitbox = [];
  const hp = length;
  let hitCount = 0;

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
    pushCoord,
    length,
    hit,
    isSunk,
  };
};

const createGameBoard = () => {
  const BOARD_SIZE = 10;
  let shipPlacementRegister = [];

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
      return row >= 0 && row + length < BOARD_SIZE;
    } else {
      return col >= 0 && col + length < BOARD_SIZE;
    }
  };

  const checkCollision = (row, col, length, vert = true) => {
    if (vert) {
      for (let i = row; i < row + length; i++) {
        if (board[i][col]["hasShip"]) {
          return false;
        }
      }
    } else {
      for (let j = col; j < col + length; j++) {
        if (board[row][j]["hasShip"]) {
          return false;
        }
      }
    }
    return true;
  };

  const placeShip = (shipObject, row, col, vert = true) => {
    const length = shipObject.length;
    if (!checkSpace(row, col, length, vert)) return false;
    if (!checkCollision(row, col, length, vert)) return false;
    shipPlacementRegister.push({
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
    board[row][col]["hasShip"].hit();
    return true;
  };

  return {
    get board() {
      return board;
    },
    get BOARD_SIZE() {
      return BOARD_SIZE;
    },
    get shipPlacementRegister() {
      return shipPlacementRegister;
    },
    placeShip,
    receiveAttack,
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
      col = Math.floor(math.random() * 5);
    }
    return [row, col];
  };

  const registerHit = (row, col) => {
    hitHistory.push(`${row}${col}`);
  };

  const checkInBound = (row, col) => {
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
    while (i < 4) {
      if (potentialMovesSets[i].length === 0) {
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

      if (!checkInBound(newRow, newCol)) {
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

  const shot = () => {
    let row = 0;
    let col = 0;
    let coord = null;
    while (!checkNoRepeatMove(row, col) || !checkInBound(row, col)) {
      if (hitHistory.length === 0) {
        coord = randomCheckerMove();
      } else {
        coord = seekDirectionMove();
      }
      row = coord[0];
      col = coord[1];
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
    shot,
    registerMove,
    checkNoRepeatMove,
    clearMemoryWhenSunkShip,
  };
};

const gameControl = (() => {
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

  let turnCounter = 1;

  const turnControl = () => {
    turnCounter = (turnCounter + 1) % 2;
  };

  const initiateGame = (mode = "playerVersusComputer") => {
    const player1 = humanPlayer();
    const player2 = computerPlayer();
    const p1Board = createGameBoard();
    const p2Board = createGameBoard();
    randomPlaceShipsOnBoard(p1Ships, p1Board);
    randomPlaceShipsOnBoard(p2Ships, p2Board);
    return [player1, player2, p1Board, p2Board];
  };

  let [p1, p2, p1Board, p2Board] = initiateGame();

  //remember to set ship draggable to false after game has been initiated

  return {
    p1,
    p2,
    p1Board,
    p2Board,
    initiateGame,
    get shipSizeGroup() {
      return shipSizeGroup;
    },
  };
})();

const domControl = () => {
  const container = document.querySelector(".container");

  /*
  when initialing the game:
    1. the based on the ship to be placed, there will be that length of blocks
    2. randomly generate block places in the squares
    3. drag and drop the other ships into the right place
    3. right click or left click would change the orientation from horizontal to vertical
      the grid must have some eventlistener
      grid = row/col/div - eventlistener - trigger
      function that changes div color
      AND register placeShip in the board

      b. the board would fill the colours denoting where the ship is
      b. the intialization would move to the next ship
  after the initialization, hover would do nothing to the self board
   */

  const makeGrid = (parentDiv, size, classname = null) => {
    let domBoard = [];
    for (let i = 0; i < size; i++) {
      let row = [];
      for (let j = 0; j < size; j++) {
        let grid = document.createElement("div");
        grid.classList.add("squareDiv");
        grid.row = i;
        grid.col = j;
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
    "selfBoardGrids"
  );

  // initial placement of the ships on the dom
  for (let coord of gameControl.p1Board.shipPlacementRegister) {
    let shipOnScreen = document.createElement("div");
    shipOnScreen.classList.add("ship");
    coord["vert"]
      ? (shipOnScreen.style.height = `${(coord["length"] - 1) * 3 + 2.85}rem`)
      : (shipOnScreen.style.width = `${(coord["length"] - 1) * 3 + 2.85}rem`);
    shipOnScreen.setAttribute("draggable", true);
    domSelfBoard[coord["row"]][coord["col"]].appendChild(shipOnScreen);
  }

  //eventlisteners

  const dragStart = (e) => {
    let currDiv = e.currentTarget;
    currDiv.classList.add("hold");
    // we need a small delay to make sure
    // ship is not invis at the time of dragging
    setTimeout(() => (currDiv.className = "invisible"), 0);
  };

  const dragEnd = (e) => {
    //after finishing holding the ship, it needs to not invis
    let currDiv = e.currentTarget;
    currDiv.className = "ship";
  };

  const dragOver = (e) => {
    e.preventDefault();
  };

  const dragEnter = (e) => {
    e.preventDefault();
    e.currentTarget.classList.add("hovered");
  };

  const dragLeave = (e) => {
    e.currentTarget.className = "squareDiv";
  };

  const dragDrop = (e) => {
    e.currentTarget.className = "empty";
    let shipDiv = document.querySelector(".hold");
    e.currentTarget.append(shipDiv);
  };

  // add eventlisteners to the ships and cells
  const domShips = document.querySelectorAll(".ship");
  const cells = document.querySelectorAll(".squareDiv");
  for (const domShip of domShips) {
    domShip.addEventListener("dragstart", dragStart);
    domShip.addEventListener("dragend", dragEnd);
  }

  for (const cell of cells) {
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
    "oppBoardGrids"
  );

  const selfBoardGrids = document.querySelectorAll(".selfBoardGrids");

  // const visualPlaceShip = () => {
  //   // grid.addEventListener("onmousehover", );
  // };
};

domControl();

export {
  computerPlayer,
  humanPlayer,
  createShip,
  createGameBoard,
  gameControl,
};
