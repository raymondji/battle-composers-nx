import { PlayerId } from "../gameplay";


// Supports two players, one local and one remote
export class RollbackGameEngine<GS, I> {
  private localFrame: number;
  private confirmedFrame: number; // frame corresponding to the last confirmed game state
  private storedInputs: Map<number, Map<PlayerId, I>>;
  private storedGameStates: Map<number, GS>;

  constructor(
    private getLocalInputs: () => I,
    private simulate: (gameState: GS, inputs: Map<PlayerId, I>) => GS,
    private isTerminal: (gameState: GS) => boolean,
    private sendLocalInputs: (inputs: I, frame: number) => void,
    initialGameState: GS
  ) {
    this.localFrame = 0;
    this.confirmedFrame = 0;
    this.storedInputs = new Map();
    this.storedGameStates = new Map([[0, initialGameState]]);
    for (let f = 0; f <= INPUT_DELAY; ++f) {
      this.storedInputs.set(f, new Map());
    }
  }

  tick(): boolean {
    const localGameState = this.storedGameStates.get(this.localFrame);
    if (localGameState && this.isTerminal(localGameState)) {
      return true;
    }

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
    return false;
  }

  addRemoteInputs(frame: number, playerId: string, inputs: I) {
    if (!this.storedInputs.has(frame)) {
      this.storedInputs.set(frame, new Map());
    }
    this.storedInputs.get(frame).set(playerId, inputs);
    console.log("registered remote inputs: ", frame, playerId, inputs);
  }

  addLocalInputs(inputs: I) {
    const queuedFrame = this.localFrame + INPUT_DELAY;
    if (!this.storedInputs.has(queuedFrame)) {
      this.storedInputs.set(queuedFrame, new Map());
    }
    this.storedInputs.get(queuedFrame).set(this.localPlayerId, inputs);
    this.sendLocalInputs(inputs, queuedFrame);
  }


}