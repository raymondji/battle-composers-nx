import e = require("express");
import { GameState } from "../gameplay";
import { GridObject, GridState, isColliding, moveDown, moveLeft, moveRight, moveUp } from "../grid";
import { PlayerId, PlayersState, PlayerState } from "../player/simulation";
import { SpellDefinition } from "./definitions";

export interface SpellsState {
    active: SpellState[],
}
export function initSpellsState(): SpellsState {
    return {
        active: [],
    }
}

export interface SpellState {
    frame: number, // which frame the spell is on
    gridObject: GridObject,
    definition: SpellDefinition,
    affectedPlayers: PlayerId[],
}

export function initSpellState(definition: SpellDefinition, caster: PlayerState, enemy: PlayerState): SpellState {
    return {
        frame: 0,
        gridObject: definition.getInitialGridObject(caster),
        definition,
        affectedPlayers: definition.getAffectedPlayers(caster.definition.id, enemy.definition.id),
    };
}

// Mutates the given GameState by simulating one frame of active spell effects
export function simulateSpellEffects(state: GameState): void {
    state.spells.active = state.spells.active.filter(spell => !isDone(spell))
    for (let spell of state.spells.active) {
        simulateSpell(spell, state.players, state.grid);
    }
}

// Mutates the given arguements after simulating one frame of the spell
function simulateSpell(spell: SpellState, players: PlayersState, grid: GridState): void {
    spell.frame++;

    // Handle movements
    spell.definition.updateGridObject(spell.gridObject, grid, spell.frame)

    // Handle effects on players
    if (spell.definition.applyToPlayer && spell.affectedPlayers.includes("P1") && isColliding(spell.gridObject, players.p1.gridObject)) {
        spell.definition.applyToPlayer(players.p1)
    }
    if (spell.definition.applyToPlayer && spell.affectedPlayers.includes("P2") && isColliding(spell.gridObject, players.p2.gridObject)) {
        spell.definition.applyToPlayer(players.p2);
    }

    // Handle effects on grid
    // TODO: should not be able to affect the grid if players are standing on it
    if (spell.definition.applyToGrid) {
        spell.definition.applyToGrid(grid);
    }
}

function isDone(state: SpellState): boolean {
    return state.frame >= state.definition.durationFrames;
}