import { ConfigManager } from "../../consts/ConfigManager";
import { Entity } from "../../logic/core/ECS";
import { View, ViewContext } from "../core/View";
import { Explosion } from "../../logic/explosion/Explosion";

export class ExplosionView extends View {
    private visualMaxSize: number;
    private initialized = false;

    constructor(context: ViewContext, entity: Entity) {
        super(context, entity);
        const explosion = this.context.ecs.getComponent(this.entity, Explosion);
        if (!explosion) return;

        const config = ConfigManager.get();
        this.visualMaxSize =
            explosion.maxForce * config.ExplosionForceToSizeRatio;

        // --- Trigger One-Shot Effects ---
        // Camera Shake is independent of DynamicGraphics and remains as is.
        if (explosion.maxForce > 0.1) {
            const intensity = config.CamShakeBaseIntensity * explosion.maxForce;
            this.viewContainer.scene.cameras.main.shake(
                config.CamShakeDuration,
                intensity,
            );
        }

        // No graphics objects are created or added to the container anymore.
        this.initialized = true;
    }

    public internalUpdate(): void {
        if (!this.initialized) return;

        const explosion = this.context.ecs.getComponent(this.entity, Explosion);
        if (!explosion) {
            // The view will be cleaned up by GameDisplay if the component is gone.
            return;
        }

        const config = ConfigManager.get();
        // Use an ease-out function for a more natural effect.
        const rawProgress = explosion.age / explosion.duration;
        const progress = rawProgress * (2 - rawProgress); // Ease-Out Quad

        if (progress >= 1) return;

        const currentRadius = this.visualMaxSize * progress;
        const currentAlpha = 1 - progress;
        const x = this.viewContainer.x;
        const y = this.viewContainer.y;

        // Draw the shockwave using the shared DynamicGraphics instance.
        this.context.dynamicGraphics.draw(x, y, (graphics) => {
            graphics.lineStyle(
                config.ExplosionShockwaveWidth,
                config.ExplosionShockwaveColor,
                currentAlpha,
            );
            graphics.strokeCircle(0, 0, currentRadius);
        });
    }
}
