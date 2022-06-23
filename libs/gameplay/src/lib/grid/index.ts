export interface GridState {
    p1Box: BoundingBox,
    p2Box: BoundingBox,
}

export interface GridObject {
    tiles: Tile[],
    limits?: BoundingBox,
}

export interface BoundingBox {
    minX: number,
    maxX: number,
    minY: number,
    maxY: number,
}

export interface Tile {
    x: number;
    y: number;
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

export function moveRight(go: GridObject) {
    return move(go, 1, 0);
}

export function moveLeft(go: GridObject) {
    return move(go, -1, 0);
}

export function moveUp(go: GridObject) {
    return move(go, 0, -1);
}

export function moveDown(go: GridObject) {
    return move(go, 0, 1);
}

function move(go: GridObject, deltaX: number, deltaY: number): GridObject {
    const nextGo: GridObject = structuredClone(go);
    nextGo.tiles = go.tiles.map(tile => {
        return {
            x: tile.x + deltaX,
            y: tile.y + deltaY,
        };
    })
    if (!isValidPosition(nextGo)) {
        return go;
    }
    return nextGo;
}

function isValidPosition(go: GridObject): boolean {
    const box = go.limits;
    if (!box) {
        return true;
    }

    return go.tiles.every(tile => withinBoundingBox(tile, box))
}

function withinBoundingBox(tile: Tile, box: BoundingBox): boolean {
    const xConstraint = tile.x <= box.maxX && tile.x >= box.minX;
    const yConstraint = tile.y <= box.maxY && tile.y >= box.minY;
    return xConstraint && yConstraint;
}

