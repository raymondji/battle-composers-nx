import { GridObject } from "../grid";

export interface Composer {
    name: string; // unique
    sprite: string;
    spells: Spell[];
}

