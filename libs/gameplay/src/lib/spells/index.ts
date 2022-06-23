import { GridObject, moveDown, moveLeft, moveRight, moveUp } from "../grid";
import { PlayerId, PlayerState } from "../player";

export interface SpellState {
    frame: number, // number of frames remaining
    done: boolean, // if the spell is done
    gridObject: GridObject,
    spell: Spell,
    affectedPlayers: PlayerId[],
}

export interface SpellsState {
    activeSpells: SpellState[],
}

// Everything should be defined from the perspective of p1 (facing right)
// Direction/etc are all flipped automatically for p2
export interface Spell {
    name: string; // should be unique
    castSequence: Direction[];
    durationFrames: number, // number of frames that the spell lasts for
    movements: Map<number, Direction>, // keys are frame numbers on which the movement should happen
    getInitialGridObject: (player: GridObject) => GridObject,
    applyTo: (player: PlayerState) => PlayerState,
}

type Direction = "Up" | "Down" | "Left" | "Right";

export function simulateSpells(state: SpellsState): SpellsState {
    return {
        activeSpells: state.activeSpells.filter(spell => !isDone(spell)).map(spell => simulateSpell(spell)),
    };
}

function isDone(state: SpellState): boolean {
    return state.frame >= state.spell.durationFrames;
}

// Returns the next spell state
function simulateSpell(state: SpellState): SpellState {
    const nextState: SpellState = structuredClone(state);

    // Handle movement
    const move = state.spell.movements.get(state.frame);
    if (move === "Up") {
        nextState.gridObject = moveUp(state.gridObject);
    } else if (move === "Down") {
        nextState.gridObject = moveDown(state.gridObject);
    } else if (move === "Left") {
        nextState.gridObject = moveLeft(state.gridObject);
    } else if (move === "Right") {
        nextState.gridObject = moveRight(state.gridObject);
    }

    return nextState
}
