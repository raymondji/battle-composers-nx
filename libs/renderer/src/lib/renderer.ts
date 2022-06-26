import { GameState } from "@battle-composers-nx/gameplay";

export interface Renderer {
  render: (gs: GameState, networkPause: boolean) => void;
}

function createRender(): Renderer {
  return {
    render,
  }
}

function render(gs: GameState, networkPause: boolean) {

}