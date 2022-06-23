import { GameState } from "../gameplay";
import { PlayerId } from "../player";

interface RollbackState<G, I> {
  localFrame: number;
  confirmedFrame: number; // frame corresponding to the confirmedGameState
  confirmedGameState: G; // the last game state we processed with inputs from all players
  storedInputs: Map<number, Map<PlayerId, I>>;
  isWaiting: boolean;
}

const INPUT_DELAY = 3;
const PAUSE_THRESHOLD = 12;
const NUM_PLAYERS = 2;

// Assumption: remote player should send inputs on EVERY FRAME, even if its empty inputs

// gs of frame 0 + inputs frame 1 => gs frame 1
// Returns the next game state and modifies the rollback state in place
export function tick<G, I>(
  state: RollbackState<G, I>,
  simulate: (gs: G, inputs: Map<PlayerId, I>) => G,
): G {
  let gs = state.confirmedGameState;
  // Rollback and resimulate frames
  for (let f = state.confirmedFrame; f < state.localFrame; f++) {
    const inputs = state.storedInputs.get(f);
    if (!inputs) {
      continue;
    }
    if (inputsConfirmed(inputs)) {
      state.confirmedFrame = f;
      state.confirmedGameState = gs;
    }
    gs = simulate(gs, inputs);
  }

  // Check if we need to wait for remote player to catch up
  if (state.localFrame - state.confirmedFrame > PAUSE_THRESHOLD) {
    state.isWaiting = true;

  }
  state.isWaiting = false;
  // Predict 1 frame forward
  const inputs = state.storedInputs.get(state.localFrame);
  if (!inputs) {
    return gs;
  }
  gs = simulate(gs, inputs);
  state.localFrame++;

  // cleanup
  for (const [f, _] of state.storedInputs) {
    if (f < state.confirmedFrame) {
      state.storedInputs.delete(f);
    }
  }

  return gs;
}

function inputsConfirmed<I>(inputs: Map<PlayerId, I>) {
  return inputs && inputs.size === NUM_PLAYERS;
}