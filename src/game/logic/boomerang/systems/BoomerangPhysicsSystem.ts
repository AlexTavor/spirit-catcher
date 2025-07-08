import { ConfigManager } from "../../../api/ConfigManager";
import { getPlayerEntity } from "../../../utils/getPlayerEntity";
import { Transform } from "../../core/components/Transform";
import { Velocity } from "../../core/components/Velocity";
import { System, Entity } from "../../core/ECS";
import { Airborne } from "../components/Airborne";

export class BoomerangPhysicsSystem extends System {
    public componentsRequired = new Set<Function>([
        Airborne,
        Transform,
        Velocity,
    ]);

    public update(entities: Set<Entity>, delta: number): void {
        const dt = delta / 1000; // Convert delta from ms to seconds

        // Get player position for homing calculation.
        const player = getPlayerEntity(this.ecs);
        const playerTransform = this.ecs.getComponent(player, Transform);

        for (const entity of entities) {
            const transform = this.ecs.getComponent(entity, Transform);
            const velocity = this.ecs.getComponent(entity, Velocity);

            // 1. Apply Gravity
            velocity.y += ConfigManager.get().BoomerangGravity * dt;

            // 2. Apply Homing Force
            // The force is proportional to the horizontal distance from the player.
            if (playerTransform) {
                const distanceX = playerTransform.pos.x - transform.pos.x;
                const homingAdjustment =
                    distanceX * ConfigManager.get().BoomerangHomingForce;
                velocity.x += homingAdjustment * dt;
            }

            // 3. Apply Air Drag
            // This slows the boomerang over time for a more natural feel.
            velocity.x *= 1 - ConfigManager.get().BoomerangAirDrag * dt;
            velocity.y *= 1 - ConfigManager.get().BoomerangAirDrag * dt;

            // 4. Update Position
            transform.pos.x += velocity.x * dt;
            transform.pos.y += velocity.y * dt;
        }
    }

    public destroy(): void {}
}
