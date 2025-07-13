export interface WaveDefinition {
    id: string;
    name: string;
    patternIds: string[];
}

export interface LevelDefinition {
    id: string;
    name: string;
    startHpMultiplier: number;
    endHpMultiplier: number;
    startSpeed: number;
    endSpeed: number;
    waves: WaveDefinition[];
}

export type PatternDefinition = {
    id: string;
    pattern: string[][];
};

export enum MobDisplayType {
    Standard = "standard",
    Strong = "strong",
    Resistant = "resistant",
}

export type MobDefinition = {
    displayType: MobDisplayType;
    id: string;
    name?: string; // Optional name for display purposes
    minHp: number;
    maxHp: number;
    drops?: string[];
    liftResistance?: number; // Optional lift resistance value
};
