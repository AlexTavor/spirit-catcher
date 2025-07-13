import { ConfigManager } from "../../../api/ConfigManager";
import { getPlayerEntity } from "../../../utils/getPlayerEntity";
import { DragState } from "../../input/DragState";
import { Transform } from "../../core/components/Transform";
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
        const playerTransform = this.ecs.getComponent(player, Transform);

        if (!dragState || !playerTransform) {
            return;
        }

        const dt = delta / 1000;
        const config = ConfigManager.get();

        // The "intent" of the drag, i.e., how far the finger is from the player's current position.
        const dragIntentX = dragState.targetX - playerTransform.pos.x;
        const nudgeForce = dragIntentX * config.BoomerangNudgeForce;

        // Apply no force if the drag is negligible.
        if (Math.abs(nudgeForce) < 0.1) return;

        for (const boomerang of entities) {
            const velocity = this.ecs.getComponent(boomerang, Velocity);
            velocity.x += nudgeForce * dt;
        }
    }

    public destroy(): void {}
}
