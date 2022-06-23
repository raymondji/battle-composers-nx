import { PlayerId, PlayerState, simulatePlayer } from "./player";
import { RollbackGameEngine } from "./rollback";
import { simulateSpells, SpellsState } from "./spells";

export interface GameState {
  p1: PlayerState,
  p2: PlayerState,
  spells: SpellsState,
}

// Inputs recorded during a particular frame
export interface Inputs {
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

function simulate(state: GameState, inputs: Inputs): GameState {
  const nextSpells = simulateSpells(state.spells);
  const nextState = {
    p1: simulatePlayer(state.p1, inputs, state.spells),
    p2: simulatePlayer(state.p2, inputs, state.spells),
    spells: nextSpells,
  };
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
  composers: Map<PlayerId, Composer>,
  getLocalInputs: (inputs: Inputs) => void): Game {
}

