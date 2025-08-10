import { ConfigManager, ConfigType } from "../../../api/ConfigManager";
import { getPlayerEntity } from "../../../utils/getPlayerEntity";
import { DragState } from "../../input/DragState";
import { Velocity } from "../../core/components/Velocity";
import { System, Entity } from "../../core/ECS";
import { Airborne } from "../components/Airborne";
import { Boomerang } from "../components/Boomerang";

export class BoomerangNudgeSystem extends System {
    public componentsRequired = new Set<Function>([
        Boomerang,
        Airborne,
        Velocity,
    ]);

    public update(entities: Set<Entity>, delta: number): void {
        const player = getPlayerEntity(this.ecs);
        if (player === -1) return;

        const dragState = this.ecs.getComponent(player, DragState);

        if (!dragState) {
            return;
        }

        const dt = delta / 1000;
        const config = ConfigManager.get();

        // Calculate the nudge intent based on the drag state, normalizing by config.BoomerangMaxNudgeDistance
        const nudgeIntent = this.getNudgeIntent(dragState, config);

        const nudgeForce = nudgeIntent * config.BoomerangNudgeForce;

        // Apply no force if the drag is negligible.
        if (Math.abs(nudgeForce) < 0.1) return;

        for (const boomerang of entities) {
            const velocity = this.ecs.getComponent(boomerang, Velocity);
            velocity.x += nudgeForce * dt;
        }
    }

    getNudgeIntent(dragState: DragState, config: ConfigType) {
        const maxNudgeDistance = config.BoomerangMaxNudgeDistance;
        const dragDistance = dragState.startX - dragState.currentX;

        const nudgeIntent = -Math.min(
            Math.max(dragDistance / maxNudgeDistance, -1),
            1,
        );

        return nudgeIntent;
    }

    public destroy(): void {}
}
