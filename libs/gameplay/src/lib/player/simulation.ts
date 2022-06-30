import { Character } from '../characters';
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
import { Player1, Player2, PlayerDefinition } from './definitions';

export interface PlayersState {
  p1: PlayerState;
  p2: PlayerState;
}

export function initPlayersState(characters: {
  p1: Character;
  p2: Character;
}): PlayersState {
  return {
    p1: initPlayerState(Player1, characters.p1),
    p2: initPlayerState(Player2, characters.p2),
  };
}

export interface PlayerState {
  status: PlayerStatus;
  castSequenceIndex: number;
  castSequence: Direction[];
  hitPoints: number;
  gridObject: GridObject;
  selectedSpellLevel: 'easy' | 'medium' | 'hard';
  selectedSpell: SpellDefinitionKeys;
  definition: PlayerDefinition;
  character: Character;
}

export function initPlayerState(
  definition: PlayerDefinition,
  character: Character
): PlayerState {
  return JSON.parse(
    JSON.stringify({
      status: {
        name: 'default',
        startFrame: 0,
      },
      castSequenceIndex: 0,
      castSequence: [],
      hitPoints: 100,
      gridObject: definition.initialGridObject,
      selectedSpellLevel: 'easy',
      selectedSpell: character.spells[0],
      definition,
      character,
    })
  );
}

export interface PlayerStatus {
  name: 'default' | 'casting' | 'castSuccess' | 'injured';
  startFrame: number;
}

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
  // TODO: this setup seems a bit error prone, if we change status in one of the middle
  // steps it continues to run through the original status' remaining steps
  // For now: follow the convention that only the last step can change the status
  // Maybe each status should just have one action besides moving
  switch (player.status.name) {
    case 'default':
      handleMoveInput(player, inputs, grid);
      handleStartCastInput(player, inputs, frame);
      return;
    case 'castSuccess':
      handleMoveInput(player, inputs, grid);
      handleStatusEnd(player, frame, 10);
      return;
    case 'injured':
      handleMoveInput(player, inputs, grid);
      handleStatusEnd(player, frame, 10);
      return;
    case 'casting':
      handleMoveInput(player, inputs, grid);
      handleCastDirectionInput(player, inputs);
      handleCastSuccess(player, spells, frame);
      return;
    default:
      exhaustiveCheck(player.status.name);
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
  if (player.status.name === 'injured') {
    return; // invulnerable while the status lasts
  }

  player.hitPoints -= amount;
  player.status = {
    name: 'injured',
    startFrame: frame,
  };
}

export function handleStatusEnd(
  player: PlayerState,
  frame: number,
  statusDuration: number
) {
  const elapsed = frame - player.status.startFrame;
  if (elapsed < statusDuration) {
    return;
  }

  player.status = {
    name: 'default',
    startFrame: frame,
  };
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
  player.status = {
    name: 'casting',
    startFrame: frame,
  };
  player.castSequenceIndex = 0;
  player.castSequence = getCastSequence(spellDef.notes, frame);
}

export function handleCastDirectionInput(
  player: PlayerState,
  inputs: PlayerInputs
) {
  if (inputs.up && player.castSequence[player.castSequenceIndex] === 'Up') {
    player.castSequenceIndex++;
  } else if (
    inputs.down &&
    player.castSequence[player.castSequenceIndex] === 'Down'
  ) {
    player.castSequenceIndex++;
  } else if (
    inputs.left &&
    player.castSequence[player.castSequenceIndex] === 'Left'
  ) {
    player.castSequenceIndex++;
  } else if (
    inputs.right &&
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
  player.status = {
    name: 'castSuccess',
    startFrame: frame,
  };
  spells.active.push(initSpellState(player.selectedSpell, player));
}

function exhaustiveCheck(param: never): never {
  throw new Error('should not reach here');
}
