import {
  EngineParams,
  initEngineState,
  Inputs,
  registerLocalInputs,
  registerRemoteInputs,
  SimulationFunc,
  tick,
} from '.';

const simulate: SimulationFunc<string, string> = (
  gameState: string,
  inputs: Inputs<string>
): string => {
  return `${gameState} (p1:${inputs.p1},p2:${inputs.p2})`;
};

const engineParams: EngineParams<string, string> = {
  players: { local: 'P1', remote: 'P2' },
  emptyPlayerInputs: '',
  simulate,
  inputDelay: 2,
  pauseThreshold: 3,
};

describe('tick', () => {
  test('resimulates unconfirmed frames', () => {
    const state = initEngineState<string, string>('', engineParams);
    tick(state, engineParams);
    tick(state, engineParams);
    expect(state.localGameState).toEqual(' (p1:,p2:) (p1:,p2:)');
    expect(state.localFrame).toBe(2);
    expect(state.confirmedFrame).toBe(0);
    registerRemoteInputs(state, engineParams, 'abc', 1);
    tick(state, engineParams);
    expect(state.confirmedFrame).toBe(1);
    expect(state.confirmedGameState).toEqual(' (p1:,p2:) (p1:,p2:abc)');
    expect(state.localFrame).toBe(3);
    expect(state.localGameState).toEqual(' (p1:,p2:) (p1:,p2:abc) (p1:,p2:)');
  });

  test('sets isWaiting to be true and stops predicting if too far ahead', () => {
    const state = initEngineState<string, string>('', engineParams);
    tick(state, engineParams);
    tick(state, engineParams);
    tick(state, engineParams);
    const expectedGs = ' (p1:,p2:) (p1:,p2:) (p1:,p2:)';
    expect(state.isWaiting).toBe(false);
    expect(state.localGameState).toEqual(expectedGs);
    expect(state.localFrame).toEqual(3);
    expect(state.confirmedFrame).toEqual(0);

    tick(state, engineParams);
    // both should remain unchanged
    expect(state.localGameState).toEqual(expectedGs);
    expect(state.localFrame).toEqual(3);
    expect(state.isWaiting).toBe(true);
  });

  test('predicts 1 frame ahead', () => {
    const state = initEngineState<string, string>('', engineParams);
    expect(state.localFrame).toBe(0);
    tick(state, engineParams);
    expect(state.localGameState).toEqual(' (p1:,p2:)');
    expect(state.localFrame).toBe(1);
    expect(state.confirmedFrame).toBe(0);
  });

  test('uses empty inputs if inputs missing', () => {
    const state = initEngineState<string, string>('', engineParams);
    tick(state, engineParams);
    expect(state.localGameState).toEqual(' (p1:,p2:)');
  });
});

describe('registerRemoteInputs', () => {
  test('adds new stored inputs', () => {
    const state = initEngineState<string, string>('', engineParams);
    registerRemoteInputs(state, engineParams, 'abc', 5);
    expect(state.storedInputs.get(5)).toEqual({ p2: 'abc' });
  });

  test('updates existing stored inputs', () => {
    const state = initEngineState<string, string>('', engineParams);
    registerLocalInputs(state, engineParams, 'qty');
    registerRemoteInputs(state, engineParams, 'abc', engineParams.inputDelay);
    expect(state.storedInputs.get(engineParams.inputDelay)).toEqual({
      p1: 'qty',
      p2: 'abc',
    });
  });
});

describe('registerLocalInputs', () => {
  test('adds new stored inputs', () => {
    const state = initEngineState<string, string>('', engineParams);
    const f = registerLocalInputs(state, engineParams, 'abc');
    expect(f).toBe(engineParams.inputDelay);
    expect(state.storedInputs.get(f)).toEqual({ p1: 'abc' });
  });

  test('updates existing stored inputs', () => {
    const state = initEngineState<string, string>('', engineParams);
    registerRemoteInputs(state, engineParams, 'abc', engineParams.inputDelay);
    registerLocalInputs(state, engineParams, 'qty');
    expect(state.storedInputs.get(engineParams.inputDelay)).toEqual({
      p1: 'qty',
      p2: 'abc',
    });
  });

  test('rejects duplicate inputs for frame and returns -1', () => {
    const state = initEngineState<string, string>('', engineParams);
    const got1 = registerLocalInputs(state, engineParams, 'qty');
    expect(got1).toEqual(engineParams.inputDelay);
    const got2 = registerLocalInputs(state, engineParams, 'awd');
    expect(got2).toEqual(-1);
    expect(state.storedInputs.get(engineParams.inputDelay)).toEqual({
      p1: 'qty',
    });
  });
});
