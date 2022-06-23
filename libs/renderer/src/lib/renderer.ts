import { GameState } from "@battle-composers-nx/gameplay";

export interface Renderer {
  render: (gs: GameState, networkPause: boolean) => void;
}
