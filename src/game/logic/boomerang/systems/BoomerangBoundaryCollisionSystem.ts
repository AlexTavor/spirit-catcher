import { ConfigManager } from "../../../api/ConfigManager";
import { Transform } from "../../core/components/Transform";
import { Velocity } from "../../core/components/Velocity";
import { System, Entity } from "../../core/ECS";
import { Airborne } from "../components/Airborne";
import { Boomerang } from "../components/Boomerang";
import { HitCeilingFlag } from "../components/HitCeilingFlag";
import { HitWallFlag } from "../components/HitWallFlag";

export class BoomerangBoundaryCollisionSystem extends System {
    public componentsRequired = new Set<Function>([
        Boomerang,
        Airborne,
        Transform,
        Velocity,
    ]);

    public update(entities: Set<Entity>): void {
        const config = ConfigManager.get();

        for (const entity of entities) {
            const transform = this.ecs.getComponent(entity, Transform);
            const velocity = this.ecs.getComponent(entity, Velocity);

            // Check for wall collision
            const hitLeftWall =
                transform.pos.x <= config.BoomerangWidth / 2 && velocity.x < 0;
            const hitRightWall =
                transform.pos.x >=
                    config.GameWidth - config.BoomerangWidth / 2 &&
                velocity.x > 0;

            if (hitLeftWall || hitRightWall) {
                this.ecs.addComponent(entity, new HitWallFlag(hitLeftWall));
            }

            // Check for ceiling collision
            if (transform.pos.y <= 0 && velocity.y < 0) {
                this.ecs.addComponent(entity, new HitCeilingFlag());
            }
        }
    }

    destroy() {}
}
