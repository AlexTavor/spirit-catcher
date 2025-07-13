// src/game/logic/level/WaveManagerSystem.ts
import { Pos } from "../../../utils/Math";
import { CommandBus } from "../../api/CommandBus";
import { ConfigManager } from "../../api/ConfigManager";
import { GameCommands } from "../../consts/GameCommands";
import { getMobsState } from "../../utils/getMobsState";
import { Transform } from "../core/components/Transform";
import { System } from "../core/ECS";
import { Health } from "../mobs/components/Health";
import { HitCooldowns } from "../mobs/components/HitCooldowns";
import { LiftResistance } from "../mobs/components/LiftResistance";
import { Mob } from "../mobs/components/Mob";
import { LevelState } from "./LevelState";
import { PatternDefinition } from "./types";
import { GameDataManager } from "../../api/GameDataManager";
import { MobDefinitionComponent } from "../mobs/components/MobDefinitionComponent";

export class WaveManagerSystem extends System {
    public componentsRequired = new Set<Function>();
    private lastWaveSpawned = -1;

    public override update(): void {
        const mobsState = getMobsState(this.ecs);
        if (!mobsState) return;

        const { state, waveNumber } = mobsState;
        if (
            state === LevelState.PRE_WAVE &&
            waveNumber !== this.lastWaveSpawned
        ) {
            this.spawnWave(waveNumber);
            this.lastWaveSpawned = waveNumber;

            CommandBus.emit(GameCommands.TRANSITION_TO_STATE, {
                newState: LevelState.WAVE_STARTING,
            });
        }
    }

    private spawnWave(waveNumber: number): void {
        const allLevels = GameDataManager.getLevels();
        if (allLevels.length === 0) {
            console.error(`No level definitions found.`);
            return;
        }
        // Always use the first level definition
        const levelDef = allLevels[0];
        const waveDef = levelDef.waves[waveNumber - 1];

        if (!waveDef) {
            console.error(
                `Wave ${waveNumber} not found in level ${levelDef.id}.`,
            );
            return;
        }

        const patternsToSpawn = waveDef.patternIds
            .map((id) => GameDataManager.getPatternById(id))
            .filter((p): p is PatternDefinition => p !== undefined);

        const config = ConfigManager.get();
        let ySpawnCursor = -config.GameHeight / 2;
        const hpMultiplier = levelDef.startHpMultiplier;

        for (const patternData of patternsToSpawn) {
            const patternHeight = patternData.pattern.length * config.MobHeight;
            const spawnY = ySpawnCursor - patternHeight;
            this.spawnPattern(patternData, spawnY, hpMultiplier);
            ySpawnCursor -= patternHeight;
        }
    }

    private spawnPattern(
        patternData: PatternDefinition,
        yOffset: number,
        hpMultiplier: number,
    ): void {
        const config = ConfigManager.get();
        const numCols = patternData.pattern[0]?.length || 1;
        const gridWidth = config.MobWidth * numCols;
        const startX = (config.GameWidth - gridWidth) / 2;

        patternData.pattern.forEach((row, y) => {
            row.forEach((mobId, x) => {
                const mobDef = GameDataManager.getMobById(mobId);
                if (!mobDef) return;

                const position = {
                    x: startX + x * config.MobWidth,
                    y: yOffset + y * config.MobHeight,
                };
                this.createMobEntity(mobId, position, hpMultiplier);
            });
        });
    }

    private createMobEntity(
        mobId: string,
        position: Pos,
        hpMultiplier: number,
    ): void {
        const mobDef = GameDataManager.getMobById(mobId);
        if (!mobDef) return;

        const entity = this.ecs.addEntity();
        const transform = new Transform();
        transform.pos = position;
        this.ecs.addComponent(entity, transform);

        const finalHp = Math.round(mobDef.minHp * hpMultiplier);
        this.ecs.addComponent(entity, new Health(finalHp));
        this.ecs.addComponent(entity, new Mob());
        this.ecs.addComponent(entity, new HitCooldowns());

        const mobDefComponent = new MobDefinitionComponent();
        mobDefComponent.displayType = mobDef.displayType;
        this.ecs.addComponent(entity, mobDefComponent);

        if (mobDef.liftResistance) {
            const liftResistance = new LiftResistance();
            liftResistance.resistance = mobDef.liftResistance;
            this.ecs.addComponent(entity, liftResistance);
        }
    }

    public destroy(): void {}
}
