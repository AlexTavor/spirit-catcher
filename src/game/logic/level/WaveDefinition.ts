export type WaveDefinition = {
    patternIds: string[];
    hpMultiplier: number;
    mobDescentSpeed: number;
    totalHp: number; // Total average hp of mobs to spawn in this wave
};

export type PatternData = {
    id: string;
    pattern: string[][];
};

export type MobDefinition = {
    id: string;
    minHp: number;
    maxHp: number;
    drops: string[];
};

export const waveDefinitions: Record<string, WaveDefinition> = {
    "wave-1": {
        patternIds: ["pattern-1", "pattern-2"],
        hpMultiplier: 1,
        mobDescentSpeed: 5,
        totalHp: 10000,
    },
    "wave-2": {
        patternIds: ["pattern-1", "pattern-2"],
        hpMultiplier: 1.2,
        mobDescentSpeed: 6,
        totalHp: 11000,
    },
};

export const patternDefinitions: Record<string, PatternData> = {
    "pattern-1": {
        id: "pattern-1",
        pattern: [
            ["mob-1", "mob-1", "", "", "", "", "", "mob-2", "mob-2"],
            ["", "", "", "", "", "", "", "", "mob-1"],
            [
                "",
                "mob-1",
                "mob-1",
                "mob-1",
                "mob-1",
                "mob-1",
                "mob-1",
                "mob-1",
                "",
            ],
        ],
    },
    "pattern-2": {
        id: "pattern-2",
        pattern: [
            ["mob-2", "mob-2", "", "mob-2", "mob-2", "", "", "mob-1", "mob-1"],
            ["mob-2", "", "", "", "", "", "", "", "mob-2"],
            [
                "mob-2",
                "mob-2",
                "mob-2",
                "mob-2",
                "",
                "mob-2",
                "mob-2",
                "mob-2",
                "mob-2",
            ],
        ],
    },
};

export const mobDefinitions: Record<string, MobDefinition> = {
    "mob-1": {
        id: "mob-1",
        minHp: 500,
        maxHp: 750,
        drops: [],
    },
    "mob-2": {
        id: "mob-2",
        minHp: 400,
        maxHp: 600,
        drops: [],
    },
};
