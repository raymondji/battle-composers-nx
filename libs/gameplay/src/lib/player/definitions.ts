import { GridObject } from '../grid';

export type PlayerId = 'P1' | 'P2';

export interface PlayerDefinition {
  id: PlayerId;
  facing: 'left' | 'right';
  initialGridObject: GridObject;
}

export const Player1: PlayerDefinition = {
  id: 'P1',
  facing: 'right',
  initialGridObject: {
    tiles: [{ x: 0, y: 0 }],
    zoneRestriction: 'P1',
  },
};

export const Player2: PlayerDefinition = {
  id: 'P2',
  facing: 'left',
  initialGridObject: {
    tiles: [{ x: 5, y: 3 }],
    zoneRestriction: 'P2',
  },
};

export function getOpponent(id: PlayerId): PlayerId {
  return id === 'P1' ? 'P2' : 'P1';
}
