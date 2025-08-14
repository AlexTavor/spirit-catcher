// src/game/display/views/ProjectileView.ts

import { Entity } from "../../logic/core/ECS";
import { View, ViewContext } from "../core/View";
import { GameObjects } from "phaser";

export class ProjectileView extends View {
    private trailEmitter: GameObjects.Particles.ParticleEmitter;

    constructor(context: ViewContext, entity: Entity) {
        super(context, entity);

        // Create a particle emitter for the projectile's trail
        this.trailEmitter = this.context.scene.add.particles(
            0,
            0,
            "circle_32", // Use a pre-existing small circle texture
            {
                speed: { min: 20, max: 80 },
                angle: { min: 0, max: 360 }, // Emit in all directions for a spark-like effect
                scale: { start: 0.3, end: 0 },
                blendMode: "ADD", // Creates a bright, glowing effect
                lifespan: { min: 150, max: 300 },
                tint: [0xffe036, 0xff8c00, 0xff5500], // Fiery colors: yellow, orange, red
                frequency: 20, // Emit particles frequently
                follow: this.viewContainer, // The emitter follows this view's container
            },
        );

        // Add the emitter to a layer so it's rendered correctly
        this.context.layers.Middle.add(this.trailEmitter);
    }

    public internalUpdate(_delta: number): void {
        // The particle emitter is set to follow the container,
        // and the base View class updates the container's position.
        // No additional logic is needed here for the trail effect.
    }

    override destroy(): void {
        // It's crucial to clean up the emitter to prevent memory leaks
        this.trailEmitter.destroy();
        super.destroy();
    }
}
