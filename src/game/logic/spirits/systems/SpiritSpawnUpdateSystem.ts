import { Entity, System } from "../../core/ECS";
import { SpiritSpawnState } from "../components/SpiritSpawnState";

/**
 * The SpiritSpawnUpdateSystem is responsible for updating spawn timers for spirits. It also clears the spawn state when the duration expires.
 * It is used to manage the spawning logic of spirits in the game.
 */
export class SpiritSpawnUpdateSystem extends System {
    public componentsRequired = new Set<Function>([SpiritSpawnState]);

    public update(entities: Set<Entity>, delta: number): void {
        const dt = delta;
        for (const entity of entities) {
            const spawnState = this.ecs.getComponent(entity, SpiritSpawnState);
            if (!spawnState) continue;

            spawnState.updateTimer(dt); // Update the spawn timer

            if (spawnState.duration <= 0) {
                // If the duration has expired, remove the spawn state component
                this.ecs.removeComponent(entity, SpiritSpawnState);
            }
        }
    }

    public destroy(): void {}
}
