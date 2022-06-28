import { GridObject, GridState, moveRight, Tile } from '../grid';
import { getOpponent, PlayerId } from '../player/definitions';
import { PlayerState, takeDamage } from '../player/simulation';

export interface SpellDefinition {
  name: string; // should be unique
  notes: string[];
  durationFrames: number; // number of frames that the spell lasts for
  updateGridObject: (
    gridObject: GridObject,
    grid: GridState,
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
    frame: number
  ) => {
    if (frame % 5 === 0) {
      moveRight(gridObject, grid);
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
