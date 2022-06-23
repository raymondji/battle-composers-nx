import { RollbackGameEngine } from "./rollback";

export interface GameState {
  p1State: PlayerState,
  p2State: PlayerState,
}



export interface Renderer {
  render(gameState: GameState): void,
}

export function createGame(): RollbackGameEngine {

}

// Returns the person who won the game
export async function runGameLoop(render: Renderer): Promise<PlayerId> {
  const engine = new RollbackGameEngine();
  while (true) {
    engine.tick()
  }
}
