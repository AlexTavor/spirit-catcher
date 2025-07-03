import { Transform } from "../../components/Transform";
import { Velocity } from "../../components/Velocity";
import { System, Entity } from "../../core/ECS";
import { HitCeilingFlag } from "../components/HitCeilingFlag";

export class CeilingCollisionBounceSystem extends System {
    public componentsRequired = new Set<Function>([
        HitCeilingFlag,
        Transform,
        Velocity,
    ]);

    public update(entities: Set<Entity>): void {
        for (const entity of entities) {
            const transform = this.ecs.getComponent(entity, Transform);
            const velocity = this.ecs.getComponent(entity, Velocity);

            // Stop upward movement
            if (velocity.y < 0) {
                velocity.y = 0;
            }
            // Snap position to ceiling boundary
            transform.pos.y = 0;
        }
    }

    destroy() {}
}
