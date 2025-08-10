import { Entity, System } from "../../core/ECS";
import { LevelState } from "../../level/LevelState";
import { WaveState } from "../../level/WaveState";
import { SpiritSpawnState } from "../components/SpiritSpawnState";

const spawnerConfig0 = {
    spawnInterval: 100, // ms
    spawnXVariance: 100, // pixels
    duration: 15000, // ms
    startDelay: 0, // ms
    initialYVelocity: 100, // pixels/ms
    noiseTimeIncrement: 0.01, // step size for noise function
};

const spawnerConfig1 = {
    spawnInterval: 300, // ms
    spawnXVariance: 100, // pixels
    duration: 10000, // ms
    startDelay: 5000, // ms
    initialYVelocity: 150, // pixels/ms
    noiseTimeIncrement: 0.03, // step size for noise function
};

const spawnerConfig2 = {
    ...spawnerConfig0,
    duration: 5000,
    initialYVelocity: 75,
    noiseTimeIncrement: 0.005,
};

const waveData0 = {
    spawners: [spawnerConfig2],
};

const waveData1 = {
    spawners: [spawnerConfig0, spawnerConfig1],
};

const levelData = {
    waves: [waveData0, waveData1],
};

/**
 * Looks at LevelState, adds/removes SpiritSpawnState components based on the current level state.
 */
export class SpiritSpawnStatesSystem extends System {
    public componentsRequired = new Set<Function>([LevelState]);

    public update(entities: Set<Entity>, _: number): void {
        for (const entity of entities) {
            const lvl = this.ecs.getComponent(entity, LevelState);
            if (!lvl) continue;

            if (lvl.waveState !== WaveState.WAVE_ACTIVE) {
                continue; // Only operate when the wave is active
            }

            const spiritSpawnStates =
                this.ecs.getEntitiesWithComponent(SpiritSpawnState);

            if (spiritSpawnStates.length === 0) {
                // If no SpiritSpawnState exists, create one
                const newSpawnState = this.ecs.addEntity();
                this.ecs.addComponent(newSpawnState, new SpiritSpawnState());

                console.log(
                    "Created new SpiritSpawnState for wave:",
                    lvl.waveNumber,
                );
            }
        }
    }

    public destroy(): void {}
}
