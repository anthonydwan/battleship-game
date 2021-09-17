const { createShip, createGameBoard } = require("./index");

describe("testing ship object", () => {
  const ship1 = createShip(4);
  const ship2 = createShip(2);

  test("ship has the property length", () => {
    expect(ship1).toMatchObject({ length: 4 });
  });

  test("ship has the property length", () => {
    expect(ship2).toMatchObject({ length: 2 });
  });

  test("ship has the property sunk", () => {
    expect(ship1).toMatchObject({ sunk: false });
  });

  test("ship has the property hit", () => {
    expect(ship1).toMatchObject({ hit: [] });
  });

  test.skip("ship can check if it is sunk", () => {});
    
});

describe("testing gameBoard object", () => {
  test("ship has the property length", () => {
    expect(createShip(4)).toMatchObject({ length: 4 });
  });
});
