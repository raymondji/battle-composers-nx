import { GameState, Inputs, PlayerInputs } from '../gameplay';
import {
  GridObject,
  GridState,
  moveDown,
  moveLeft,
  moveRight,
  moveUp,
} from '../grid';
import { SpellDefinitionKeys, spellDefinitions } from '../spells/definitions';
import { Direction, getCastSequence } from '../spells/sequence';
import { initSpellState, SpellsState, SpellState } from '../spells/simulation';
import { PlayerDefinition } from './definitions';

export interface PlayersState {
  p1: PlayerState;
  p2: PlayerState;
}

export interface PlayerState {
  status: PlayerStatus;
  statusEndFrame: number; // frame on which the status should end
  castSequenceIndex: number;
  castSequence: Direction[];
  hitPoints: number;
  gridObject: GridObject;
  selectedSpellLevel: 'easy' | 'medium' | 'hard';
  selectedSpell: SpellDefinitionKeys;
  definition: PlayerDefinition;
  connection: 'local' | 'remote';
}

export type PlayerStatus = 'default' | 'casting' | 'castSuccess' | 'injured';

export function simulatePlayerActions(
  state: GameState,
  inputs: Inputs,
  frame: number
) {
  simulatePlayer(state.players.p1, state.grid, state.spells, inputs.p1, frame);
  simulatePlayer(state.players.p2, state.grid, state.spells, inputs.p2, frame);
}

// Returns the next player state and any updated spells that were cast
export function simulatePlayer(
  player: PlayerState,
  grid: GridState,
  spells: SpellsState,
  inputs: PlayerInputs,
  frame: number
) {
  switch (player.status) {
    case 'default':
      handleMoveInput(player, inputs, grid);
      handleStartCastInput(player, inputs, frame);
      return;
    case 'castSuccess':
      handleMoveInput(player, inputs, grid);
      handleStatusEnd(player, frame);
      return;
    case 'injured':
      handleMoveInput(player, inputs, grid);
      handleStatusEnd(player, frame);
      return;
    case 'casting':
      handleMoveInput(player, inputs, grid);
      handleCastDirectionInput(player, inputs);
      handleCastSuccess(player, spells, frame);
      return;
    default:
      exhaustiveCheck(player.status);
  }
}

export interface DefaultState {
  name: 'default';
}

export interface CastSuccessState {
  name: 'castSuccess';
  spell: string;
}

export interface CastFailState {
  name: 'castFail';
}

export interface InjuredState {
  name: 'injured';
}

export interface CastingState {
  name: 'casting';
}

export function takeDamage(player: PlayerState, amount: number, frame: number) {
  if (player.status === 'injured') {
    return; // invulnerable while the status lasts
  }

  player.hitPoints -= amount;
  player.status = 'injured';
  player.statusEndFrame = frame + 10;
}

export function handleStatusEnd(player: PlayerState, frame: number) {
  if (player.statusEndFrame === frame) {
    player.status = 'default';
  }
}

export function handleMoveInput(
  player: PlayerState,
  inputs: PlayerInputs,
  grid: GridState
) {
  if (inputs.w) {
    moveUp(player.gridObject, grid);
  } else if (inputs.a) {
    moveLeft(player.gridObject, grid);
  } else if (inputs.s) {
    moveDown(player.gridObject, grid);
  } else if (inputs.d) {
    moveRight(player.gridObject, grid);
  }
}

export function handleStartCastInput(
  player: PlayerState,
  inputs: PlayerInputs,
  frame: number
) {
  if (!inputs.space) {
    return;
  }

  const spellDef = spellDefinitions[player.selectedSpell];
  player.status = 'casting';
  player.castSequenceIndex = 0;
  player.castSequence = getCastSequence(spellDef.notes, frame);
}

export function handleCastDirectionInput(
  player: PlayerState,
  inputs: PlayerInputs
) {
  if (inputs.w && player.castSequence[player.castSequenceIndex] === 'Up') {
    player.castSequenceIndex++;
  } else if (
    inputs.s &&
    player.castSequence[player.castSequenceIndex] === 'Down'
  ) {
    player.castSequenceIndex++;
  } else if (
    inputs.a &&
    player.castSequence[player.castSequenceIndex] === 'Left'
  ) {
    player.castSequenceIndex++;
  } else if (
    inputs.d &&
    player.castSequence[player.castSequenceIndex] === 'Right'
  ) {
    player.castSequenceIndex++;
  }
}

export function handleCastSuccess(
  player: PlayerState,
  spells: SpellsState,
  frame: number
) {
  if (player.castSequenceIndex < player.castSequence.length) {
    return;
  }
  player.status = 'castSuccess';
  player.statusEndFrame = frame + 10;
  spells.active.push(initSpellState(player.selectedSpell, player));
}

function exhaustiveCheck(param: never): never {
  throw new Error('should not reach here');
}
