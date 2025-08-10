import { ConfigManager, ConfigType } from "../../../api/ConfigManager";
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

        const config = ConfigManager.get();

        for (const entity of entities) {
            const transform = this.ecs.getComponent(entity, Transform);
            const velocity = this.ecs.getComponent(entity, Velocity);

            // Apply Gravity
            velocity.y += config.BoomerangGravity * dt;

            this.applyAirDrag(velocity, config, dt);
            this.updatePosition(transform, velocity, dt);
        }
    }

    private updatePosition(
        transform: Transform,
        velocity: Velocity,
        dt: number,
    ) {
        transform.pos.x += velocity.x * dt;
        transform.pos.y += velocity.y * dt;
    }

    private applyAirDrag(velocity: Velocity, config: ConfigType, dt: number) {
        velocity.x *= 1 - config.BoomerangAirDrag * dt;
        velocity.y *= 1 - config.BoomerangAirDrag * dt;
    }

    public destroy(): void {}
}
