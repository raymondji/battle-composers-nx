export interface PlayerState {
    hitPoints: number,
    state: "default" | "casting" | "injured" | "cast-success" | "cast-fail",
    stateDuration: number, // frames
    selectedSpellLevel: "easy" | "medium" | "hard",
    selectedSpell: string,
    castSequenceIndex: number,
    gridX: number,
    gridY: number,
  }
  
  export type PlayerId = "P1" | "P2" | "P3" | "P4";