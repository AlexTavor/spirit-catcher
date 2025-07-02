import { System, Entity } from "../core/ECS";
import { Transform } from "../components/Transform";
import { IsWalking } from "../components/IsWalking";
import { WalkTarget } from "../components/WalkTarget";
import { PlayerConfig } from "../components/PlayerConfig";
import { MathUtils } from "../../../utils/Math";
import { ConfigManager } from "../../api/ConfigManager";

export class MovementSystem extends System {
    public componentsRequired = new Set<Function>([
        Transform,
        IsWalking,
        WalkTarget,
        PlayerConfig,
    ]);

    public update(entities: Set<Entity>, delta: number): void {
        const dt = delta / 1000; // Convert to seconds

        for (const entity of entities) {
            const transform = this.ecs.getComponent(entity, Transform);
            const walkTarget = this.ecs.getComponent(entity, WalkTarget);
            const playerConfig = this.ecs.getComponent(entity, PlayerConfig);

            const distance = MathUtils.distance(transform.pos, walkTarget.pos);

            // Stop if close enough to the target
            if (distance < 5) {
                this.ecs.removeComponent(entity, IsWalking);
                this.ecs.removeComponent(entity, WalkTarget);
                continue;
            }

            // Move towards target
            const direction = MathUtils.normalize(
                MathUtils.subtract(walkTarget.pos, transform.pos),
            );

            transform.pos.x += direction.x * playerConfig.walkSpeed * dt;
            //transform.pos.y += direction.y * playerConfig.walkSpeed * dt;

            if (transform.pos.x < 0) {
                transform.pos.x = 0; // Prevent moving out of bounds
            } else if (
                transform.pos.x >
                ConfigManager.get().GameWidth - ConfigManager.get().PlayerWidth
            ) {
                transform.pos.x =
                    ConfigManager.get().GameWidth -
                    ConfigManager.get().PlayerWidth; // Prevent moving out of bounds
            }
        }
    }

    public destroy(): void {}
}
