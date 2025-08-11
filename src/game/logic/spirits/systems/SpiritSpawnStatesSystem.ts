import { Entity, System } from "../../core/ECS";
import { LevelState } from "../../level/LevelState";
import { WaveState } from "../../level/WaveState";
import { SpiritSpawnState } from "../components/SpiritSpawnState";

/**
 * Looks at LevelState, adds/removes SpiritSpawnState components based on the current level state.
 */
export class SpiritSpawnStatesSystem extends System {
    public componentsRequired = new Set<Function>([LevelState]);

    public update(entities: Set<Entity>, _: number): void {
        for (const entity of entities) {
            const lvl = this.ecs.getComponent(entity, LevelState);
            if (!lvl) continue;

            if (lvl.waveState !== WaveState.WAVE_STARTING) {
                continue; // Only operate when the wave is active
            }

            // This is called after the wave number is incremented
            const waveSpawners =
                lvl.data.waves[lvl.waveNumber - 1]?.spawners || [];

            for (const spawner of waveSpawners) {
                const newSpawnState = this.ecs.addEntity();
                this.ecs.addComponent(
                    newSpawnState,
                    new SpiritSpawnState(spawner),
                );
            }
        }
    }

    public destroy(): void {}
}
