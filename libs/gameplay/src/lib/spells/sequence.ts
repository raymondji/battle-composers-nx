type Direction = "Up" | "Down" | "Left" | "Right";

export function getCastSequence(notes: string[], frame: number): Direction[] {
    const mapping = new Map<string, Direction>();
    let dir = getRandomDirection(frame);

    for (let note of notes) {
        if (mapping.has(note)) {
            continue
        }

        mapping.set(note, dir)
        dir = nextDirection(dir);
    }

    return notes.map(note => mapping.get(note)!);
}

function getRandomDirection(frame: number): Direction {
    let dir: Direction = "Up";
    for (let i = 0; i < frame % 10; i++) {
        dir = nextDirection(dir);
    }
    return dir;
}

function nextDirection(dir: Direction): Direction {
    switch (dir) {
        case "Up":
            return "Down";
        case "Down":
            return "Left"
        case "Left":
            return "Right";
        case "Right":
            return "Up";
    }
}