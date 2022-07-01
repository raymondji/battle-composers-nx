const DEFAULT_INPUT_DELAY = 3;
const DEFAULT_PAUSE_THRESHOLD = 12;

export type MultiplayerRollbackGameEngine<G, I> = {
  tick(): G;
  isWaiting(): boolean;
  registerRemoteInputs(playerInputs: I, frame: number): void;
  // Returns the frame number the inputs were registered on
  // Returns -1 if the inputs were rejected
  registerLocalInputs(playerInputs: I): number;
};

export type PlayerId = 'P1' | 'P2';

type PlayerConnections = {
  local: PlayerId;
  remote: PlayerId;
};

export type EngineState<G, I> = {
  localFrame: number;
  localGameState: G;
  confirmedFrame: number; // frame corresponding to the confirmedGameState
  confirmedGameState: G; // the last game state we processed with inputs from all players
  // Input i and gamestate i-1 generate gamestate i
  // TODO: make sure this holds true and I'm not off by one
  storedInputs: Map<number, PartialInputs<I>>;
  isWaiting: boolean;
};

export type EngineParams<G, I> = {
  players: PlayerConnections;
  emptyPlayerInputs: I;
  simulate: SimulationFunc<G, I>;
  inputDelay: number; // number of frames
  pauseThreshold: number; // number of frames
};

export type SimulationFunc<G, I> = (
  gameState: G,
  inputs: Inputs<I>,
  frame: number
) => G;

export function initEngineState<G, I>(
  initialGameState: G,
  params: EngineParams<G, I>
): EngineState<G, I> {
  const storedInputs = new Map<number, PartialInputs<I>>();
  for (let i = 0; i < params.inputDelay; ++i) {
    if (params.players.local === 'P1') {
      storedInputs.set(i, { p1: params.emptyPlayerInputs });
    } else {
      storedInputs.set(i, { p2: params.emptyPlayerInputs });
    }
  }

  return {
    localFrame: 0,
    localGameState: initialGameState,
    confirmedFrame: 0,
    confirmedGameState: initialGameState,
    storedInputs,
    isWaiting: false,
  };
}

export function createMultiplayerRollbackGameEngine<G, I>(
  initialGameState: G,
  players: PlayerConnections,
  emptyPlayerInputs: I,
  simulate: SimulationFunc<G, I>,
  pauseThreshold = DEFAULT_PAUSE_THRESHOLD,
  inputDelay = DEFAULT_INPUT_DELAY
): MultiplayerRollbackGameEngine<G, I> {
  const params: EngineParams<G, I> = {
    players,
    simulate,
    emptyPlayerInputs,
    inputDelay,
    pauseThreshold,
  };
  let state: EngineState<G, I> = initEngineState(initialGameState, params);

  return {
    tick: () => {
      tick(state, params);
      return state.localGameState;
    },
    isWaiting: () => {
      return state.isWaiting;
    },
    registerRemoteInputs: (playerInputs: I, frame: number) => {
      registerRemoteInputs(state, params, playerInputs, frame);
    },
    registerLocalInputs: (playerInputs: I) => {
      return registerLocalInputs(state, params, playerInputs);
    },
  };
}

export interface Inputs<T> {
  p1: T;
  p2: T;
}

export interface PartialInputs<T> {
  p1?: T;
  p2?: T;
}

export function registerRemoteInputs<G, I>(
  state: EngineState<G, I>,
  params: EngineParams<G, I>,
  playerInputs: I,
  frame: number
): void {
  if (!state.storedInputs.has(frame)) {
    state.storedInputs.set(frame, {});
  }
  const inputs = state.storedInputs.get(frame)!;
  if (params.players.remote === 'P1') {
    inputs.p1 = playerInputs;
  } else {
    inputs.p2 = playerInputs;
  }
}

export function registerLocalInputs<G, I>(
  state: EngineState<G, I>,
  params: EngineParams<G, I>,
  playerInputs: I
): number {
  const frame = state.localFrame + params.inputDelay;
  if (!state.storedInputs.has(frame)) {
    state.storedInputs.set(frame, {});
  }
  const inputs = state.storedInputs.get(frame)!;
  if (params.players.local === 'P1') {
    if (inputs.p1 !== undefined) {
      return -1;
    }
    inputs.p1 = playerInputs;
  } else {
    if (inputs.p2 !== undefined) {
      return -1;
    }
    inputs.p2 = playerInputs;
  }
  return frame;
}

// Mutates the passed in state
// Assumption: remote player should send inputs on EVERY FRAME, even if its empty inputs
// gs of frame 0 + inputs frame 1 => gs frame 1
// Returns the next game state and modifies the rollback state in place
export function tick<G, I>(
  state: EngineState<G, I>,
  params: EngineParams<G, I>
): void {
  let gs = state.confirmedGameState;

  // Rollback and resimulate frames
  for (let f = state.confirmedFrame; f < state.localFrame; f++) {
    const inputs = state.storedInputs.get(f) ?? {};
    if (inputsConfirmed(inputs)) {
      state.confirmedFrame = f;
      state.confirmedGameState = gs;
    }
    gs = params.simulate(
      gs,
      fillInPartialInputs(inputs, params.emptyPlayerInputs),
      f
    );
  }

  // Check if we need to wait for remote player to catch up
  if (state.localFrame - state.confirmedFrame >= params.pauseThreshold) {
    state.isWaiting = true;
    return;
  } else {
    state.isWaiting = false;
  }

  // Predict 1 frame forward
  const inputs = state.storedInputs.get(state.localFrame) ?? {};
  gs = params.simulate(
    gs,
    fillInPartialInputs(inputs, params.emptyPlayerInputs),
    state.localFrame
  );
  state.localFrame++;
  state.localGameState = gs;

  // cleanup
  for (const [f, _] of state.storedInputs) {
    if (f < state.confirmedFrame) {
      state.storedInputs.delete(f);
    }
  }
}

// Should check inputs for both players, other player might be running ahead
function inputsConfirmed<I>(inputs: PartialInputs<I>) {
  return inputs.p1 !== undefined && inputs.p2 !== undefined;
}

function fillInPartialInputs<I>(
  partial: PartialInputs<I>,
  emptyInputs: I
): Inputs<I> {
  return {
    p1: partial.p1 ?? emptyInputs,
    p2: partial.p2 ?? emptyInputs,
  };
}
