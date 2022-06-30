import { beethoven } from '../characters';
import { initGridState } from '../grid';
import { initSpellsState } from '../spells/simulation';
import { Player1 } from './definitions';
import {
  handleCastDirectionInput,
  handleCastSuccess,
  handleMoveInput,
  handleStartCastInput,
  handleStatusEnd,
  initPlayerState,
  simulatePlayer,
  takeDamage,
} from './simulation';

test('handleSimulatePlayer', () => {
  const p = initPlayerState(Player1, beethoven);
  const g = initGridState(4, 2);
  const ss = initSpellsState();
  simulatePlayer(p, g, ss, { d: true, space: true }, 10);
  expect(p.status.name).toEqual('casting');
  expect(p.gridObject.tiles[0]).toEqual({ x: 1, y: 0 });
});

test('handleStatusEnd', () => {
  const p = initPlayerState(Player1, beethoven);
  p.status = {
    name: 'castSuccess',
    startFrame: 10,
  };
  handleStatusEnd(p, 19, 10);
  expect(p.status.name).toEqual('castSuccess');
  handleStatusEnd(p, 20, 10);
  expect(p.status.name).toEqual('default');
});

test('handleMoveInput', () => {
  const p = initPlayerState(Player1, beethoven);
  const g = initGridState(4, 2);

  expect(p.gridObject.tiles[0]).toEqual({ x: 0, y: 0 });
  handleMoveInput(p, { s: true }, g);
  expect(p.gridObject.tiles[0]).toEqual({ x: 0, y: 1 });
  handleMoveInput(p, { a: true }, g); // outside grid, no move
  expect(p.gridObject.tiles[0]).toEqual({ x: 0, y: 1 });
});

test('handleStartCastInput', () => {
  const p = initPlayerState(Player1, beethoven);

  expect(p.status.name).toEqual('default');
  expect(p.castSequence.length).toBe(0);
  handleStartCastInput(p, { space: true }, 10);
  expect(p.status.name).toEqual('casting');
  expect(p.status.startFrame).toEqual(10);
  expect(p.castSequence.length).toBeGreaterThan(0);
  expect(p.castSequenceIndex).toEqual(0);
});

test('handleCastDirectionInput', () => {
  const p = initPlayerState(Player1, beethoven);
  handleStartCastInput(p, { space: true }, 10);
  p.castSequence = ['Up', 'Down']; // override for testing
  expect(p.status.name).toEqual('casting');
  expect(p.castSequenceIndex).toEqual(0);

  // correct
  handleCastDirectionInput(p, { up: true });
  expect(p.status.name).toEqual('casting');
  expect(p.castSequenceIndex).toEqual(1);

  // incorrect, should have updated after the first direction was input
  handleCastDirectionInput(p, { up: true });
  expect(p.castSequenceIndex).toEqual(1);

  // correct
  handleCastDirectionInput(p, { down: true });
  expect(p.castSequenceIndex).toEqual(2);
});

test('handleCastSuccess', () => {
  const p = initPlayerState(Player1, beethoven);
  const ss = initSpellsState();
  handleStartCastInput(p, { space: true }, 10);
  p.castSequence = ['Up']; // override for testing

  // should do nothing, cast sequence not complete yet
  handleCastSuccess(p, ss, 10);
  expect(p.status.name).toEqual('casting');
  expect(ss.active).toHaveLength(0);

  // should work now, cast sequence complete
  handleCastDirectionInput(p, { up: true });
  handleCastSuccess(p, ss, 10);
  expect(p.status.name).toEqual('castSuccess');
  expect(ss.active).toHaveLength(1);
  expect(ss.active[0].definitionKey).toEqual(p.selectedSpell);
});

test('takeDamage', () => {
  const p = initPlayerState(Player1, beethoven);
  expect(p.hitPoints).toEqual(100);
  takeDamage(p, 50, 10);
  expect(p.hitPoints).toEqual(50);
  expect(p.status.name).toEqual('injured');
  expect(p.status.startFrame).toEqual(10);

  // Second cast should not do anything while the player is invulnerable
  takeDamage(p, 50, 11);
  expect(p.hitPoints).toEqual(50);
  expect(p.status.name).toEqual('injured');
  expect(p.status.startFrame).toEqual(10);
});
