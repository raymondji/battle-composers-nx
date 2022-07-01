import { SpellDefinition } from '.';
import { PlayerId } from '../../engine';
import { GridObject, GridState, moveLeft, moveRight, Tile } from '../../grid';
import { PlayerFacingDirection } from '../../player/definitions';
import { PlayerState, takeDamage } from '../../player/simulation';

export const furElise: SpellDefinition = {
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
    casterFacing: PlayerFacingDirection,
    frame: number
  ) => {
    if (frame % 5 !== 0) {
      return;
    }
    if (casterFacing === 'right') {
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
