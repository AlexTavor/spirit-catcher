import { ConfigManager } from "../../../api/ConfigManager";
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

        if (dragState) {
            const dragDeltaX = dragState.currentX - dragState.previousX;

            if (dragDeltaX !== 0) {
                // Normalize the input based on a max expected delta.
                const normalizedDelta = PhaserMath.Clamp(
                    dragDeltaX / config.BoomerangNudgeMaxDelta,
                    -1,
                    1,
                );

                // Apply the ease-in curve (x^2).
                // This makes the output grow exponentially with the input.
                const easedMultiplier =
                    Math.sign(normalizedDelta) *
                    Math.pow(Math.abs(normalizedDelta), 1.2);

                // Calculate the final impulse.
                const impulseX = easedMultiplier * config.BoomerangNudgeImpulse;

                for (const boomerang of entities) {
                    const velocity = this.ecs.getComponent(boomerang, Velocity);
                    velocity.x += impulseX;

                    velocity.x = PhaserMath.Clamp(
                        velocity.x,
                        -config.BoomerangMaxNudgeVelocity,
                        config.BoomerangMaxNudgeVelocity,
                    );
                }
            }

            // Consume the delta for the next frame.
            dragState.previousX = dragState.currentX;
        }
    }

    public destroy(): void {}
}
