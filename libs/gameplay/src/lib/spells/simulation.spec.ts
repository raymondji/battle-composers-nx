import {
  initSpellsState,
  initSpellState,
  simulateSpellEffects,
} from './simulation';
import { GameState, initGameState } from '../gameplay';
import { initPlayersState } from '../player/simulation';
import { beethoven } from '../characters';
import { spellDefinitions } from './definitions';
import { isColliding, moveLeft, moveRight } from '../grid';

test('initPlayersState', () => {});

describe('simulateSpellEffects', () => {
  test('removes done spells', () => {
    const gs = initGameState({ p1: beethoven, p2: beethoven });
    const spell = initSpellState('furElise', gs.players.p1, 10);
    gs.spells.active.push(spell);
    simulateSpellEffects(gs, 10);
    expect(gs.spells.active).toHaveLength(1);
    simulateSpellEffects(gs, 10 + spellDefinitions['furElise'].durationFrames);
    expect(gs.spells.active).toHaveLength(0);
  });

  test('applies spell only if colliding and affects player', () => {
    const gs = initGameState({ p1: beethoven, p2: beethoven });
    // Make the two players stand one space apart
    gs.players.p1.gridObject.tiles[0].x = 2;
    gs.players.p2.gridObject.tiles[0].x = 4;
    gs.players.p2.gridObject.tiles[0].y = 0;
    expect(gs.players.p1.hitPoints).toEqual(100);
    expect(gs.players.p2.hitPoints).toEqual(100);
    const spell = initSpellState('furElise', gs.players.p2, 10);
    gs.spells.active.push(spell);

    // Verify it does not apply if colliding but spell does not affect the player
    moveLeft(gs.players.p2.gridObject, gs.grid);
    expect(isColliding(spell.gridObject, gs.players.p1.gridObject)).toBe(false);
    expect(isColliding(spell.gridObject, gs.players.p2.gridObject)).toBe(true);
    simulateSpellEffects(gs, 10);
    expect(gs.players.p2.hitPoints).toEqual(100);

    // Verify it does apply if colliding and spell does affect the player
    expect(isColliding(spell.gridObject, gs.players.p1.gridObject)).toBe(true);
    simulateSpellEffects(gs, 11);
    expect(gs.players.p1.hitPoints).toEqual(95);
    expect(gs.players.p1.status.name).toEqual('injured');
  });

  test('applies spell to grid if affects grid', () => {});
});
