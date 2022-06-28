import { GridState, initGridState } from './grid';
import { PlayerId } from './player/definitions';
import { PlayersState, simulatePlayerActions } from './player/simulation';
import { RollbackGameEngine } from './rollback';
import {
  initSpellsState,
  initSpellState,
  simulateSpellEffects,
  SpellsState,
} from './spells/simulation';

// All data stored in GameState must be serializable
export interface GameState {
  players: PlayersState;
  spells: SpellsState;
  grid: GridState;
}

export interface PlayerInputs {
  w: boolean;
  a: boolean;
  s: boolean;
  d: boolean;
  up: boolean;
  down: boolean;
  left: boolean;
  right: boolean;
  space: boolean;
}

export interface Inputs {
  p1: PlayerInputs;
  p2: PlayerInputs;
}

function simulate(
  prevState: GameState,
  inputs: Inputs,
  frame: number
): GameState {
  const nextState: GameState = JSON.parse(JSON.stringify(prevState));
  simulateSpellEffects(nextState, frame);
  simulatePlayerActions(nextState, inputs, frame);
  return nextState;
}

export interface Game {
  tick(): GameState;
  isOver(): boolean;
  isWaiting(): boolean;
  getWinner(): PlayerId;
  registerRemoteInputs(inputs: Inputs): void;
  registerLocalInputs(inputs: Inputs): void;
}

export function createGame(
  localPlayer: PlayerId,
  remotePlayer: PlayerId,
  { p1, p2 }: { p1: Character; p2: Character },
  getLocalInputs: () => PlayerInputs,
  sendInputs: (inputs: PlayerInputs) => void
): Game {
  const initialState: GameState = {
    players: initPlayersState(),
    spells: initSpellsState(),
    grid: initGridState(6, 4),
  };

  const game = new RollbackGameEngine(
    getLocalInputs,
    simulate,
    isTerminal,
    sendInputs,
    initialState
  );

  return game;
}

function initPlayersState(): PlayersState {
  throw new Error('Function not implemented.');
}
