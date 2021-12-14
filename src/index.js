import "./style.css";

const seedrandom = require("seedrandom");

const createShip = (length) => {
  let hitbox = [];
  const hp = length;
  let hitCount = 0;

  const hit = () => {
    hitCount++;
  };

  const isSunk = () => {
    return hp === hitCount;
  };

  return {
    get hitbox() {
      return hitbox;
    },
    set hitbox(array) {
      hitbox = array;
    },
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
      }
    } else {
      for (let j = col; j < row + length; j++) {
        board[row][j]["hasShip"] = shipObject;
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
    placeShip,
    receiveAttack,
  };
};

// p2 (computer) makes a move
// checks that if there has been a hit and that ship not sunk (first hit trigger)
// if there is, make a logical move
// if first hit - pick from the  left/right/top/bottom
// if second hit - pick from same direction but on both sides (direction trigger)
// 4th shot logic h h m -> flip direction
// if ship sunk or no previous hit, make a random move
// checks move has been made before (keep a list)
//
// push move to board object - player attacks
// --> board receives attack
// if hits, update triggers
// if ship sinks, clear triggers

// p1 (player) clicks on a box
// registers row, col
// checks move has not been made before
// register move in
// p1 attack -> p2 board
// push move to board object
//

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
  let shipCoord = [];
  let triedDirections = [];
  const NUM_SHIP = 5;

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

  const registerShipHit = (row, col) => {
    let shipCoord = [row, col];
  };

  const checkInBound = (row, col) => {
    const BOARD_SIZE = 10;
    return 0 <= row && row < BOARD_SIZE && 0 <= col && col < BOARD_SIZE;
  };


  const randomDirection = () => {
    let vert = null
    let inc = null
    Math.round(Math.random()) == 1 ? vert = true : vert = false
    Math.round(Math.random()) == 1 ? inc = 1 : inc = -1
    return [inc, vert]
  }
  
  const seekDirectionMove = () => {
    let row = shipCoord[0];
    let col = shipCoord[1];
        /*
    if no direction - find direction
    if having direction - continue the last one 
    a stack - try each shot - see if hit before, 
    if shot not in history,
    (from the register), if yes - try next
    if has miss (shot in movehistory and not in shipCoord)
      if len(direction) == 1: flip -1, 2 = flip direction, flip -1
    */

    if (triedDirections.length === 0) {
      let direction = randomDirection()
      triedDirections.push(direction)
     }
    else {
      
    }
    let dir = randomDirection()
    inc = dir[0]
    vert = dir[1]

    }
    return [row, col];
  };

  const createPotentialCoord = (row, col, inc, vert) => {
    arr = [];
    let increment = inc;
    let newRow = row
    let newCol = col
    for (let i = 1; i < 5; i++) {
      if (vert) {
        newRow += increment
      } else {
        newCol += increment
      }
      if (!checkInBound(newRow, newCol)) break;
      arr.push(newRow, newCol);
      inc +=inc;
    }
    return arr;
  };

  const shot = () => {
    let row = 0;
    let col = 0;
    let coord = null;
    while (!checkNoRepeatMove(row, col) || !checkInBound(row, col)) {
      if (!foundAllShip) {
        coord = randomCheckerMove();
      } else {
        coord = seekDirectionMove();
      }
      row = coord[0];
      col = coord[1];
    }
    return [row, col];
  };

  const registerDirection = () => {};

  const clearHit = () => {
    savedHit = null;
    direction = null;
  };

  return {
    get mode() {
      return mode;
    },
    get moveHistory() {
      return moveHistory;
    },
    registerShipHit,
    registerDirection,
    shot,
    registerMove,
    checkNoRepeatMove,
  };
};

const gameControl = () => {
  const player1 = createPlayer();
  const player2 = createPlayer();
  const p1Board = createGameBoard();
  const p2Board = createGameBoard();

  let turnCounter = 1;

  const turnControl = () => {
    turnCounter = (turnCounter + 1) % 2;
  };
};

export {
  computerPlayer,
  humanPlayer,
  createShip,
  createGameBoard,
  gameControl,
};
