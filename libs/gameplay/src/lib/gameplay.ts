import { GridState } from "./grid";
import { PlayerId, PlayersState, simulatePlayerActions } from "./player/simulation";
import { RollbackGameEngine } from "./rollback";
import { initSpellsState, initSpellState, simulateSpellEffects, SpellsState } from "./spells/simulation";

export interface GameState {
  players: PlayersState,
  spells: SpellsState,
  grid: GridState,
}

export interface PlayerInputs {
  w: boolean,
  a: boolean,
  s: boolean,
  d: boolean,
  up: boolean,
  down: boolean,
  left: boolean,
  right: boolean,
  space: boolean,
}

export interface Inputs {
  p1: PlayerInputs,
  p2: PlayerInputs,
}

function simulate(prevState: GameState, inputs: Inputs): GameState {
  const nextState: GameState = structuredClone(prevState);
  simulateSpellEffects(nextState);
  simulatePlayerActions(nextState, inputs);
  return nextState
}

export interface Game {
  tick(): GameState,
  isOver(): boolean,
  isWaiting(): boolean,
  getWinner(): PlayerId,
  registerRemoteInputs(inputs: Inputs): void,
  registerLocalInputs(inputs: Inputs): void,
}

export function createGame(
  localPlayer: PlayerId, remotePlayer: PlayerId,
  characters: Map<PlayerId, Character>,
  getLocalInputs: (inputs: Inputs) => void): Game {
  const initialState: GameState = {
    players: initPlayersState(),
    spells: initSpellsState(),
    grid: initGridState(),
  }

  const game = new RollbackGameEngine(getLocalInputs, simulate, isTerminal, sendLocalInputs, initalState);
  return game;
}

