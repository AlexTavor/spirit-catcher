import { ConfigManager } from "../../../consts/ConfigManager";
import { getPlayerEntity } from "../../../utils/getPlayerEntity";
import { Velocity } from "../../core/components/Velocity";
import { Entity, System } from "../../core/ECS";
import { Airborne } from "../components/Airborne";
import { BrakingFlag } from "../components/BrakingFlag";

export class BoomerangNoDragBrakeSystem extends System {
    public componentsRequired = new Set<Function>([Airborne, Velocity]);

    public update(entities: Set<Entity>, delta: number): void {
        if (entities.size === 0) return;

        const dt = delta / 1000;

        const brakingFlag = this.ecs.getComponent(
            getPlayerEntity(this.ecs),
            BrakingFlag,
        );

        if (!brakingFlag) {
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
