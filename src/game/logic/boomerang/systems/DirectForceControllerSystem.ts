import { ConfigManager } from "../../../consts/ConfigManager";
import { getPlayerEntity } from "../../../utils/getPlayerEntity";
import { Transform } from "../../core/components/Transform";
import { Velocity } from "../../core/components/Velocity";
import { System, Entity } from "../../core/ECS";
import { DragState } from "../../input/DragState";
import { Airborne } from "../components/Airborne";
import { Boomerang } from "../components/Boomerang";
import { BrakingFlag } from "../components/BrakingFlag";
import { Math as PhaserMath } from "phaser";

export class DirectForceControllerSystem extends System {
    public componentsRequired = new Set<Function>([
        Boomerang,
        Airborne,
        Transform,
        Velocity,
    ]);

    public update(entities: Set<Entity>, delta: number): void {
        if (entities.size === 0) {
            return;
        }

        const player = getPlayerEntity(this.ecs);
        if (player === -1) return;

        const config = ConfigManager.get();
        const dragState = this.ecs.getComponent(player, DragState);
        if (!dragState || dragState.pointerId === -1) {
            this.ecs.addComponent(player, new BrakingFlag());
            return;
        }

        // --- Find the lowest boomerang on the screen ---
        let lowestBoomerang: Entity | null = null;
        let lowestY = -Infinity;

        for (const boomerang of entities) {
            const transform = this.ecs.getComponent(boomerang, Transform);
            if (transform.pos.y > lowestY) {
                lowestY = transform.pos.y;
                lowestBoomerang = boomerang;
            }
        }

        // --- Operate on the selected boomerang ---
        if (lowestBoomerang) {
            const dt = delta / 1000;
            const targetX = dragState.currentX;
            const maxVelocity = config.BoomerangMaxVelocity;

            const transform = this.ecs.getComponent(lowestBoomerang, Transform);
            const velocity = this.ecs.getComponent(lowestBoomerang, Velocity);

            const distanceX = targetX - transform.pos.x;
            const baseForce = distanceX * config.BoomerangDirectForceFactor;

            const normalizedVelocity = Math.abs(velocity.x) / maxVelocity;

            const easedVelocityFactor =
                PhaserMath.Easing.Quadratic.Out(normalizedVelocity);

            const velocityScale = 1 - easedVelocityFactor;

            velocity.x += baseForce * velocityScale * dt;

            velocity.x = PhaserMath.Clamp(
                velocity.x,
                -maxVelocity,
                maxVelocity,
            );
        }
    }

    public destroy(): void {}
}
