import { GameObjects, Scene } from "phaser";
import { ECS, Entity } from "../../logic/core/ECS";
import { Charging } from "../../logic/components/Charging";
import { View } from "./View";

export class ChargingView extends View {
    private maxChargeCircle: GameObjects.Graphics;
    private fillCircle: GameObjects.Graphics;
    private pulseCircle: GameObjects.Graphics;
    private pulseTween: Phaser.Tweens.Tween | null = null;

    private readonly MAX_RADIUS = 180; // Visual radius in pixels
    private readonly FILL_COLOR = 0xffffff;
    private readonly PULSE_COLOR = 0x00ff00; // Green for pulse
    private readonly LINE_WIDTH = 3; // Width of the outer ring in pixels

    constructor(scene: Scene, ecs: ECS, entity: Entity) {
        super(scene, ecs, entity);

        // Create the graphics objects
        this.maxChargeCircle = this.scene.add.graphics();
        this.fillCircle = this.scene.add.graphics();
        this.pulseCircle = this.scene.add.graphics();
        this.pulseCircle.setDepth(1); // Ensure pulse is drawn above the fill circle
        this.pulseCircle.setAlpha(0); // Start transparent

        // Add them to the view's container. Pulse is added first to be in the back.
        this.viewContainer.add([
            this.maxChargeCircle,
            this.fillCircle,
            this.pulseCircle,
        ]);

        this.drawMaxChargeCircle();
    }

    /**
     * Draws the static outer ring for the maximum charge.
     */
    private drawMaxChargeCircle(): void {
        this.maxChargeCircle.lineStyle(this.LINE_WIDTH, this.FILL_COLOR, 0.4);
        this.maxChargeCircle.strokeCircle(0, 0, this.MAX_RADIUS);
    }

    /**
     * Updates the fill circle and manages the pulse effect based on charge level.
     */
    public internalUpdate(): void {
        if (!this.fillCircle) {
            return;
        }

        const charging = this.ecs.getComponent(this.entity, Charging);
        if (!charging) {
            this.fillCircle.clear();
            this.stopPulsing();
            return;
        }

        const progress = Math.min(1, charging.level / charging.maxLevel);
        const currentRadius = this.MAX_RADIUS * progress;
        const isFullyCharged = progress >= 1;

        // Redraw the fill circle
        this.fillCircle.clear();
        this.fillCircle.fillStyle(this.FILL_COLOR, 0.6);
        this.fillCircle.fillCircle(0, 0, currentRadius);

        // Manage the pulse effect
        if (isFullyCharged && !this.pulseTween) {
            this.startPulsing();
        } else if (!isFullyCharged && this.pulseTween) {
            this.stopPulsing();
        }
    }

    /**
     * Starts the green pulsing animation.
     */
    private startPulsing(): void {
        if (this.pulseTween) return;

        this.pulseCircle.fillStyle(this.PULSE_COLOR);
        this.pulseCircle.fillCircle(0, 0, this.MAX_RADIUS);
        this.pulseCircle.setAlpha(0); // Start transparent

        this.pulseTween = this.scene.tweens.add({
            targets: this.pulseCircle,
            alpha: { from: 0, to: 0.8 },
            duration: 300,
            ease: "Sine.InOut",
            yoyo: true,
            loop: -1,
        });
    }

    /**
     * Stops the pulsing animation and clears the graphic.
     */
    private stopPulsing(): void {
        if (this.pulseTween) {
            this.pulseTween.stop();
            this.pulseTween = null;
        }
        this.pulseCircle.clear();
    }

    /**
     * Cleans up the tween and destroys the view.
     */
    public destroy(): void {
        this.stopPulsing();
        super.destroy();
    }
}
