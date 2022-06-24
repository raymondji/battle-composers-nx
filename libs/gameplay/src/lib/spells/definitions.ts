// Everything should be defined from the perspective of p1 (facing right)

import { SpellState } from "./simulation";
import { GridObject, GridState, moveRight, Tile } from "../grid";
import { PlayerId, PlayerState, takeDamage } from "../player/simulation";

// Direction/etc are all flipped automatically for p2
export interface SpellDefinition {
    name: string; // should be unique
    notes: string[],
    durationFrames: number, // number of frames that the spell lasts for
    updateGridObject: (gridObject: GridObject, grid: GridState, frame: number) => void,
    getInitialGridObject: (player: PlayerState) => GridObject,
    applyToPlayer?: (player: PlayerState) => void,
    applyToGrid?: (grid: GridState) => void,
    getAffectedPlayers: (caster: PlayerId, enemy: PlayerId) => PlayerId[],
}

export const furElise: SpellDefinition = {
    name: "Fur Elise",
    notes: ["E", "D#", "E", "D#", "E", "B", "D", "C", "A"],
    durationFrames: 30,
    getInitialGridObject: (player: PlayerState) => {
        const deltaX = player.definition.facing === "right" ? 1 : -1;
        const tile: Tile = {
            x: player.gridObject.tiles[0].x + deltaX,
            y: player.gridObject.tiles[0].y,
        };

        return {
            tiles: [tile],
        };
    },
    updateGridObject: (gridObject: GridObject, grid: GridState, frame: number) => {
        if (frame % 5 === 0) {
            moveRight(gridObject, grid);
        }
    },
    applyToPlayer: (player: PlayerState) => {
        takeDamage(player, 5);
    },
    getAffectedPlayers: (caster: PlayerId, enemy: PlayerId) => {
        return [enemy];
    }
}