import { System, Entity } from "../core/ECS";
import { Velocity } from "../components/Velocity";
import { HitWallFlag } from "../components/HitWallFlag";
import { ConfigManager } from "../../api/ConfigManager";

export class WallCollisionBounceSystem extends System {
    public componentsRequired = new Set<Function>([HitWallFlag, Velocity]);

    public update(entities: Set<Entity>): void {
        for (const entity of entities) {
            const velocity = this.ecs.getComponent(entity, Velocity);
            // Invert horizontal velocity and apply restitution
            velocity.x *= -ConfigManager.get().BoomerangRestitution;
        }
    }

    destroy() {}
}
