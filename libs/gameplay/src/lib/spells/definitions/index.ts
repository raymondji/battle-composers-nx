import { PlayerId } from '../../engine';
import { GridObject, GridState } from '../../grid';
import { PlayerFacingDirection } from '../../player/definitions';
import { PlayerState } from '../../player/simulation';
import { furElise } from './furElise';

export interface SpellDefinition {
  name: string; // should be unique
  notes: string[];
  durationFrames: number; // number of frames that the spell lasts for
  updateGridObject: (
    gridObject: GridObject,
    grid: GridState,
    casterFacing: PlayerFacingDirection,
    frame: number
  ) => void;
  getInitialGridObject: (player: PlayerState) => GridObject;
  applyToPlayer?: (player: PlayerState, frame: number) => void;
  applyToGrid?: (grid: GridState) => void;
  getAffectedPlayers: (caster: PlayerId, opponent: PlayerId) => PlayerId[];
}

export const spellDefinitions = {
  furElise,
};

export type SpellDefinitionKeys = keyof typeof spellDefinitions;
