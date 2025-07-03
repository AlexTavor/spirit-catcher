import { Scene } from "phaser";
import { ConfigManager } from "../../api/ConfigManager";
import { EventBus } from "../../api/EventBus";
import { ECS, Entity } from "../../logic/core/ECS";
import { View } from "./View";
import { Explosion } from "../../logic/explosion/Explosion";

export class ExplosionView extends View {
    private shockwaveGraphic: Phaser.GameObjects.Graphics;
    private visualMaxSize: number;
    private initialized = false;

    constructor(scene: Scene, ecs: ECS, entity: Entity) {
        super(scene, ecs, entity);

        const explosion = this.ecs.getComponent(this.entity, Explosion);
        if (!explosion) return;

        const config = ConfigManager.get();
        this.visualMaxSize =
            explosion.maxForce * config.ExplosionForceToSizeRatio;

        // --- Trigger One-Shot Effects ---

        // 1. Camera Shake
        if (explosion.maxForce > 0.1) {
            // Only shake for non-trivial explosions
            const intensity = config.CamShakeBaseIntensity * explosion.maxForce;
            this.viewContainer.scene.cameras.main.shake(
                config.CamShakeDuration,
                intensity,
            );
        }

        // 2. Particles (assuming a particle system is listening for this event)
        // EventBus.emit("CREATE_PARTICLES", { position: this.viewContainer, force: explosion.maxForce });

        // --- Create Continuous Effect Graphics ---
        this.shockwaveGraphic = this.scene.add.graphics();
        this.viewContainer.add(this.shockwaveGraphic);

        this.initialized = true;
    }

    public internalUpdate(): void {
        if (!this.initialized) return;

        const explosion = this.ecs.getComponent(this.entity, Explosion);
        if (!explosion || !this.shockwaveGraphic) {
            this.destroy(); // Destroy view if component is gone
            return;
        }

        const config = ConfigManager.get();

        // Use an ease-out function for a more natural effect
        const rawProgress = explosion.age / explosion.duration;
        const progress = rawProgress * (2 - rawProgress); // Ease-Out Quad

        if (progress >= 1) return;

        const currentRadius = this.visualMaxSize * progress;
        const currentAlpha = 1 - progress;

        this.shockwaveGraphic.clear();
        this.shockwaveGraphic.lineStyle(
            config.ExplosionShockwaveWidth,
            config.ExplosionShockwaveColor,
            currentAlpha,
        );
        this.shockwaveGraphic.strokeCircle(0, 0, currentRadius);
    }

    public destroy(): void {
        this.shockwaveGraphic?.destroy();
        super.destroy();
    }
}
