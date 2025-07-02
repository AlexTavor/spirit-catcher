import { GameObjects, Scene } from "phaser";
import { ConfigManager } from "../../api/ConfigManager";

export class BoomerangDisplay {
    private graphic: GameObjects.Graphics;

    constructor(scene: Scene, container: GameObjects.Container) {
        this.graphic = scene.add.graphics();
        container.add(this.graphic);

        // Draw the boomerang shape
        this.graphic.fillStyle(0xffff00); // Yellow
        this.graphic.fillRect(-15, -4, 30, 8);
    }

    /**
     * Updates the boomerang's rotation.
     * @param delta Time in milliseconds since the last frame.
     */
    public update(delta: number): void {
        const dt = delta / 1000; // Convert to seconds
        this.graphic.rotation +=
            ConfigManager.get().BoomerangRotationSpeed * dt;
    }

    public setPosition(x: number, y: number): void {
        this.graphic.setPosition(x, y);
    }

    public setVisible(isVisible: boolean): void {
        this.graphic.setVisible(isVisible);
    }

    public destroy(): void {
        this.graphic.destroy();
    }
}
