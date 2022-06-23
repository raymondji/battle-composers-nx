import { PlayerId } from "../gameplay";

const INPUT_DELAY = 3;
const PAUSE_THRESHOLD = 12;
const NUM_PLAYERS = 2;

// Supports two players, one local and one remote
export class RollbackGameEngine<G, I> {
  private localFrame: number;
  private confirmedFrame: number; // frame corresponding to the last confirmed game state
  private storedInputs: Map<number, Map<PlayerId, I>>;
  private storedGameStates: Map<number, G>;

  constructor(
    private getLocalInputs: () => I,
    private render: (gameState: G) => void,
    private simulate: (gameState: G, inputs: Map<PlayerId, I>) => G,
    private sendLocalInputs: (inputs: I, frame: number) => void,
    initialGameState: G
  ) {
    this.localFrame = 0;
    this.confirmedFrame = 0;
    this.storedInputs = new Map();
    this.storedGameStates = new Map([[0, initialGameState]]);
    for (let f = 0; f <= INPUT_DELAY; ++f) {
      this.storedInputs.set(f, new Map());
    }
  }

  tick() {
    // TODO: pausing should still allow replays, just not predicting new frames
    // otherwise the game just gets stuck forever
    if (this.localFrame - this.confirmedFrame > PAUSE_THRESHOLD) {
      console.log(`Should pause, local frame: ${this.localFrame}, confirmed frame: ${this.confirmedFrame}`);
      // return
    }
    this.queueLocalInputs();

    // resimulate plus 1 extra frame
    // TODO: maybe separate confirmedFrame into confirmedInputs and confirmedGameState
    // if we receive input in the future (greater than localFrame), we still want to mark
    // all the previous frames as confirmed. If we only check the frames up to localFrame then
    // we miss this and never update confirmedFrame.
    // Alternatively since our game sends inputs for every frame, maybe we can simplify this
    for (let f = this.confirmedFrame; f <= this.localFrame; f++) {
      const inputs = this.storedInputs.get(f);
      const startingGameState = this.storedGameStates.get(f);
      const nextFrame = f + 1;
      const nextGameState = this.simulate(startingGameState, inputs);
      this.storedGameStates.set(nextFrame, nextGameState);

      if (this.inputsConfirmed(inputs)) {
        this.confirmedFrame = nextFrame;
      }
    }

    // cleanup
    for (const [f, _] of this.storedGameStates) {
      if (f < this.confirmedFrame) {
        this.storedGameStates.delete(f);
      }
    }
    for (const [f, _] of this.storedInputs) {
      if (f < this.confirmedFrame) {
        this.storedInputs.delete(f);
      }
    }

    this.localFrame++;
    const localGameState = this.storedGameStates.get(this.localFrame);
    this.render(localGameState);
  }

  addRemoteInputs(frame: number, playerId: string, inputs: I) {
    if (!this.storedInputs.has(frame)) {
      this.storedInputs.set(frame, new Map());
    }
    this.storedInputs.get(frame).set(playerId, inputs);
    console.log("registered remote inputs: ", frame, playerId, inputs);
  }

  private queueLocalInputs() {
    const inputs = this.getLocalInputs();
    const queuedFrame = this.localFrame + INPUT_DELAY;
    if (!this.storedInputs.has(queuedFrame)) {
      this.storedInputs.set(queuedFrame, new Map());
    }
    this.storedInputs.get(queuedFrame).set(this.localPlayerId, inputs);
    this.sendLocalInputs(inputs, queuedFrame);
  }

  private inputsConfirmed(inputs: Map<string, I>) {
    return inputs && inputs.size === NUM_PLAYERS;
  }
}