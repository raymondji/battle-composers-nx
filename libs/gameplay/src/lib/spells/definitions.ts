import { GridObject, GridState, moveLeft, moveRight, Tile } from '../grid';
import { getOpponent, PlayerDefinition, PlayerId } from '../player/definitions';
import { PlayerState, takeDamage } from '../player/simulation';

export interface SpellDefinition {
  name: string; // should be unique
  notes: string[];
  durationFrames: number; // number of frames that the spell lasts for
  updateGridObject: (
    gridObject: GridObject,
    grid: GridState,
    caster: PlayerDefinition,
    frame: number
  ) => void;
  getInitialGridObject: (player: PlayerState) => GridObject;
  applyToPlayer?: (player: PlayerState, frame: number) => void;
  applyToGrid?: (grid: GridState) => void;
  getAffectedPlayers: (caster: PlayerId, opponent: PlayerId) => PlayerId[];
}

const furElise: SpellDefinition = {
  name: 'Fur Elise',
  notes: ['E', 'D#', 'E', 'D#', 'E', 'B', 'D', 'C', 'A'],
  durationFrames: 30,
  getInitialGridObject: (player: PlayerState) => {
    const deltaX = player.definition.facing === 'right' ? 1 : -1;
    const tile: Tile = {
      x: player.gridObject.tiles[0].x + deltaX,
      y: player.gridObject.tiles[0].y,
    };

    return {
      tiles: [tile],
    };
  },
  updateGridObject: (
    gridObject: GridObject,
    grid: GridState,
    caster: PlayerDefinition,
    frame: number
  ) => {
    if (frame % 5 !== 0) {
      return;
    }
    // TODO: account for which player it is
    if (caster.facing === 'right') {
      moveRight(gridObject, grid);
    } else {
      moveLeft(gridObject, grid);
    }
  },
  applyToPlayer: (player: PlayerState, frame: number) => {
    takeDamage(player, 5, frame);
  },
  getAffectedPlayers: (caster: PlayerId, opponent: PlayerId) => {
    return [opponent];
  },
};

export const spellDefinitions = {
  furElise,
};

export type SpellDefinitionKeys = keyof typeof spellDefinitions;
