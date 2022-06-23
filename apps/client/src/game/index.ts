import { createGame } from "@battle-composers-nx/gameplay";
import { Renderer } from "@battle-composers-nx/renderer";

// Returns the person who won the game
export function runGameLoop(renderer: Renderer, net: NetworkLayer): PlayerId {
  const game = createGame(getLocalInputs);
  net.onReceiveRemoteInput(game.registerRemoteInput);

  while (!game.isOver()) {
    const gameState = game.tick();
    renderer.render(gameState, game.isWaiting());
  }
  return game.getWinner();
}
