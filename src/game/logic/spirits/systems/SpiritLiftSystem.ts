import { Transform } from "../../core/components/Transform";
import { Velocity } from "../../core/components/Velocity";
import { Entity, System } from "../../core/ECS";
import { Spirit } from "../components/Spirit";

export class SpiritLiftSystem extends System {
    public componentsRequired = new Set<Function>([
        Spirit,
        Transform,
        Velocity,
    ]);

    public update(entities: Set<Entity>, delta: number): void {
        const dt = delta / 1000; // Convert delta from ms to seconds

        for (const entity of entities) {
            const transform = this.ecs.getComponent(entity, Transform);
            const velocity = this.ecs.getComponent(entity, Velocity);
            transform.pos.y -= velocity.y * dt; // Lift the spirit by its vertical velocity
        }
    }

    public destroy(): void {
        // No cleanup needed for this system
    }
}
