import { GameState } from '@battle-composers-nx/gameplay';
import kaboom, { KaboomCtx } from 'kaboom';

export interface Renderer {
  render: (gs: GameState, networkPause: boolean) => void;
}

export function createSimpleRenderer(k: KaboomCtx): Renderer {
  k.loadSprite('battle-bg', 'assets/renderer/background/battle.png');
  k.loadSprite('mozart', 'assets/renderer/composers/mozart.png');
  k.loadSprite('beethoven', 'assets/renderer/composers/beethoven.png');

  return {
    render: (gs: GameState, networkPause: boolean) => {
      simpleRender(gs, networkPause, k);
    },
  };
}

function simpleRender(gs: GameState, networkPause: boolean, k: KaboomCtx) {
  k.layers(['bg', 'game', 'ui'], 'game');
  k.add([k.sprite('battle-bg'), k.layer('bg')]);
  k.add([
    k.text(JSON.stringify(gs, null, 2), { size: 14, width: 320 }),
    k.layer('ui'),
  ]);
}
