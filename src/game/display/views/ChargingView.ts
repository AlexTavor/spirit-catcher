import { Entity } from "../../logic/core/ECS";
import { Charging } from "../../logic/components/Charging";
import { View, ViewContext } from "../core/View";

export class ChargingView extends View {
    private pulseActive = false;
    private pulseAnimationTime = 0;
    private readonly PULSE_DURATION = 300; // ms for one-way fade

    private readonly MAX_RADIUS = 180; // Visual radius in pixels
    private readonly FILL_COLOR = 0xffffff;
    private readonly PULSE_COLOR = 0x00ff00; // Green for pulse
    private readonly LINE_WIDTH = 3; // Width of the outer ring in pixels

    constructor(context: ViewContext, entity: Entity) {
        super(context, entity);
    }

    public internalUpdate(delta: number): void {
        const charging = this.context.ecs.getComponent(this.entity, Charging);
        if (!charging) {
            this.stopPulsing();
            return;
        }

        const progress = Math.min(1, charging.level / charging.maxLevel);
        const currentRadius = this.MAX_RADIUS * progress;
        const isFullyCharged = progress >= 1;

        // Manage pulse state
        if (isFullyCharged && !this.pulseActive) {
            this.startPulsing();
        } else if (!isFullyCharged && this.pulseActive) {
            this.stopPulsing();
        }

        if (this.pulseActive) {
            this.pulseAnimationTime += delta;
        }

        // --- Drawing ---
        // Get position from the viewContainer, updated by the base View class.
        const drawX = this.viewContainer.x;
        const drawY = this.viewContainer.y;

        this.context.dynamicGraphics.draw(drawX, drawY, (graphics) => {
            // Drawing is relative to the entity's position (0,0 in this local context).

            // 1. Draw the static outer ring
            graphics.lineStyle(this.LINE_WIDTH, this.FILL_COLOR, 0.4);
            graphics.strokeCircle(0, 0, this.MAX_RADIUS);

            // 2. Draw the fill circle
            if (currentRadius > 0) {
                graphics.fillStyle(this.FILL_COLOR, 0.6);
                graphics.fillCircle(0, 0, currentRadius);
            }

            // 3. Draw the pulse effect if active
            if (this.pulseActive) {
                // Use a sine wave for a smooth yoyo/pulsing effect.
                const pulseProgress =
                    (this.pulseAnimationTime % (this.PULSE_DURATION * 2)) /
                    (this.PULSE_DURATION * 2);
                const alpha = Math.sin(pulseProgress * Math.PI) * 0.8;

                graphics.fillStyle(this.PULSE_COLOR, alpha);
                graphics.fillCircle(0, 0, this.MAX_RADIUS);
            }
        });
    }

    private startPulsing(): void {
        if (this.pulseActive) return;
        this.pulseActive = true;
        this.pulseAnimationTime = 0;
    }

    private stopPulsing(): void {
        if (!this.pulseActive) return;
        this.pulseActive = false;
    }

    public destroy(): void {
        this.stopPulsing();
        super.destroy();
    }
}
