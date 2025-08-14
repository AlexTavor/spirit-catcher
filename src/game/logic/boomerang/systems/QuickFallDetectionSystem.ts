import { ConfigManager } from "../../../consts/ConfigManager";
import { getPlayerEntity } from "../../../utils/getPlayerEntity";
import { getUpgradesState } from "../../../utils/getUpgradesState";
import { Velocity } from "../../core/components/Velocity";
import { System, Entity } from "../../core/ECS";
import { Airborne } from "../components/Airborne";
import { Boomerang } from "../components/Boomerang";
import { BrakingFlag } from "../components/BrakingFlag";
import { QuickFalling } from "../components/QuickFalling";

export class QuickFallDetectionSystem extends System {
    // This system runs on all active boomerangs.
    public componentsRequired = new Set<Function>([
        Boomerang,
        Airborne,
        Velocity,
    ]);

    public update(entities: Set<Entity>): void {
        const isEnabled = getUpgradesState(this.ecs).hasQuickFalling;
        if (!isEnabled) {
            return;
        }

        const player = getPlayerEntity(this.ecs);
        if (player === -1) return;

        const config = ConfigManager.get();
        const isBraking = this.ecs.hasComponent(player, BrakingFlag);

        if (!isBraking) {
            // Player is not braking. Clean up any lingering quick-fall states.
            const fallers = this.ecs.getEntitiesWithComponent(QuickFalling);
            for (const entity of fallers) {
                this.ecs.removeComponent(entity, QuickFalling);
            }
            return;
        }

        // Player is braking. Evaluate each boomerang's velocity.
        for (const entity of entities) {
            const velocity = this.ecs.getComponent(entity, Velocity);
            const isFallingFastEnough = velocity.y > config.QuickFallMinSpeed;
            const hasQuickFall = this.ecs.hasComponent(entity, QuickFalling);

            if (isFallingFastEnough && !hasQuickFall) {
                this.ecs.addComponent(entity, new QuickFalling());
            } else if (!isFallingFastEnough && hasQuickFall) {
                this.ecs.removeComponent(entity, QuickFalling);
            }
        }
    }

    public destroy(): void {}
}
