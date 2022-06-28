import {
  GridObject,
  initGridState,
  isColliding,
  moveDown,
  moveRight,
  moveUp,
} from '.';

test('initGridState', () => {
  const got = initGridState(4, 2);
  expect(got.p1Zone).toHaveLength(4);
  expect(got.p1Zone).toEqual(
    expect.arrayContaining([
      { x: 0, y: 0 },
      { x: 1, y: 0 },
      { x: 0, y: 1 },
      { x: 1, y: 1 },
    ])
  );
  expect(got.p2Zone).toHaveLength(4);
  expect(got.p2Zone).toEqual(
    expect.arrayContaining([
      { x: 2, y: 0 },
      { x: 3, y: 0 },
      { x: 2, y: 1 },
      { x: 3, y: 1 },
    ])
  );
});

test('isColliding returns true when there is a shared tile', () => {
  const go1: GridObject = {
    tiles: [
      { x: 0, y: 0 },
      { x: 1, y: 0 },
    ],
  };
  const go2: GridObject = {
    tiles: [
      { x: 2, y: 2 },
      { x: 1, y: 0 },
    ],
  };
  const got = isColliding(go1, go2);
  expect(got).toEqual(true);
});

test('isColliding returns false when there is no shared tile', () => {
  const go1: GridObject = {
    tiles: [
      { x: 0, y: 0 },
      { x: 1, y: 1 },
    ],
  };
  const go2: GridObject = {
    tiles: [
      { x: 2, y: 2 },
      { x: 1, y: 0 },
    ],
  };
  const got = isColliding(go1, go2);
  expect(got).toEqual(false);
});

test('moveRight works without movement restriction', () => {
  const go: GridObject = {
    tiles: [
      { x: 0, y: 0 },
      { x: 1, y: 0 },
    ],
  };
  const grid = initGridState(4, 2);
  const got = moveRight(go, grid);
  expect(got).toEqual(true);
  expect(go.tiles).toEqual(
    expect.arrayContaining([
      { x: 1, y: 0 },
      { x: 2, y: 0 },
    ])
  );
});

test('moveRight works with movement restriction', () => {
  const go: GridObject = {
    tiles: [
      { x: 0, y: 0 },
      { x: 1, y: 0 },
    ],
    zoneRestriction: 'P1',
  };
  const grid = initGridState(4, 2);

  const got = moveRight(go, grid);
  expect(got).toEqual(false);
  expect(go.tiles).toEqual(
    expect.arrayContaining([
      { x: 0, y: 0 },
      { x: 1, y: 0 },
    ])
  );

  const got2 = moveDown(go, grid);
  expect(got2).toEqual(true);
  expect(go.tiles).toEqual(
    expect.arrayContaining([
      { x: 0, y: 1 },
      { x: 1, y: 1 },
    ])
  );
});
