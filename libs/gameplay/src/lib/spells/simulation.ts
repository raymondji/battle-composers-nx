import e = require('express');
import { GameState } from '../gameplay';
import { GridObject, GridState, isColliding } from '../grid';
import { getOpponent, PlayerId } from '../player/definitions';
import { PlayersState, PlayerState } from '../player/simulation';
import { SpellDefinitionKeys, spellDefinitions } from './definitions';

export interface SpellsState {
  active: SpellState[];
}

export function initSpellsState(): SpellsState {
  return {
    active: [],
  };
}

export interface SpellState {
  frame: number; // which frame the spell is on
  gridObject: GridObject;
  definitionKey: SpellDefinitionKeys;
  affectedPlayers: PlayerId[];
}

export function initSpellState(
  definitionKey: SpellDefinitionKeys,
  caster: PlayerState
): SpellState {
  const def = spellDefinitions[definitionKey];

  return {
    frame: 0,
    gridObject: def.getInitialGridObject(caster),
    definitionKey,
    affectedPlayers: def.getAffectedPlayers(
      caster.definition.id,
      getOpponent(caster.definition.id)
    ),
  };
}

// Mutates the given GameState by simulating one frame of active spell effects
export function simulateSpellEffects(state: GameState, frame: number): void {
  state.spells.active = state.spells.active.filter((spell) => !isDone(spell));
  for (let spell of state.spells.active) {
    simulateSpell(spell, state.players, state.grid, frame);
  }
}

// Mutates the given arguements after simulating one frame of the spell
function simulateSpell(
  spell: SpellState,
  players: PlayersState,
  grid: GridState,
  frame: number
): void {
  const def = spellDefinitions[spell.definitionKey];

  spell.frame++;

  // Handle movements
  def.updateGridObject(spell.gridObject, grid, spell.frame);

  // Handle effects on players
  if (
    def.applyToPlayer &&
    spell.affectedPlayers.includes('P1') &&
    isColliding(spell.gridObject, players.p1.gridObject)
  ) {
    def.applyToPlayer(players.p1, frame);
  }
  if (
    def.applyToPlayer &&
    spell.affectedPlayers.includes('P2') &&
    isColliding(spell.gridObject, players.p2.gridObject)
  ) {
    def.applyToPlayer(players.p2, frame);
  }

  // Handle effects on grid
  // TODO: should not be able to affect the grid if players are standing on it
  if (def.applyToGrid) {
    def.applyToGrid(grid);
  }
}

function isDone(state: SpellState): boolean {
  const def = spellDefinitions[state.definitionKey];
  return state.frame >= def.durationFrames;
}
