import { ConfigManager } from "../../../consts/ConfigManager";
import { Transform } from "../../core/components/Transform";
import { Velocity } from "../../core/components/Velocity";
import { Entity, System } from "../../core/ECS";
import { DragState } from "../../input/DragState";
import { Airborne } from "../components/Airborne";

export class BoomerangNoDragDecaySystem extends System {
    public componentsRequired = new Set<Function>([
        Airborne,
        Transform,
        Velocity,
    ]);

    public update(entities: Set<Entity>, delta: number): void {
        if (entities.size === 0) return;

        const dt = delta / 1000;

        const drag = this.ecs.getComponent(this.ecs.world, DragState);

        if (!drag || drag.pointerId == -1) {
            // If there is no active drag, do not apply slow.
            return;
        }

        const config = ConfigManager.get();

        for (const entity of entities) {
            const velocity = this.ecs.getComponent(entity, Velocity);
            if (velocity) {
                velocity.x *= config.BoomerangNoDragXDecay * dt;
            }
        }
    }

    public destroy(): void {}
}
