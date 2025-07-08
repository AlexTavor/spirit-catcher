import { GameObjects, Scene } from "phaser";
import { ConfigManager } from "../../api/ConfigManager";

export class DynamicGraphics {
    private renderTexture: GameObjects.RenderTexture;
    private graphics: GameObjects.Graphics;

    constructor(scene: Scene, container: GameObjects.Container) {
        const config = ConfigManager.get();
        this.renderTexture = scene.add.renderTexture(
            config.GameWidth / 2,
            config.GameHeight / 2,
            config.GameWidth,
            config.GameHeight,
        );

        // This is the fix: create the Graphics object without adding it to the display list.
        this.graphics = scene.make.graphics(undefined, false);

        // Add the render texture to the specified container
        container.add(this.renderTexture);
    }

    /**
     * Clears the entire RenderTexture, preparing it for a new frame.
     */
    public clear(): void {
        this.renderTexture.clear();
    }

    /**
     * Draws content onto the RenderTexture.
     * @param x The x-coordinate to draw at.
     * @param y The y-coordinate to draw at.
     * @param drawCallback A function that uses the shared Graphics object to draw shapes.
     */
    public draw(
        x: number,
        y: number,
        drawCallback: (graphics: GameObjects.Graphics) => void,
    ): void {
        // Prepare the reusable graphics object
        this.graphics.clear();
        // Allow the caller to define what to draw
        drawCallback(this.graphics);
        // Stamp the configured graphics onto the render texture at the desired position
        this.renderTexture.draw(this.graphics, x, y);
    }

    /**
     * Destroys the render texture and graphics objects to free up resources.
     */
    public destroy(): void {
        this.renderTexture.destroy();
        this.graphics.destroy();
    }
}
