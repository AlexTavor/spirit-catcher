import { ConfigManager } from "../../../api/ConfigManager";
import { Velocity } from "../../core/components/Velocity";
import { System, Entity } from "../../core/ECS";
import { HitWallFlag } from "../components/HitWallFlag";

export class WallCollisionBounceSystem extends System {
    public componentsRequired = new Set<Function>([HitWallFlag, Velocity]);

    public update(entities: Set<Entity>): void {
        for (const entity of entities) {
            const velocity = this.ecs.getComponent(entity, Velocity);
            // Invert horizontal velocity and apply restitution
            velocity.x *= -ConfigManager.get().BoomerangWallBounce;
        }
    }

    destroy() {}
}
