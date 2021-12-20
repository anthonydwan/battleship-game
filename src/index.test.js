const seedrandom = require("seedrandom");

const {
  humanPlayer,
  computerPlayer,
  createShip,
  createGameBoard,
  gameControl,
} = require("./index");

describe("testing ship object", () => {
  const testShip = createShip(2);
  const sunkShip = createShip(1);
  sunkShip.hit();

  test("ship has the property length", () => {
    expect(testShip).toMatchObject({ length: 2 });
  });

  test("can access ship's length", () => {
    expect(testShip.length).toBe(2);
  });

  test("check if ship sunk - false", () => {
    expect(testShip.isSunk()).toBe(false);
  });

  test("check if ship sunk - true", () => {
    expect(sunkShip.isSunk()).toBe(true);
  });
});

describe("testing gameBoard object", () => {
  const testBoard = createGameBoard();

  test("board has the property size of 10 rows", () => {
    expect(testBoard.board.length).toEqual(10);
  });

  test("board has the property size of 10 columns", () => {
    expect(testBoard.board[0].length).toEqual(10);
  });

  test("empty board has each cell filled with hasShip", () => {
    expect(testBoard.board[0][0]["hasShip"]).toBe(false);
  });

  test("empty board has each cell filled with hasShot", () => {
    expect(testBoard.board[0][0]["hasShot"]).toBe(false);
  });

  test("placing ship on board horizontally (with ship object)", () => {
    const placeShipBoard = createGameBoard();
    const testShip = createShip(4);
    placeShipBoard.placeShip(testShip, 0, 0, false);
    expect(placeShipBoard.board[0][0]["hasShip"]).toBe(testShip);
    expect(placeShipBoard.board[0][1]["hasShip"]).toBe(testShip);
    expect(placeShipBoard.board[0][2]["hasShip"]).toBe(testShip);
    expect(placeShipBoard.board[0][3]["hasShip"]).toBe(testShip);
    expect(placeShipBoard.board[0][4]["hasShip"]).toBe(false);
    expect(placeShipBoard.board[1][0]["hasShip"]).toBe(false);
  });

  test("placing ship on board vertically (with ship object", () => {
    const placeShipBoard = createGameBoard();
    const testShip = createShip(4);
    placeShipBoard.placeShip(testShip, 0, 0, true);
    expect(placeShipBoard.board[0][0]["hasShip"]).toBe(testShip);
    expect(placeShipBoard.board[1][0]["hasShip"]).toBe(testShip);
    expect(placeShipBoard.board[2][0]["hasShip"]).toBe(testShip);
    expect(placeShipBoard.board[3][0]["hasShip"]).toBe(testShip);
    expect(placeShipBoard.board[0][1]["hasShip"]).toBe(false);
    expect(placeShipBoard.board[4][0]["hasShip"]).toBe(false);
  });

  test("placing ship on board successfully returns true", () => {
    const placeShipBoard = createGameBoard();
    const testShip = createShip(4);
    expect(placeShipBoard.placeShip(testShip, 0, 0, true)).toBe(true);
  });

  test("placing ship on board outside board returns false", () => {
    const placeShipBoard = createGameBoard();
    const testShip = createShip(4);
    expect(placeShipBoard.placeShip(testShip, 100, 0, true)).toBe(false);
    expect(placeShipBoard.placeShip(testShip, 0, 100, false)).toBe(false);
  });

  test("placing ship on board too long for board returns false", () => {
    const placeShipBoard = createGameBoard();
    const testShip = createShip(40);
    expect(placeShipBoard.placeShip(testShip, 9, 0, true)).toBe(false);
    expect(placeShipBoard.placeShip(testShip, 0, 9, false)).toBe(false);
  });

  test("checking ship collisions", () => {
    const placeShipBoard = createGameBoard();
    const testShip = createShip(4);
    const testShip2 = createShip(4);
    expect(placeShipBoard.placeShip(testShip, 0, 0, true)).toBe(true);
    expect(placeShipBoard.placeShip(testShip2, 0, 0, false)).toBe(false);
    expect(placeShipBoard.placeShip(testShip2, 1, 0, false)).toBe(false);
    expect(placeShipBoard.placeShip(testShip2, 0, 1, false)).toBe(true);
  });

  test("receive attack and sinks ship", () => {
    const placeShipBoard = createGameBoard();
    const testShip = createShip(1);
    placeShipBoard.placeShip(testShip, 0, 0, true);
    expect(placeShipBoard.receiveAttack(0, 0)).toBe(true);
    expect(placeShipBoard.board[0][0]["hasShot"]).toBe(true);
    expect(testShip.isSunk()).toBe(true);
  });

  test("cannot attack the same place twice", () => {
    const placeShipBoard = createGameBoard();
    const testShip = createShip(1);
    placeShipBoard.placeShip(testShip, 0, 0, true);
    expect(placeShipBoard.receiveAttack(0, 0)).toBe(true);
    expect(placeShipBoard.receiveAttack(0, 0)).toBe(false);
  });
});

describe("testing player move", () => {
  const p1 = humanPlayer();

  test("player make attack will be registered", () => {
    p1.registerMove(0, 0);
    p1.registerMove(0, 1);
    expect(p1.moveHistory).toEqual(["00", "01"]);
  });

  test("player can detect illegal move", () => {
    expect(p1.checkNoRepeatMove(0, 0)).toBe(false);
    expect(p1.checkNoRepeatMove(0, 1)).toBe(false);
    expect(p1.checkNoRepeatMove(3, 0)).toEqual(true);
    p1.registerMove(3, 0);
    expect(p1.checkNoRepeatMove(3, 0)).toBe(false);
  });
});

describe("testing computer move", () => {
  const p1 = computerPlayer();

  test("make a random checked shot", () => {
    const p2Board = createGameBoard();
    const testShip = createShip(3);
    p2Board.placeShip(testShip, 0, 0, true);
    expect(p1.shot(1)[0]).toBeGreaterThanOrEqual(0);
    expect(p1.shot(1)[0]).toBeLessThan(10);
    expect(p1.shot(1)[1]).toBeGreaterThanOrEqual(0);
    expect(p1.shot(1)[1]).toBeLessThan(10);
  });

  test("predict 2nd hit move (2 possibilities)", () => {
    const p2Board = createGameBoard();
    const testShip = createShip(3);
    const p1 = computerPlayer();
    p2Board.placeShip(testShip, 0, 0, true);
    p2Board.receiveAttack(0, 0);
    p1.registerMove(0, 0);
    p1.registerHit(0, 0);
    const shotTaken = p1.shot();
    expect([0, 1].includes(shotTaken[0])).toBeTruthy();
    expect([0, 1].includes(shotTaken[1])).toBeTruthy();
    expect(shotTaken[0]).not.toEqual(shotTaken[1]);
  });

  test("predict 4th hit after missing 2nd/3rd shot (definite)", () => {
    const p2Board = createGameBoard();
    const testShip = createShip(3);
    const p1 = computerPlayer();
    p2Board.placeShip(testShip, 1, 0, true);
    p2Board.receiveAttack(1, 0);
    p1.registerMove(1, 0);
    p1.registerHit(1, 0);

    //miss 2nd shot
    p1.registerMove(0, 0);

    //miss 3rd shot
    p1.registerMove(1, 1);

    //4th shot must hit
    expect(p1.shot()).toStrictEqual([2, 0]);
  });

  test("predict 4th hit after missing 2nd/3rd shot of 2nd ship (definite)", () => {
    const p2Board = createGameBoard();
    const sunkShip = createShip(2);
    const p1 = computerPlayer();
    p2Board.placeShip(sunkShip, 6, 0, true);
    p2Board.receiveAttack(6, 0);
    p1.registerMove(6, 0);
    p1.registerHit(6, 0);
    p1.registerMove(7, 0);
    p1.registerHit(7, 0);
    p1.clearMemoryWhenSunkShip(sunkShip);

    const testShip = createShip(3);
    p2Board.placeShip(testShip, 1, 0, true);
    p2Board.receiveAttack(1, 0);
    p1.registerMove(1, 0);
    p1.registerHit(1, 0);

    //miss 2nd shot
    p1.registerMove(0, 0);

    //miss 3rd shot
    p1.registerMove(1, 1);

    //4th shot must hit
    expect(p1.shot()).toStrictEqual([2, 0]);
  });
});

describe("testing game module", () => {});
