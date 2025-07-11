import { Pos } from "../../../utils/Math";
import { CommandBus } from "../../api/CommandBus";
import { ConfigManager } from "../../api/ConfigManager";
import { GameCommands } from "../../consts/GameCommands";
import { getMobsState } from "../../utils/getMobsState";
import { Transform } from "../core/components/Transform";
import { System } from "../core/ECS";
import { Health } from "../mobs/components/Health";
import { HitCooldowns } from "../mobs/components/HitCooldowns";
import { Mob } from "../mobs/components/Mob";
import { LevelState } from "./LevelState";
import {
    waveDefinitions,
    patternDefinitions,
    mobDefinitions,
    PatternData,
} from "./WaveDefinition";

/**
 * Responsible for spawning mobs for a given wave. It reads the MobsState
 * component and, when the state is PRE_WAVE, it builds the entire
 * formation of mobs off-screen.
 */
export class WaveManagerSystem extends System {
    public componentsRequired = new Set<Function>();

    private lastWaveSpawned = -1;
    private patternHpCache = new Map<string, number>();

    public override update(): void {
        const mobsState = getMobsState(this.ecs);
        if (!mobsState) return;

        const { state, waveNumber } = mobsState;

        // Only spawn if the state is PRE_WAVE and we haven't already spawned this wave.
        if (
            state === LevelState.PRE_WAVE &&
            waveNumber !== this.lastWaveSpawned
        ) {
            this.spawnWave(waveNumber);
            this.lastWaveSpawned = waveNumber;

            // Immediately transition to the next state so the march can begin.
            CommandBus.emit(GameCommands.TRANSITION_TO_STATE, {
                newState: LevelState.WAVE_STARTING,
            });
        }
    }

    /**
     * Assembles and spawns a sequence of mob patterns for the given wave.
     * @param waveNumber The wave to spawn.
     */
    private spawnWave(waveNumber: number): void {
        const waveId = `wave-${waveNumber}`;
        const waveDef = waveDefinitions[waveId];
        if (!waveDef) {
            console.error(`Wave definition for ${waveId} not found.`);
            return;
        }

        // 1. Assemble a list of patterns until the wave's total HP is met.
        const selectedPatterns: PatternData[] = [];
        let currentWaveHp = 0;
        while (currentWaveHp < waveDef.totalHp) {
            // Pick a random pattern from the wave's possible patterns.
            const randomPatternId =
                waveDef.patternIds[
                    Math.floor(Math.random() * waveDef.patternIds.length)
                ];
            const patternData = patternDefinitions[randomPatternId];
            if (!patternData) {
                console.error(`Pattern ${randomPatternId} not found.`);
                continue; // Skip if a pattern is missing
            }

            selectedPatterns.push(patternData);
            currentWaveHp += this.getPatternHp(patternData);
        }

        // 2. Spawn the selected patterns in sequence, stacking them vertically.
        const config = ConfigManager.get();
        let ySpawnCursor = -config.GameHeight / 2; // Start high off-screen.

        for (const patternData of selectedPatterns) {
            const patternHeight = patternData.pattern.length * config.MobHeight;
            // The top of the new pattern is placed at the cursor, then the cursor
            // is moved up by the pattern's height to place the next one above it.
            const spawnY = ySpawnCursor - patternHeight;
            this.spawnPattern(patternData, spawnY, waveDef.hpMultiplier);
            ySpawnCursor -= patternHeight;
        }

        console.log(
            `Spawned wave ${waveNumber} with ${selectedPatterns.length} patterns.`,
        );
    }

    /**
     * Spawns a single mob pattern at a specific vertical offset.
     * @param patternData The pattern to spawn.
     * @param yOffset The vertical position for the top of the pattern.
     * @param hpMultiplier The health multiplier for the current wave.
     */
    private spawnPattern(
        patternData: PatternData,
        yOffset: number,
        hpMultiplier: number,
    ): void {
        const config = ConfigManager.get();
        const numCols = patternData.pattern[0]?.length || 1;
        const gridWidth = config.MobWidth * numCols;
        const startX = (config.GameWidth - gridWidth) / 2;

        patternData.pattern.forEach((row, y) => {
            row.forEach((mobId, x) => {
                if (!mobId || !mobDefinitions[mobId]) return;

                const position = {
                    x: startX + x * config.MobWidth,
                    y: yOffset + y * config.MobHeight,
                };

                this.createMobEntity(mobId, position, hpMultiplier);
            });
        });
    }

    /**
     * Calculates the base HP of a pattern. Caches results.
     * @param patternData The pattern to evaluate.
     * @returns The total base HP of all mobs in the pattern.
     */
    private getPatternHp(patternData: PatternData): number {
        if (this.patternHpCache.has(patternData.id)) {
            return this.patternHpCache.get(patternData.id)!;
        }

        let totalHp = 0;
        for (const row of patternData.pattern) {
            for (const mobId of row) {
                if (mobId && mobDefinitions[mobId]) {
                    // Using minHp as the base value for consistency.
                    totalHp += mobDefinitions[mobId].minHp;
                }
            }
        }

        this.patternHpCache.set(patternData.id, totalHp);
        return totalHp;
    }

    /**
     * Creates a single mob entity with all necessary components.
     * @param mobId The ID of the mob to look up in the definitions.
     * @param position The initial off-screen x and y coordinates.
     * @param hpMultiplier The health multiplier for the current wave.
     */
    private createMobEntity(
        mobId: string,
        position: Pos,
        hpMultiplier: number,
    ): void {
        const mobDef = mobDefinitions[mobId];
        const entity = this.ecs.addEntity();

        const transform = new Transform();
        transform.pos = position;
        this.ecs.addComponent(entity, transform);

        const finalHp = Math.round(mobDef.minHp * hpMultiplier);
        this.ecs.addComponent(entity, new Health(finalHp));

        this.ecs.addComponent(entity, new Mob());
        this.ecs.addComponent(entity, new HitCooldowns());
    }

    public destroy(): void {}
}
