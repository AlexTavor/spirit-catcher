import { ConfigManager, ConfigType } from "../../../api/ConfigManager";
import { getPlayerEntity } from "../../../utils/getPlayerEntity";
import { DragState } from "../../input/DragState";
import { Velocity } from "../../core/components/Velocity";
import { System, Entity } from "../../core/ECS";
import { Airborne } from "../components/Airborne";
import { Boomerang } from "../components/Boomerang";
import { Math as PhaserMath } from "phaser";

export class BoomerangNudgeSystem extends System {
    public componentsRequired = new Set<Function>([
        Boomerang,
        Airborne,
        Velocity,
    ]);

    public update(entities: Set<Entity>): void {
        const player = getPlayerEntity(this.ecs);
        if (player === -1) return;

        const config = ConfigManager.get();
        const dragState = this.ecs.getComponent(player, DragState);

        // If there's a drag, calculate the target velocity based on drag distance.
        // Otherwise, the target velocity is 0, so the boomerang will ease to a stop (horizontally).
        let targetVelocityX = 0;
        if (dragState) {
            const nudgeIntent = this.getNudgeIntent(dragState, config);
            targetVelocityX = nudgeIntent * config.BoomerangMaxNudgeVelocity;
        }

        const lerpFactor = config.BoomerangNudgeLerpFactor;

        for (const boomerang of entities) {
            const velocity = this.ecs.getComponent(boomerang, Velocity);

            // Linearly interpolate the boomerang's current x-velocity towards the target.
            velocity.x = PhaserMath.Linear(
                velocity.x,
                targetVelocityX,
                lerpFactor,
            );
        }
    }

    private getNudgeIntent(dragState: DragState, config: ConfigType): number {
        const maxNudgeDistance = config.BoomerangMaxNudgeDistance;
        // The distance and direction of the drag from its starting point.
        const dragDistance = dragState.startX - dragState.currentX;

        // Clamp the drag distance to the max nudge distance and normalize to a [-1, 1] range.
        const nudgeIntent = -Math.min(
            Math.max(dragDistance / maxNudgeDistance, -1),
            1,
        );

        return nudgeIntent;
    }

    public destroy(): void {}
}
