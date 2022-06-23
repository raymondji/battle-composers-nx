import e = require("express");
import { GameState } from "../gameplay";
import { GridObject, GridState, isColliding, moveDown, moveLeft, moveRight, moveUp } from "../grid";
import { PlayerId, PlayersState, PlayerState } from "../player";

export interface SpellsState {
    active: SpellState[],
}

export interface SpellState {
    frame: number, // which frame the spell is on
    gridObject: GridObject,
    definition: SpellDefinition,
    affectedPlayers: PlayerId[],
    affectsGrid: boolean,
}

// Everything should be defined from the perspective of p1 (facing right)
// Direction/etc are all flipped automatically for p2
export interface SpellDefinition {
    name: string; // should be unique
    castSequence: Direction[];
    durationFrames: number, // number of frames that the spell lasts for
    movements: Map<number, Direction>, // keys are frame numbers on which the movement should happen
    getInitialGridObject: (player: GridObject) => GridObject,
    applyToPlayer: (player: PlayerState) => PlayerState,
    applyToGrid: (grid: GridState) => GridState,
}

type Direction = "Up" | "Down" | "Left" | "Right";

// Simulate everything that the spells do autonomously, e.g. moving and affecting players/the grid
export function simulateSpellEffects(prevState: GameState): GameState {
    let nextGridState = prevState.grid;
    let nextPlayersState = prevState.players;
    const nextSpellsState: SpellsState = {
        active: [],
    }

    for (let spell of prevState.spells.active) {
        if (isDone(spell)) {
            continue;
        }

        const nextStates = simulateSpell(spell, nextPlayersState, nextGridState);
        nextSpellsState.active.push(nextStates.spell);
        nextGridState = nextStates.grid;
        nextPlayersState = nextStates.players;
    }

    return {
        players: nextPlayersState,
        grid: nextGridState,
        spells: nextSpellsState,
    };
}

function isDone(state: SpellState): boolean {
    return state.frame >= state.definition.durationFrames;
}

// Returns the next states after simulating one frame of the spell
function simulateSpell(
    prevSpellState: SpellState, prevPlayersState: PlayersState, prevGridState: GridState,
): { spell: SpellState, players: PlayersState, grid: GridState } {
    const nextSpellState: SpellState = structuredClone(prevSpellState);
    const nextPlayersState: PlayersState = structuredClone(prevPlayersState);
    let nextGridState: GridState = structuredClone(prevGridState);

    // Update frame counter
    nextSpellState.frame++;

    // Handle movements
    const move = nextSpellState.definition.movements.get(nextSpellState.frame);
    if (move === "Up") {
        nextSpellState.gridObject = moveUp(nextSpellState.gridObject, nextGridState);
    } else if (move === "Down") {
        nextSpellState.gridObject = moveDown(nextSpellState.gridObject, nextGridState);
    } else if (move === "Left") {
        nextSpellState.gridObject = moveLeft(nextSpellState.gridObject, nextGridState);
    } else if (move === "Right") {
        nextSpellState.gridObject = moveRight(nextSpellState.gridObject, nextGridState);
    }

    // Handle effects on players
    if (nextSpellState.affectedPlayers.includes("P1") && isColliding(nextSpellState.gridObject, nextPlayersState.p1.gridObject)) {
        nextPlayersState.p1 = nextSpellState.definition.applyToPlayer(nextPlayersState.p1);
    }
    if (nextSpellState.affectedPlayers.includes("P2") && isColliding(nextSpellState.gridObject, nextPlayersState.p2.gridObject)) {
        nextPlayersState.p2 = nextSpellState.definition.applyToPlayer(nextPlayersState.p2);
    }

    // Handle effects on grid
    // TODO: should not be able to affect the grid if players are standing on it
    // if (nextSpellState.affectsGrid) {
    //     nextGridState = nextSpellState.definition.applyToGrid(nextGridState);
    // }

    return { spell: nextSpellState, players: nextPlayersState, grid: nextGridState }
}
