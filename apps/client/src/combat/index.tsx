import { createGame, PlayerInputs } from '@battle-composers-nx/gameplay';
import { createSimpleRenderer, Renderer } from '@battle-composers-nx/renderer';

import React, { useEffect, useState } from 'react';
import { nanoid } from 'nanoid';
import { useMultiplayer } from '../multiplayer';
import { Page } from '../app/app';
import { Button, Container, Input } from '@nextui-org/react';
import { PlayerId } from 'libs/gameplay/src/lib/engine';
import { characters } from 'libs/gameplay/src/lib/characters';
import kaboom, { KaboomCtx, Key } from 'kaboom';

type CombatProps = {
  setPage: (page: Page) => void;
};

export function Combat({ setPage }: CombatProps) {
  const { sendInputs, setRemoteInputListener } = useMultiplayer();
  const canvasRef = React.useRef(null);

  // just make sure this is only run once on mount so your game state is not messed up
  useEffect(() => {
    if (!canvasRef.current) {
      throw new Error('canvas undefined');
    }

    console.log('creating renderer');
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
  }, []);

  console.log('rendering combat');
  return (
    <Container>
      Combat started
      <canvas ref={canvasRef} />
    </Container>
  );
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
