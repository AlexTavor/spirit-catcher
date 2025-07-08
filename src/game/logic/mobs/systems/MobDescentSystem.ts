import { ConfigManager } from "../../../api/ConfigManager";
import { Transform } from "../../core/components/Transform";
import { Entity, System } from "../../core/ECS";
import { Mob } from "../components/Mob";

export class MobDescentSystem extends System {
    /**
     * This system runs on all entities that are a Mob and have a position.
     */
    public componentsRequired = new Set<Function>([Mob, Transform]);

    /**
     * Called every frame to update the position of mob entities.
     * @param entities The set of entities with Mob and Transform components.
     * @param delta The time in milliseconds since the last frame.
     */
    public update(entities: Set<Entity>, delta: number): void {
        const descentSpeed = ConfigManager.get().MobDescentSpeed;
        if (descentSpeed <= 0) return;

        // Convert delta from milliseconds to seconds for rate calculations
        const dt = delta / 1000;

        for (const entity of entities) {
            const transform = this.ecs.getComponent(entity, Transform);

            // Increase the Y position to move the mob downwards
            transform.pos.y += descentSpeed * dt;
        }
    }

    /**
     * This system holds no resources, so destroy is empty.
     */
    public destroy(): void {}
}
