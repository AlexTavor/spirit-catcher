import { System, Entity } from "../../core/ECS";
import { Transform } from "../../components/Transform";
import { IsWalking } from "../components/IsWalking";
import { WalkTarget } from "../components/WalkTarget";
import { ConfigManager } from "../../../api/ConfigManager";

export class MovementSystem extends System {
    public componentsRequired = new Set<Function>([
        Transform,
        IsWalking,
        WalkTarget,
    ]);

    public update(entities: Set<Entity>, delta: number): void {
        const dt = delta / 1000; // Convert to seconds
        const config = ConfigManager.get();

        for (const entity of entities) {
            const transform = this.ecs.getComponent(entity, Transform);
            const walkTarget = this.ecs.getComponent(entity, WalkTarget);

            const horizontalDistance = Math.abs(
                transform.pos.x - walkTarget.pos.x,
            );

            // Stop if close enough to the target
            if (horizontalDistance < 5) {
                this.ecs.removeComponent(entity, IsWalking);
                this.ecs.removeComponent(entity, WalkTarget);
                continue;
            }

            // Move towards target using only horizontal direction for constant speed
            const step = walkTarget.pos.x - transform.pos.x;
            const directionX = Math.sign(step);
            transform.pos.x +=
                directionX * Math.min(config.WalkSpeed * dt, Math.abs(step));

            // Prevent moving out of bounds
            if (transform.pos.x < 0) {
                transform.pos.x = 0;
            } else if (
                transform.pos.x >
                config.GameWidth - config.PlayerWidth
            ) {
                transform.pos.x = config.GameWidth - config.PlayerWidth;
            }
        }
    }

    public destroy(): void {}
}
