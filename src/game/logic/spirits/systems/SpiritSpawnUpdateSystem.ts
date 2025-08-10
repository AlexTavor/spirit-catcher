import { Entity, System } from "../../core/ECS";
import { SpiritSpawnState } from "../components/SpiritSpawnState";

/**
 * The SpiritSpawnUpdateSystem is responsible for updating spawn timers for spirits.
 * It operates on instances of the SpiritSpawnState component.
 */
export class SpiritSpawnUpdateSystem extends System {
    public componentsRequired = new Set<Function>([SpiritSpawnState]);

    constructor() {
        super();
    }

    public update(entities: Set<Entity>, delta: number): void {
        const dt = delta;
        for (const entity of entities) {
            const spawnState = this.ecs.getComponent(entity, SpiritSpawnState);
            if (!spawnState) continue;

            spawnState.updateTimer(dt); // Update the spawn timer
            spawnState.flagSpawnIfReady(this.ecs);
        }
    }

    public destroy(): void {
        // Cleanup logic if needed
    }
}
