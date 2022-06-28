import { PlayerId } from '../player/simulation';

export interface GridState {
  p1Zone: Tile[];
  p2Zone: Tile[];
}

// Length is the number of tiles horizontally, width is the number of tiles
// vertically
export function initGridState(length: number, width: number): GridState {
  return {
    p1Zone: createsTilesInRectangle({
      minX: 0,
      maxX: length / 2,
      minY: 0,
      maxY: width,
    }),
    p2Zone: createsTilesInRectangle({
      minX: length / 2,
      maxX: length,
      minY: 0,
      maxY: width,
    }),
  };
}

function createsTilesInRectangle({
  minX,
  maxX,
  minY,
  maxY,
}: {
  minX: number;
  maxX: number;
  minY: number;
  maxY: number;
}): Tile[] {
  const tiles: Tile[] = [];
  for (let x = minX; x < maxX; x++) {
    for (let y = minY; y < maxY; y++) {
      tiles.push({ x, y });
    }
  }

  return tiles;
}

export interface GridObject {
  tiles: Tile[];
  zoneRestriction?: PlayerId; // if restricted, can only move within the player's tiles
}

export interface Tile {
  x: number;
  y: number;
}

export function isColliding(go1: GridObject, go2: GridObject): boolean {
  for (let tile1 of go1.tiles) {
    for (let tile2 of go2.tiles) {
      if (tile1.x === tile2.x && tile1.y === tile2.y) {
        return true;
      }
    }
  }

  return false;
}

export function moveRight(go: GridObject, grid: GridState): void {
  move(go, grid, 1, 0);
}

export function moveLeft(go: GridObject, grid: GridState): void {
  move(go, grid, -1, 0);
}

export function moveUp(go: GridObject, grid: GridState): void {
  move(go, grid, 0, -1);
}

export function moveDown(go: GridObject, grid: GridState): void {
  move(go, grid, 0, 1);
}

function move(
  go: GridObject,
  grid: GridState,
  deltaX: number,
  deltaY: number
): void {
  const updatedTiles = go.tiles.map((tile) => {
    return {
      x: tile.x + deltaX,
      y: tile.y + deltaY,
    };
  });

  if (
    go.zoneRestriction &&
    !isWithinZone(updatedTiles, go.zoneRestriction, grid)
  ) {
    return;
  }

  go.tiles = updatedTiles;
}

function isWithinZone(
  tiles: Tile[],
  zoneRestriction: PlayerId,
  grid: GridState
): boolean {
  const zone = zoneRestriction === 'P1' ? grid.p1Zone : grid.p2Zone;
  return tiles.every((tile) => zone.includes(tile));
}

function withinBoundingBox(tile: Tile, box: BoundingBox): boolean {
  const xConstraint = tile.x <= box.maxX && tile.x >= box.minX;
  const yConstraint = tile.y <= box.maxY && tile.y >= box.minY;
  return xConstraint && yConstraint;
}

export interface BoundingBox {
  minX: number;
  maxX: number;
  minY: number;
  maxY: number;
}

export function getBoundingBox(go: GridObject): BoundingBox {
  const xVals = go.tiles.map((tile) => tile.x);
  const yVals = go.tiles.map((tile) => tile.y);

  return {
    minX: Math.min(...xVals),
    maxX: Math.max(...xVals),
    minY: Math.min(...yVals),
    maxY: Math.max(...yVals),
  };
}
