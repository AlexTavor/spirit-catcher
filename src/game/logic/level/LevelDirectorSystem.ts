import { ConfigManager } from "../../api/ConfigManager";
import { Transform } from "../core/components/Transform";
import { System, Entity } from "../core/ECS";
import { Health } from "../mobs/components/Health";
import { Mob } from "../mobs/components/Mob";
import {
    WaveDefinition,
    PatternData,
    mobDefinitions,
    waveDefinitions,
    patternDefinitions,
} from "./WaveDefinition";

export class LevelDirectorSystem extends System {
    public componentsRequired = new Set<Function>();

    private hpSpawningBudget = 0;
    private currentWaveDef: WaveDefinition | null = null;

    private distanceDescended = 0;
    private lastPatternHeight = 0; // Height in pixels of the previously spawned pattern

    private getPatternValue(pattern: PatternData): number {
        let totalHp = 0;
        for (const row of pattern.pattern) {
            for (const mobId of row) {
                if (mobDefinitions[mobId]) {
                    const mobDef = mobDefinitions[mobId];
                    const avgHp = (mobDef.minHp + mobDef.maxHp) / 2;
                    totalHp += avgHp;
                }
            }
        }
        return totalHp;
    }

    private spawnPattern(
        pattern: PatternData,
        waveDef: WaveDefinition,
        yOffset = 0,
    ): void {
        const config = ConfigManager.get();
        const numCols = pattern.pattern[0]?.length || 9;
        const gridWidth = config.MobWidth * numCols;
        const startX = (config.GameWidth - gridWidth) / 2;

        pattern.pattern.forEach((row, y) => {
            row.forEach((mobId, x) => {
                if (!mobId || !mobDefinitions[mobId]) return;

                const mobDef = mobDefinitions[mobId];
                const entity = this.ecs.addEntity();

                const transform = new Transform();
                transform.pos.x = startX + x * config.MobWidth;

                transform.pos.y = yOffset + y * config.MobHeight;
                this.ecs.addComponent(entity, transform);

                const baseHp =
                    Math.random() * (mobDef.maxHp - mobDef.minHp) +
                    mobDef.minHp;
                const finalHp = Math.round(baseHp * waveDef.hpMultiplier);

                this.ecs.addComponent(entity, new Health(finalHp));
                this.ecs.addComponent(entity, new Mob());

                if (mobDef.drops.length > 0) {
                }
            });
        });
    }

    private start(waveId = "wave-1"): void {
        this.currentWaveDef = waveDefinitions[waveId];
        if (!this.currentWaveDef) {
            console.error(`Wave with id ${waveId} not found.`);
            return;
        }

        this.hpSpawningBudget = this.currentWaveDef.totalHp;
        this.distanceDescended = 0;

        ConfigManager.get().MobDescentSpeed =
            this.currentWaveDef.mobDescentSpeed;

        // --- PRESPAWN LOGIC ---
        const prespawnPatternIds = ["pattern-1", "pattern-1", "pattern-1"];
        // The total height of the prespawned block is used to correctly
        // time the start of the next procedurally spawned pattern.
        this.lastPatternHeight = this.prespawnPatterns(prespawnPatternIds);
    }

    public update(_entities: Set<Entity>, delta: number): void {
        if (!this.currentWaveDef) {
            this.start(); // Start the first wave if not already started
            return;
        }

        if (this.hpSpawningBudget <= 0) {
            const mobs = this.ecs.getEntitiesWithComponent(Mob);
            if (mobs.length === 0) {
                console.log("Wave Complete!");
                this.currentWaveDef = null; // Stop activity
            }
            return;
        }

        const descentThisFrame =
            this.currentWaveDef.mobDescentSpeed * (delta / 1000);
        this.distanceDescended += descentThisFrame;

        // Use a while loop in case the frame rate is low and multiple patterns
        // need to be spawned in a single frame to keep up.
        while (this.distanceDescended >= this.lastPatternHeight) {
            this.distanceDescended -= this.lastPatternHeight;

            const patternId =
                this.currentWaveDef.patternIds[
                    Math.floor(
                        Math.random() * this.currentWaveDef.patternIds.length,
                    )
                ];
            const patternData = patternDefinitions[patternId];

            if (patternData) {
                this.spawnPattern(patternData, this.currentWaveDef);

                const patternValue = this.getPatternValue(patternData);
                this.hpSpawningBudget -= patternValue;

                this.lastPatternHeight =
                    patternData.pattern.length * ConfigManager.get().MobHeight;

                if (this.hpSpawningBudget <= 0) {
                    // Budget depleted, stop spawning new patterns this frame.
                    break;
                }
            } else {
                // Failsafe
                this.lastPatternHeight = 80;
            }
        }
    }

    /**
     * Spawns a specific list of patterns to fill the screen from the top down.
     * @param patternIds The array of pattern IDs to spawn in order.
     * @returns The total height in pixels of the spawned block, to be used as the next trigger distance.
     */
    private prespawnPatterns(patternIds: string[]): number {
        if (!this.currentWaveDef) return 0;

        let yPos = 0; // Start at the top of the screen (y=0)
        const mobHeight = ConfigManager.get().MobHeight;

        for (const patternId of patternIds) {
            const patternData = patternDefinitions[patternId];
            if (!patternData) continue;

            // Spawn this pattern at the current vertical position
            this.spawnPattern(patternData, this.currentWaveDef, yPos);

            // Decrement the wave's HP budget
            const patternValue = this.getPatternValue(patternData);
            this.hpSpawningBudget -= patternValue;

            // The top of the next pattern will be positioned below this one
            const patternHeight = patternData.pattern.length * mobHeight;
            yPos += patternHeight;
        }

        // The final yPos is the total height of the spawned block
        return yPos;
    }

    public destroy(): void {}
}
