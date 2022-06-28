import { Character } from './characters';
import { GridState, initGridState } from './grid';
import { PlayerId } from './player/definitions';
import {
  initPlayersState,
  PlayersState,
  simulatePlayerActions,
} from './player/simulation';
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

function isGameOver(state: GameState): boolean {
  return state.players.p1.hitPoints === 0 || state.players.p2.hitPoints === 0;
}

// Should only be called if the game is over
function getWinner(state: GameState): PlayerId {
  return state.players.p1.hitPoints === 0 ? 'P2' : 'P1';
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
  characters: { p1: Character; p2: Character },
  getLocalInputs: () => PlayerInputs,
  sendInputs: (inputs: PlayerInputs) => void
): Game {
  const initialState: GameState = {
    players: initPlayersState(characters),
    spells: initSpellsState(),
    grid: initGridState(6, 4),
  };

  const game = new RollbackGameEngine(
    getLocalInputs,
    simulate,
    isGameOver,
    sendInputs,
    initialState
  );

  return game;
}
