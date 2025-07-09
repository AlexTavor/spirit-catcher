import { System, Entity } from "../../core/ECS";
import { Transform } from "../../core/components/Transform";
import { IsWalking } from "../components/IsWalking";
import { WalkTarget } from "../components/WalkTarget";
import { ConfigManager } from "../../../api/ConfigManager";

export class MovementSystem extends System {
    public componentsRequired = new Set<Function>([
        Transform,
        IsWalking,
        WalkTarget,
    ]);

    public update(entities: Set<Entity>, _delta: number): void {
        const config = ConfigManager.get();
        const ease = config.PlayerMovementEaseValue; // e.g. 0.1 for smoothing

        for (const entity of entities) {
            const transform = this.ecs.getComponent(entity, Transform);
            const walkTarget = this.ecs.getComponent(entity, WalkTarget);

            const prevX = transform.pos.x;
            transform.pos.x = Phaser.Math.Linear(prevX, walkTarget.pos.x, ease);

            const dx = Math.abs(transform.pos.x - walkTarget.pos.x);
            if (dx < 1) {
                transform.pos.x = walkTarget.pos.x;
                this.ecs.removeComponent(entity, IsWalking);
                this.ecs.removeComponent(entity, WalkTarget);
            }

            // Clamp bounds
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
