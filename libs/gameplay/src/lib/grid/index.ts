import { PlayerId } from "../player";

export interface GridState {
    p1Zone: Tile[];
    p2Zone: Tile[];
}

export interface GridObject {
    tiles: Tile[],
    zoneRestriction?: PlayerId, // if restricted, can only move within the player's tiles 
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

export function moveRight(go: GridObject, grid: GridState) {
    move(go, grid, 1, 0);
}

export function moveLeft(go: GridObject, grid: GridState) {
    move(go, grid, -1, 0);
}

export function moveUp(go: GridObject, grid: GridState) {
    move(go, grid, 0, -1);
}

export function moveDown(go: GridObject, grid: GridState) {
    move(go, grid, 0, 1);
}

function move(go: GridObject, grid: GridState, deltaX: number, deltaY: number): GridObject {
    const nextGo: GridObject = structuredClone(go);
    nextGo.tiles = go.tiles.map(tile => {
        return {
            x: tile.x + deltaX,
            y: tile.y + deltaY,
        };
    })
    if (!isValidPosition(nextGo, grid)) {
        return go;
    }
    return nextGo;
}

function isValidPosition(go: GridObject, grid: GridState): boolean {
    const restriction = go.zoneRestriction;
    if (!restriction) {
        return true;
    }
    const zone = restriction === "P1" ? grid.p1Zone : grid.p2Zone;

    return go.tiles.every(tile => withinZone(tile, 
}

function withinZone(tile: Tile, zone: Tile[]): boolean {
    return zone.includes(tile);
}

function withinBoundingBox(tile: Tile, box: BoundingBox): boolean {
    const xConstraint = tile.x <= box.maxX && tile.x >= box.minX;
    const yConstraint = tile.y <= box.maxY && tile.y >= box.minY;
    return xConstraint && yConstraint;
}

export interface BoundingBox {
    minX: number,
    maxX: number,
    minY: number,
    maxY: number,
}

export function getBoundingBox(go: GridObject): BoundingBox {
    const xVals = go.tiles.map(tile => tile.x);
    const yVals = go.tiles.map(tile => tile.y);

    return {
        minX: Math.min(...xVals),
        maxX: Math.max(...xVals),
        minY: Math.min(...yVals),
        maxY: Math.max(...yVals),
    }
}
