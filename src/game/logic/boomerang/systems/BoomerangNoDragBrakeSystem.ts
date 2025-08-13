import { ConfigManager } from "../../../consts/ConfigManager";
import { getPlayerEntity } from "../../../utils/getPlayerEntity";
import { Velocity } from "../../core/components/Velocity";
import { Entity, System } from "../../core/ECS";
import { DragState } from "../../input/DragState";
import { Airborne } from "../components/Airborne";

export class BoomerangNoDragBrakeSystem extends System {
    public componentsRequired = new Set<Function>([Airborne, Velocity]);

    public update(entities: Set<Entity>, delta: number): void {
        if (entities.size === 0) return;

        const dt = delta / 1000;

        const drag = this.ecs.getComponent(
            getPlayerEntity(this.ecs),
            DragState,
        );

        if (drag && drag.pointerId !== -1) {
            // If there is active drag, do not apply slow.
            return;
        }

        const config = ConfigManager.get();

        for (const entity of entities) {
            const velocity = this.ecs.getComponent(entity, Velocity);
            const sign = velocity?.x < 0 ? -1 : 1;
            const brakingForce = config.BoomerangNoDragBrakingForce * -sign;
            const delta = brakingForce * dt;

            velocity.x += delta;
            // Clamp the velocity to prevent it from going too low
            if (sign * velocity.x < 0) {
                velocity.x = 0;
            }
        }
    }

    public destroy(): void {}
}
