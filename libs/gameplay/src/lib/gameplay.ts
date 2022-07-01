import { Character } from './characters';
import {
  createMultiplayerRollbackGameEngine,
  Inputs,
  PlayerId,
} from './engine';
import { GridState, initGridState } from './grid';
import {
  initPlayersState,
  PlayersState,
  simulatePlayerActions,
} from './player/simulation';
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
  w?: boolean;
  a?: boolean;
  s?: boolean;
  d?: boolean;
  up?: boolean;
  down?: boolean;
  left?: boolean;
  right?: boolean;
  space?: boolean;
}

function simulate(
  prevState: GameState,
  inputs: Inputs<PlayerInputs>,
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
  isOver(gs: GameState): boolean;
  isWaiting(gs: GameState): boolean;
  getWinner(gs: GameState): PlayerId;
  registerRemoteInputs(inputs: PlayerInputs, frame: number): void;
  registerLocalInputs(inputs: PlayerInputs): number;
}

export function initGameState(characters: {
  p1: Character;
  p2: Character;
}): GameState {
  return {
    players: initPlayersState(characters),
    spells: initSpellsState(),
    grid: initGridState(6, 4),
  };
}

export function createGame(
  players: { local: PlayerId; remote: PlayerId },
  characters: { p1: Character; p2: Character }
): Game {
  const engine = createMultiplayerRollbackGameEngine(
    initGameState(characters),
    players,
    {},
    simulate
  );

  return {
    tick: engine.tick,
    isWaiting: engine.isWaiting,
    isOver: isGameOver,
    getWinner,
    registerLocalInputs: engine.registerLocalInputs,
    registerRemoteInputs: engine.registerRemoteInputs,
  };
}
