import { Scene } from "phaser";

export class Layers {
    public Background: Phaser.GameObjects.Container;
    public Ground: Phaser.GameObjects.Container;
    public Middle: Phaser.GameObjects.Container;
    public Foreground: Phaser.GameObjects.Container;

    constructor(scene: Scene) {
        this.Background = scene.add.container();
        this.Ground = scene.add.container();
        this.Middle = scene.add.container();
        this.Foreground = scene.add.container();

        this.Foreground.setDepth(20); // Renders on top
    }

    public destroy() {
        this.Background.destroy();
        this.Ground.destroy();
        this.Middle.destroy();
        this.Foreground.destroy();
    }
}
