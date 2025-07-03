import { ConfigManager } from "../../../api/ConfigManager";
import { Transform } from "../../components/Transform";
import { Velocity } from "../../components/Velocity";
import { System, Entity } from "../../core/ECS";
import { Airborne } from "../components/Airborne";
import { HitCeilingFlag } from "../components/HitCeilingFlag";
import { HitWallFlag } from "../components/HitWallFlag";

export class BoundaryCollisionSystem extends System {
    public componentsRequired = new Set<Function>([
        Airborne,
        Transform,
        Velocity,
    ]);

    public update(entities: Set<Entity>): void {
        for (const entity of entities) {
            const transform = this.ecs.getComponent(entity, Transform);
            const velocity = this.ecs.getComponent(entity, Velocity);

            // Check for wall collision
            const hitLeftWall = transform.pos.x <= 0 && velocity.x < 0;
            const hitRightWall =
                transform.pos.x >= ConfigManager.get().GameWidth &&
                velocity.x > 0;

            if (hitLeftWall || hitRightWall) {
                this.ecs.addComponent(entity, new HitWallFlag());
            }

            // Check for ceiling collision
            if (transform.pos.y <= 0 && velocity.y < 0) {
                this.ecs.addComponent(entity, new HitCeilingFlag());
            }
        }
    }

    destroy() {}
}
