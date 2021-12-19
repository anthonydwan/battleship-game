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

  const checkSpace = (row, col, length, align) => {
    if (align === "vertical") {
      return row >= 0 && row + length < BOARD_SIZE;
    } else {
      return col >= 0 && col + length < BOARD_SIZE;
    }
  };

  const checkCollision = (row, col, length, align = "horizontal") => {
    if (align === "vertical") {
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

  const placeShip = (shipObject, row, col, align = "horizontal") => {
    const length = shipObject.length;
    if (!checkSpace(row, col, length, align)) return false;
    if (!checkCollision(row, col, length, align)) return false;
    if (align === "vertical") {
      for (let i = row; i < row + length; i++) {
        board[i][col]["hasShip"] = shipObject;
        shipObject.pushCoord(i, col);
      }
    } else {
      for (let j = col; j < row + length; j++) {
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
    console.log(output);
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
  const initiateGame = (mode = "") => {};
  const player1 = humanPlayer();
  const player2 = computerPlayer();

  const p1Board = createGameBoard();
  const p2Board = createGameBoard();

  let turnCounter = 1;

  const turnControl = () => {
    turnCounter = (turnCounter + 1) % 2;
  };

  return {
    p1Board,
    p2Board,
  };
})();

const domControl = (() => {
  const container = document.querySelector(".container");

  const makeGrid = (parentDiv, size = gameBoard.BOARD_SIZE) => {
    for (let i = 0; i < size * size; i++) {
      let grid = document.createElement("div");
      grid.classList.add("squareDiv");
      // grid.addEventListener("mousemove", )
      parentDiv.appendChild(grid);
    }
  };

  const makeBoard = (selfBoard, size = BOARD_SIZE) => {
    selfBoard.setAttribute("id", "selfBoard");
    selfBoard.classList.add("boardContainer");
    makeGrid(selfBoard, gameControl.p1Board.BOARD_SIZE);
    container.appendChild(selfBoard);
  };

  const createSelfBoard = () => {
    let selfBoard = document.createElement("div");
    selfBoard.setAttribute("id", "selfBoard");
    selfBoard.classList.add("boardContainer");
    makeGrid(selfBoard, gameControl.p1Board.BOARD_SIZE);
    container.appendChild(selfBoard);
  };

  const createOppBoard = () => {
    let oppBoard = document.createElement("div");
    oppBoard.setAttribute("id", "oppBoard");
    oppBoard.classList.add("boardContainer");
    makeGrid(oppBoard, gameControl.p2Board.BOARD_SIZE);
    container.appendChild(oppBoard);
  };

  createSelfBoard();
  createOppBoard();
})();

export {
  computerPlayer,
  humanPlayer,
  createShip,
  createGameBoard,
  gameControl,
};
