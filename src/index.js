import "./style.css";

const seedrandom = require("seedrandom");

const createShip = (length) => {
  let hitbox = [];
  const hp = length;
  let hitCount = 0;

  for (let i = 0; i < length; i++) {
    hitbox.push("_");
  }

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
  let savedHit = null;
  let direction = null;

  const checkNoRepeatMove = (row, col) => {
    return !moveHistory.includes(`${row}${col}`);
  };

  const registerMove = (row, col) => {
    moveHistory.push(`${row}${col}`);
  };

  const randomMove = () => {
    let row = Math.floor(Math.random() * 10);
    let col = Math.floor(Math.random() * 10);
    return [row, col];
  };

  const registerHit = (row, col) => {
    savedHit = [row, col];
  };

  const checkInBound = (row, col) => {
    const BOARD_SIZE = 10;
    return 0 <= row < BOARD_SIZE && 0 <= col < BOARD_SIZE;
  };

  const seekDirectionMove = (rng = Math.random()) => {
    let row = savedHit[0];
    let col = savedHit[1];
    const seededRng = seedrandom(rng);
    const randNum = Math.floor(seededRng() * 4);
    switch (randNum) {
      case 0:
        row++;
      case 1:
        col++;
      case 2:
        row--;
      case 3:
        col--;
        return [row, col];
    }
  };

  const shot = (rng) => {
    let row = 0;
    let col = 0;
    let coord = null;
    while (!checkNoRepeatMove(row, col) || !checkInBound(row, col)) {
      if (savedHit === null) {
        coord = randomMove();
      } else if (savedHit !== null) {
        coord = seekDirectionMove(rng);
      } else {
        return;
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
    registerHit,
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
