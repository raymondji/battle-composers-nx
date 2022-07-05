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
  pauseThreshold: 4,
};

describe('tick', () => {
  test('advances confirmedFrame only while inputs are confirmed', () => {
    const state = initEngineState<string, string>('', engineParams);
    // register local first to account for input delay
    registerLocalInputs(state, engineParams, 'qty');
    expect(state.confirmedFrame).toBe(0);

    tick(state, engineParams);
    expect(state.confirmedFrame).toBe(1);

    tick(state, engineParams);
    expect(state.confirmedFrame).toBe(2);

    tick(state, engineParams);
    // remote inputs are not confirmed yet for frame 2, so should not advance
    expect(state.confirmedFrame).toBe(2);

    registerRemoteInputs(state, engineParams, 'abc', 2);
    tick(state, engineParams);
    expect(state.confirmedFrame).toBe(3);
  });

  test('resimulates unconfirmed frames', () => {
    const state = initEngineState<string, string>('', engineParams);
    // register local first to account for input delay
    registerLocalInputs(state, engineParams, 'qty');

    tick(state, engineParams);
    tick(state, engineParams);
    tick(state, engineParams);
    expect(state.localGameState).toEqual(' (p1:,p2:) (p1:,p2:) (p1:qty,p2:)');
    expect(state.localFrame).toBe(3);
    expect(state.confirmedGameState).toEqual(' (p1:,p2:) (p1:,p2:)');
    expect(state.confirmedFrame).toBe(2);

    registerRemoteInputs(state, engineParams, 'abc', 2);
    tick(state, engineParams);
    expect(state.localGameState).toEqual(
      ' (p1:,p2:) (p1:,p2:) (p1:qty,p2:abc) (p1:,p2:)'
    );
    expect(state.localFrame).toEqual(4);
    expect(state.confirmedFrame).toBe(3);
    expect(state.confirmedGameState).toEqual(
      ' (p1:,p2:) (p1:,p2:) (p1:qty,p2:abc)'
    );
  });

  test('simulates 1 local frame per tick while not paused', () => {
    const state = initEngineState<string, string>('', engineParams);
    expect(state.localFrame).toBe(0);

    tick(state, engineParams);
    expect(state.localGameState).toEqual(' (p1:,p2:)');
    expect(state.localFrame).toBe(1);

    tick(state, engineParams);
    expect(state.localGameState).toEqual(' (p1:,p2:) (p1:,p2:)');
    expect(state.localFrame).toBe(2);

    tick(state, engineParams);
    expect(state.localGameState).toEqual(' (p1:,p2:) (p1:,p2:) (p1:,p2:)');
    expect(state.localFrame).toBe(3);
  });

  test('sets isWaiting to be true and stops local simulation if too far ahead', () => {
    const state = initEngineState<string, string>('', engineParams);
    for (let i = 0; i < 6; ++i) {
      tick(state, engineParams);
    }
    const expectedGs =
      ' (p1:,p2:) (p1:,p2:) (p1:,p2:) (p1:,p2:) (p1:,p2:) (p1:,p2:)';
    expect(state.localGameState).toEqual(expectedGs);
    expect(state.localFrame).toEqual(6);
    expect(state.confirmedFrame).toEqual(2);
    expect(state.isWaiting).toBe(false);

    tick(state, engineParams);
    expect(state.localGameState).toEqual(expectedGs);
    expect(state.localFrame).toEqual(6);
    expect(state.isWaiting).toBe(true);
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
