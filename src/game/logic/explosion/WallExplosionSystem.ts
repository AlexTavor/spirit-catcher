import { System, Entity } from "../core/ECS";
import { Velocity } from "../components/Velocity";
import { Transform } from "../components/Transform";
import { ConfigManager } from "../../api/ConfigManager";
import { Pos } from "../../../utils/Math";
import { HitWallFlag } from "../boomerang/components/HitWallFlag";
import { createExplosion } from "./ExplosionFactory";

export class WallExplosionSystem extends System {
    /**
     * A set of components that an entity must have for this system to operate on it.
     */
    public componentsRequired = new Set<Function>([
        HitWallFlag,
        Velocity,
        Transform,
    ]);

    /**
     * The update method is called every frame.
     * @param entities The set of entities that have the required components.
     */
    public update(entities: Set<Entity>): void {
        if (entities.size === 0) return;

        const config = ConfigManager.get();

        for (const entity of entities) {
            const velocity = this.ecs.getComponent(entity, Velocity);
            const transform = this.ecs.getComponent(entity, Transform);

            // Calculate the normalized impact force based on horizontal velocity.
            const impactVelocity = Math.abs(velocity.x);
            const force = Math.min(
                1,
                impactVelocity / config.BoomerangImpactMaxVelocity,
            );

            // Determine the impact position, snapping it to the wall's edge.
            const impactPos: Pos = {
                x:
                    transform.pos.x <= config.GameWidth / 2
                        ? 0
                        : config.GameWidth,
                y: transform.pos.y,
            };

            // Use the factory to create the explosion entity.
            createExplosion(this.ecs, impactPos, force);
        }
    }

    /**
     * Called when the system is removed from the ECS, used for cleanup.
     */
    public destroy(): void {}
}
