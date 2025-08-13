import { ConfigManager } from "../../../consts/ConfigManager";
import { getPlayerEntity } from "../../../utils/getPlayerEntity";
import { DragState } from "../../input/DragState";
import { Velocity } from "../../core/components/Velocity";
import { System, Entity } from "../../core/ECS";
import { Airborne } from "../components/Airborne";
import { Boomerang } from "../components/Boomerang";
import { Math as PhaserMath } from "phaser";
import { BrakingFlag } from "../components/BrakingFlag";

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
            this.ecs.addComponent(player, new BrakingFlag());
            return;
        }

        // Corrected calculation: Use the delta from the previous frame for a
        // relative, intuitive feel.
        const dragDeltaX = dragState.currentX - dragState.previousX;

        if (dragDeltaX === 0) {
            return;
        }

        // Normalize the input based on a max expected delta.
        // NOTE: Remember to update 'BoomerangNudgeMaxDelta' in your config
        // to a smaller value (e.g., 30) to suit this new calculation.
        const normalizedDelta = PhaserMath.Clamp(
            dragDeltaX / config.BoomerangNudgeMaxDelta,
            -1,
            1,
        );
        const dt = delta / 1000; // Convert delta from ms to seconds

        const maxVelocity = config.BoomerangMaxVelocity;

        for (const boomerang of entities) {
            const velocity = this.ecs.getComponent(boomerang, Velocity);
            const currentVelocityX = velocity.x;

            const velocityFactor = PhaserMath.Clamp(
                1 - Math.abs(currentVelocityX) / maxVelocity,
                0,
                1,
            );
            const lerpedFactor = PhaserMath.Linear(
                1,
                velocityFactor,
                config.BoomerangNudgeVelocityInfluence,
            );
            const impulseX =
                normalizedDelta *
                config.BoomerangNudgeImpulse *
                lerpedFactor *
                dt;

            velocity.x = PhaserMath.Clamp(
                currentVelocityX + impulseX,
                -maxVelocity,
                maxVelocity,
            );
        }
    }

    public destroy(): void {}
}
