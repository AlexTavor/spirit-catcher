// src/game/api/GameDataManager.ts

import {
    LevelDefinition,
    MobDefinition,
    PatternDefinition,
} from "../logic/level/types";

interface GameData {
    mobs: MobDefinition[];
    patterns: PatternDefinition[];
    levels: LevelDefinition[];
}

/**
 * A static manager for handling game data. It creates internal
 * maps for efficient ID-based lookups by game systems.
 */
export class GameDataManager {
    // Arrays are the source of truth
    private static mobs: MobDefinition[] = [];
    private static patterns: PatternDefinition[] = [];
    private static levels: LevelDefinition[] = [];

    // Maps are created for efficient lookups
    private static mobMap = new Map<string, MobDefinition>();
    private static patternMap = new Map<string, PatternDefinition>();
    private static levelMap = new Map<string, LevelDefinition>();

    /**
     * Initializes the manager with data arrays loaded by Phaser.
     */
    public static init(data: GameData): void {
        this.mobs = data.mobs || [];
        this.patterns = data.patterns || [];
        this.levels = data.levels || [];

        // Create maps for fast lookups
        this.mobs.forEach((mob) => this.mobMap.set(mob.id, mob));
        this.patterns.forEach((pattern) =>
            this.patternMap.set(pattern.id, pattern),
        );
        this.levels.forEach((level) => this.levelMap.set(level.id, level));
    }

    // --- Getters for full data arrays (for UI/editors) ---

    public static getMobs(): MobDefinition[] {
        return this.mobs;
    }

    public static getPatterns(): PatternDefinition[] {
        return this.patterns;
    }

    public static getLevels(): LevelDefinition[] {
        return this.levels;
    }

    // --- Getters for single items by ID (for game systems) ---

    public static getMobById(id: string): MobDefinition | undefined {
        return this.mobMap.get(id);
    }

    public static getPatternById(id: string): PatternDefinition | undefined {
        return this.patternMap.get(id);
    }

    public static getLevelById(id: string): LevelDefinition | undefined {
        return this.levelMap.get(id);
    }

    /**
     * Triggers a browser download for the given data array as a JSON file.
     */
    public static save(
        dataType: "mobs" | "patterns" | "levels",
        data: any[],
    ): void {
        try {
            const jsonString = JSON.stringify(data, null, 2);
            const blob = new Blob([jsonString], { type: "application/json" });
            const href = URL.createObjectURL(blob);
            const link = document.createElement("a");
            link.href = href;
            link.download = `${dataType}.json`;

            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            URL.revokeObjectURL(href);
        } catch (error) {
            console.error(`Failed to save ${dataType}.json to file.`, error);
        }
    }
}
