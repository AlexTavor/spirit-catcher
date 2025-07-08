import { Scene } from "phaser";
import { createNoiseTexture, NoiseData } from "../../utils/createNoiseTexture";

export type NoiseViewData = NoiseData & {
    position?: { x: number; y: number };
    depth?: number;
};

export class NoiseView {
    private scene: Scene;
    public image: Phaser.GameObjects.Image;
    private texture: Phaser.Textures.CanvasTexture;

    constructor(
        scene: Scene,
        container: Phaser.GameObjects.Container,
        data: NoiseViewData,
    ) {
        this.scene = scene;

        this.texture = createNoiseTexture(data, scene);

        this.image = this.scene.add.image(
            data.width / 2,
            data.height / 2,
            data.textureKey,
        );

        container.add(this.image);

        // Make it interactive to capture click.
        this.image.disableInteractive();

        // Set a low depth to ensure it renders behind all other game objects.
        this.image.setDepth(data.depth ?? 0);

        // Set the position if provided.
        if (data.position) {
            this.image.setPosition(data.position.x, data.position.y);
        }
    }

    /**
     * Cleans up the image and texture to prevent memory leaks.
     */
    public destroy(): void {
        this.image.destroy();
        this.texture.destroy();
    }
}
