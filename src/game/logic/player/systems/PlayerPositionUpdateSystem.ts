import { Transform } from "../../core/components/Transform";
import { Entity, System } from "../../core/ECS";
import { DragState } from "../../input/DragState";
import { Math as PhaserMath } from "phaser";
import { Boomerang } from "../../boomerang/components/Boomerang";
import { ConfigManager } from "../../../consts/ConfigManager";
import { getPlayerEntity } from "../../../utils/getPlayerEntity";

export class PlayerPositionUpdateSystem extends System {
    public componentsRequired = new Set<Function>();

    public update(_: Set<Entity>, __: number): void {
        const player = getPlayerEntity(this.ecs);

        if (player === -1) return;

        let targetX: number | null = null;

        // Prioritize boomerang X position as the target
        const boomerangs = this.ecs.getEntitiesWithComponent(Boomerang);
        if (boomerangs.length > 0) {
            const firstBoomerang = boomerangs[0];
            const boomerangTransform = this.ecs.getComponent(
                firstBoomerang,
                Transform,
            );
            if (boomerangTransform) {
                targetX = boomerangTransform.pos.x;
            }
        } else if (this.ecs.hasComponent(player, DragState)) {
            // Fallback to drag input if no boomerangs are active
            const state = this.ecs.getComponent(player, DragState);
            targetX = state.currentX;
        }

        // If a target X is determined, move the player towards it
        if (targetX !== null) {
            const transform = this.ecs.getComponent(player, Transform);
            const ease = ConfigManager.get().PlayerMovementEaseValue;

            transform.pos.x = PhaserMath.Linear(transform.pos.x, targetX, ease);
        }
    }

    public destroy(): void {
        // No cleanup needed for this system
    }
}
