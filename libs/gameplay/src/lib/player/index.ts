import { GameState, Inputs, PlayerInputs } from "../gameplay";
import { GridObject, GridState, isColliding, moveDown, moveLeft, moveRight, moveUp } from "../grid";
import { SpellState } from "../spells";

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
}

export interface PlayerDefinition {
  id: PlayerId,
  connection: "local" | "remote",
  initialGridObject: GridObject,
  totalHitPoints: number,
}

export function simulatePlayerActions(state: GameState, inputs: Inputs) {
  simulatePlayer(state.players.p1, inputs.p1)
  simulatePlayer(state.players.p2, inputs.p2)

  nextState.players.p1 = nextP1;
  nextState.players.p2 = nextP2;
  nextState.spells.active.push(...nextP1Spells)
  nextState.spells.active.push(...nextP2Spells)
  return nextState;
}

// Returns the next player state and any updated spells that were cast
export function simulatePlayer(: PlayerState, grid: GridState, inputs: PlayerInputs): [PlayerState, SpellState[]] {
  // Handle movement
  if (inputs.w) {
    nextPlayerState.gridObject = moveUp(nextPlayerState.gridObject, grid);
  } else if (inputs.a) {
    nextPlayerState.gridObject = moveLeft(nextPlayerState.gridObject);
  } else if (inputs.s) {
    nextPlayerState.gridObject = moveDown(nextPlayerState.gridObject);
  } else if (inputs.d) {
    nextPlayerState.gridObject = moveRight(nextPlayerState.gridObject);
  }

  return [nextPlayerState, []]
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