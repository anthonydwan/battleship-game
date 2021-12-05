import "./style.css";

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

export { createShip, createGameBoard };
