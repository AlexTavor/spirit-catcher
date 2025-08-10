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

            this.applyGravity(velocity, config, dt);
            this.applyAirDrag(velocity, config, dt);
            this.updatePosition(transform, velocity, dt);
        }
    }

    private applyGravity(velocity: Velocity, config: ConfigType, dt: number) {
        // Calculate the horizontal velocity ratio (0 to 1).
        const velXRatio = Math.min(
            1,
            Math.abs(velocity.x) / config.BoomerangGravityMaxVel,
        );

        // Apply an ease-out quad function. Effect is strongest at low velocities.
        const easedRatio = velXRatio * (2 - velXRatio);

        // Invert the ratio: multiplier is high at low velocity, low at high velocity.
        const gravityMultiplier = 1 - easedRatio;

        // Calculate the additional gravity based on the multiplier.
        const additionalGravity =
            config.BoomerangGravity *
            config.BoomerangGravityScaleByVelocity *
            gravityMultiplier;

        const finalGravity = config.BoomerangGravity + additionalGravity;

        // Apply final gravity.
        velocity.y += finalGravity * dt;
    }

    private updatePosition(
        transform: Transform,
        velocity: Velocity,
        dt: number,
    ) {
        transform.pos.x += velocity.x * dt;
        transform.pos.y += velocity.y * dt;

        // Clamp position to game boundaries
        const config = ConfigManager.get();
        const size = config.BoomerangHeight / 2;

        transform.pos.x = Math.max(
            size,
            Math.min(transform.pos.x, config.GameWidth - size),
        );
    }

    private applyAirDrag(velocity: Velocity, config: ConfigType, dt: number) {
        velocity.x *= 1 - config.BoomerangAirDrag * dt;
        velocity.y *= 1 - config.BoomerangAirDrag * dt;
    }

    public destroy(): void {}
}
