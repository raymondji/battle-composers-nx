import { Inputs } from "../gameplay";
import { GridObject, isColliding, moveDown, moveLeft, moveRight, moveUp } from "../grid";
import { SpellsState } from "../spells";

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
  player: Player,
}

export interface Player {
  id: PlayerId,
  initialGridObject: GridObject,
  totalHitPoints: number,
}

export function simulatePlayer(state: PlayerState, inputs: Inputs, spellsState: SpellsState): PlayerState {
  let nextState: PlayerState = structuredClone(state);

  // Handle movement
  if (inputs.w) {
    nextState.gridObject = moveUp(state.gridObject);
  } else if (inputs.a) {
    nextState.gridObject = moveLeft(state.gridObject);
  } else if (inputs.s) {
    nextState.gridObject = moveDown(state.gridObject);
  } else if (inputs.d) {
    nextState.gridObject = moveRight(state.gridObject);
  }

  // Handle spell interactions
  const affectingSpells = spellsState.activeSpells.filter(spell => spell.affectedPlayers.includes(nextState.player.id));
  for (let spell of affectingSpells) {
    if (isColliding(nextState.gridObject, spell.gridObject)) {
      nextState = spell.spell.applyTo(nextState)
    }
  }

  return nextState
}

export interface DefaultState {
  name: "default",
}
export interface CastSuccessState {
  name: "castSuccess",
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