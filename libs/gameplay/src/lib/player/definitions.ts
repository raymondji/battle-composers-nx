import { PlayerId } from "./simulation"
import { GridObject } from "../grid"

export interface PlayerDefinition {
    id: PlayerId,
    facing: "left" | "right",
    initialGridObject: GridObject,
}

export const Player1: PlayerDefinition = {
    id: "P1",
    facing: "right",
    initialGridObject: {
        tiles: [{ x: 0, y: 0 }],
    }
}

export const Player2: PlayerDefinition = {
    id: "P2",
    facing: "left",
    initialGridObject: {
        tiles: [{ x: 5, y: 3 }],
    },
}