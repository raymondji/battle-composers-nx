import { GameState, Inputs, PlayerInputs } from "../gameplay";
import { GridObject, GridState, isColliding, moveDown, moveLeft, moveRight, moveUp } from "../grid";
import { SpellsState, SpellState } from "../spells/simulation";
import { PlayerDefinition } from "./definitions";

export interface PlayersState {
  p1: PlayerState,
  p2: PlayerState,
}

export interface PlayerState {
  state: DefaultState | CastSuccessState | CastFailState | InjuredState | CastingState,
  // Common properties shared across all states
  stateDuration: number, // number of frames left in this state
  invincibilityFrames: number, // number of frames left in which the player cannot take damage
  inputLockFrames: number, // numbers of frames left in which input is ignored
  hitPoints: number,
  gridObject: GridObject,
  selectedSpellLevel: "easy" | "medium" | "hard",
  selectedSpell: string,
  definition: PlayerDefinition,
  connection: "local" | "remote",
}

export function simulatePlayerActions(state: GameState, inputs: Inputs) {
  simulatePlayer(state.players.p1, state.grid, state.spells, inputs.p1)
  simulatePlayer(state.players.p2, state.grid, state.spells, inputs.p2)
}

// Returns the next player state and any updated spells that were cast
export function simulatePlayer(player: PlayerState, grid: GridState, spells: SpellsState, inputs: PlayerInputs) {
  // Handle movement
  if (inputs.w) {
    moveUp(player.gridObject, grid);
  } else if (inputs.a) {
    moveLeft(player.gridObject, grid);
  } else if (inputs.s) {
    moveDown(player.gridObject, grid);
  } else if (inputs.d) {
    moveRight(player.gridObject, grid);
  }

  // Handle spell casts
}

export interface DefaultState {
  name: "default",
}
export interface CastSuccessState {
  name: "castSuccess",
  spell: string;
}
export interface CastFailState {
  name: "castFail",
}
export interface InjuredState {
  name: "injured",
}
export interface CastingState {
  name: "casting",
  castSequenceIndex: number,
}

export type PlayerId = "P1" | "P2";

export function takeDamage(player: PlayerState, amount: number) {
  player.hitPoints -= amount;
  player.invincibilityFrames = 8;
  player.state = {
    name: "injured",
  }
}