import {
  createGame,
  GameState,
  PlayerInputs,
} from '@battle-composers-nx/gameplay';

import React, { useEffect } from 'react';
import { useMultiplayer } from '../multiplayer';
import { Page } from '../app/app';
import { Container } from '@nextui-org/react';
import { characters } from 'libs/gameplay/src/lib/characters';
import kaboom, { KaboomCtx } from 'kaboom';

type CombatProps = {
  setPage: (page: Page) => void;
};

export function Combat({ setPage }: CombatProps) {
  const { sendInputs, setRemoteInputListener } = useMultiplayer();
  const canvasRef = React.useRef(null);

  // just make sure this is only run once on mount so your game state is not messed up
  useEffect(() => {
    if (!canvasRef.current) {
      return;
    }

    const k = kaboom({
      width: 960,
      height: 540,
      scale: 1,
      global: true,
      canvas: canvasRef.current,
    });
    const renderer = createSimpleRenderer(k);
    const game = createGame(
      { local: 'P1', remote: 'P2' },
      { p1: characters.beethoven, p2: characters.mozart }
    );
    setRemoteInputListener(game.registerRemoteInputs);

    const cancel = k.onUpdate(() => {
      console.log('running game loop');
      const inputs = getLocalInputs(k);
      const frame = game.registerLocalInputs(inputs);
      if (frame !== -1) {
        sendInputs(inputs);
      }
      const gameState = game.tick();
      renderer.render(gameState, game.isWaiting(gameState));

      if (game.isOver(gameState)) {
        const winner = game.getWinner(gameState);
        console.log(`winner is ${winner}`);
        cancel();
        setPage('gameOver');
      }
    });
  }, [canvasRef.current]);

  console.log('rendering combat');
  return (
    <Container>
      Combat started
      <canvas ref={canvasRef} />
    </Container>
  );
}

export interface Renderer {
  render: (gs: GameState, networkPause: boolean) => void;
}

export function createSimpleRenderer(k: KaboomCtx): Renderer {
  k.loadSprite('battle-bg', 'assets/background/battle.png');
  k.loadSprite('mozart', 'assets/composers/mozart.png');
  k.loadSprite('beethoven', 'assets/composers/beethoven.png');

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

function getLocalInputs(k: KaboomCtx): PlayerInputs {
  return {
    left: k.isKeyPressed('left'),
    right: k.isKeyPressed('right'),
    up: k.isKeyPressed('up'),
    down: k.isKeyPressed('down'),
    w: k.isKeyPressed('w'),
    a: k.isKeyPressed('a'),
    s: k.isKeyPressed('s'),
    d: k.isKeyPressed('d'),
    space: k.isKeyPressed('space'),
  };
}
