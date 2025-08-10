import { ConfigManager } from "../../../api/ConfigManager";
import { Transform } from "../../core/components/Transform";
import { Velocity } from "../../core/components/Velocity";
import { System, Entity } from "../../core/ECS";
import { HitWallFlag } from "../components/HitWallFlag";

export class WallCollisionBounceSystem extends System {
    public componentsRequired = new Set<Function>([
        HitWallFlag,
        Velocity,
        Transform,
    ]);

    public update(entities: Set<Entity>): void {
        const config = ConfigManager.get();

        for (const entity of entities) {
            const velocity = this.ecs.getComponent(entity, Velocity);
            // Invert horizontal velocity and apply restitution
            velocity.x *= -config.BoomerangWallBounce;

            const flag = this.ecs.getComponent(entity, HitWallFlag);
            const transform = this.ecs.getComponent(entity, Transform);

            if (flag.hitLeft) {
                transform.pos.x = config.BoomerangWidth / 2;
            } else {
                transform.pos.x = config.GameWidth - config.BoomerangWidth / 2;
            }
        }
    }

    destroy() {}
}
