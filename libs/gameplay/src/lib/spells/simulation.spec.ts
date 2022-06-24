import { simulateSpellEffects } from "./simulation";
import { GameState } from "../gameplay";

describe("simulateSpellEffects", () => {
    const sampleState: GameState = {
        grid: {

        },
        players: {
        },
        spells: {
            active: [],
        },
    };

    test("removes done spells", () => {
        const state: GameState = structuredClone(sampleState);
        simulateSpellEffects(state);

    });

    test("updates spell frame counters", () => {

    });

    test("applies spell to player if affects player and is colliding", () => {

    });

    test("applies spell to grid if affects grid", () => {

    });
});