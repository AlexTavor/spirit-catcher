import { ConfigManager } from "../../../api/ConfigManager";
import { getPlayerEntity } from "../../../utils/getPlayerEntity";
import { Transform } from "../../core/components/Transform";
import { Entity, System } from "../../core/ECS";
import { DragState } from "../../input/DragState";
import { Math as PhaserMath } from "phaser";

export class PlayerPositionUpdateSystem extends System {
    public componentsRequired = new Set<Function>();

    public update(_: Set<Entity>, __: number): void {
        const player = getPlayerEntity(this.ecs);
        if (player === -1) return;
        if (!this.ecs.hasComponent(player, DragState)) return;

        const transform = this.ecs.getComponent(player, Transform);
        const state = this.ecs.getComponent(player, DragState);
        const ease = ConfigManager.get().PlayerMovementEaseValue;

        transform.pos.x = PhaserMath.Linear(
            transform.pos.x,
            state.currentX,
            ease,
        );
    }

    public destroy(): void {
        // No cleanup needed for this system
    }
}
