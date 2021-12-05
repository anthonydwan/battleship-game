import "./style.css";

const createShip = (length) => {
  let hitbox = [];
  for (let i = 0; i < length; i++) {
    hitbox.push("_");
  }

  const hit = (index) => {
    hitbox[index] = "X";
  };

  const isSunk = () => {
    return hitbox.every((box) => box === "X");
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

  const checkSpace = (position, length) => {
    return position + length <= BOARD_SIZE;
  };

  const checkCollision = (row, col, length, align = "horizontal") => {
    if (align === "vertical") {
      if (!(row >= 0 && row + length < BOARD_SIZE)) {
        return false;
      }
      for (let i = row; i < row + length; i++) {
        if (board[i][col]["hasShip"]) {
          return false;
        }
      }
    } else {
      if (!(col >= 0 && col + length < BOARD_SIZE)) {
        return false;
      }
      for (let j = col; j < col + length; j++) {
        if (board[row][j]["hasShip"]) {
          return false;
        }
      }
    }
    return true;
  };

  const placeShip = (row, col, length, align = "horizontal") => {
    const checkCol = checkCollision(row, col, length, align);
    if (align === "vertical") {
      const checkSp = checkSpace(row, length);
      if (checkSp && checkCol) {
        for (let i = row; i < row + length; i++) {
          board[i][col]["hasShip"] = true;
        }
        return true;
      }
    } else {
      const checkSp = checkSpace(col, length);
      if (checkSp && checkCol) {
        for (let j = col; j < row + length; j++) {
          board[row][j]["hasShip"] = true;
        }
        return true;
      }
    }
    return false;
  };

  const checkCellAttack = (row, col) => {
    return board[row][col] === "_";
  };

  const receiveAttack = () => {};

  return {
    get board() {
      return board;
    },
    placeShip,
  };
};

export { createShip, createGameBoard };
