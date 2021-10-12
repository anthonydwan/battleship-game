const { createShip, createGameBoard } = require("./index");

describe("testing ship object", () => {
  const testShip = createShip(2);
  const sunkShip = createShip(1);
  sunkShip.hit(0);

  test("ship has the property length", () => {
    expect(testShip).toMatchObject({ length: 2 });
  });

  test("can access ship's length", () => {
    expect(testShip.length).toBe(2);
  });

  test("can access ship's hitbox", () => {
    expect(testShip.hitbox).toStrictEqual(["_", "_"]);
  });

  test("ship can get hit", () => {
    expect(sunkShip.hitbox).toStrictEqual(["X"]);
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

  test("placing ship on board horizontally", () => {
    const placeShipBoard = createGameBoard();
    placeShipBoard.placeShip(0, 0, 4);
    expect(placeShipBoard.board[0][0]["hasShip"]).toBe(true);
    expect(placeShipBoard.board[0][1]["hasShip"]).toBe(true);
    expect(placeShipBoard.board[0][2]["hasShip"]).toBe(true);
    expect(placeShipBoard.board[0][3]["hasShip"]).toBe(true);
    expect(placeShipBoard.board[0][4]["hasShip"]).toBe(false);
    expect(placeShipBoard.board[1][0]["hasShip"]).toBe(false);
  });

  test("placing ship on board vertically", () => {
    const placeShipBoard = createGameBoard();
    placeShipBoard.placeShip(0, 0, 4, "vertical");
    expect(placeShipBoard.board[0][0]["hasShip"]).toBe(true);
    expect(placeShipBoard.board[1][0]["hasShip"]).toBe(true);
    expect(placeShipBoard.board[2][0]["hasShip"]).toBe(true);
    expect(placeShipBoard.board[3][0]["hasShip"]).toBe(true);
    expect(placeShipBoard.board[0][1]["hasShip"]).toBe(false);
    expect(placeShipBoard.board[4][0]["hasShip"]).toBe(false);
  });

  test("placing ship on board successfully returns true", () => {
    const placeShipBoard = createGameBoard();
    expect(placeShipBoard.placeShip(0, 0, 4, "vertical")).toBe(true);
  });

  test("placing ship on board outside board returns false", () => {
    const placeShipBoard = createGameBoard();
    expect(placeShipBoard.placeShip(100, 0, 4, "vertical")).toBe(false);
  });
});
