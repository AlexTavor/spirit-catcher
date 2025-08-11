import { ConfigManager } from "../../../consts/ConfigManager";
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

    public update(entities: Set<Entity>, delta: number): void {
        const player = getPlayerEntity(this.ecs);

        if (player === -1) return;

        const config = ConfigManager.get();
        const dragState = this.ecs.getComponent(player, DragState);

        if (!dragState || dragState.pointerId === -1) {
            return;
        }

        const dragDeltaX = dragState.currentX - dragState.startX;

        if (dragDeltaX === 0) {
            return;
        }

        // Normalize the input based on a max expected delta.

        const normalizedDelta = PhaserMath.Clamp(
            dragDeltaX / config.BoomerangNudgeMaxDelta,
            -1,
            1,
        );

        const dt = delta / 1000; // Convert delta from ms to seconds

        // Calculate the player's intended impulse.

        const impulseX = normalizedDelta * config.BoomerangNudgeImpulse * dt;
        const maxVelocity = config.BoomerangMaxNudgeVelocity;

        for (const boomerang of entities) {
            const velocity = this.ecs.getComponent(boomerang, Velocity);
            const currentVelocityX = velocity.x;

            let totalImpulse = impulseX;

            // Check if the nudge force is opposing the current velocity
            const isReversing =
                Math.sign(impulseX) !== Math.sign(currentVelocityX) &&
                currentVelocityX !== 0;

            if (isReversing) {
                totalImpulse *= config.BoomerangeNudgeReverseMultiplier;
            }

            velocity.x = PhaserMath.Clamp(
                currentVelocityX + totalImpulse,
                -maxVelocity,
                maxVelocity,
            );
        }
    }

    public destroy(): void {}
}
