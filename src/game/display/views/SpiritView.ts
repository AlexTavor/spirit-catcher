import { Entity } from "../../logic/core/ECS";
import { View, ViewContext } from "../core/View";
import { ConfigManager } from "../../api/ConfigManager";
import { GameObjects } from "phaser";

export class SpiritView extends View {
    private image: GameObjects.Image;

    constructor(context: ViewContext, entity: Entity) {
        super(context, entity);

        const config = ConfigManager.get();

        this.image = this.context.scene.add.image(0, 0, "circle_32");
        this.image.setDisplaySize(config.MobWidth, config.MobWidth);

        // A selection of pastel colors
        const pastelColors = [
            0xffadad, // light red
            0xffd6a5, // light orange
            0xfdffb6, // light yellow
            0xcaffbf, // light green
            0x9bf6ff, // light cyan
            0xa0c4ff, // light blue
            0xbdb2ff, // light purple
            0xffc6ff, // light pink
        ];
        const randomColor =
            pastelColors[Math.floor(Math.random() * pastelColors.length)];

        this.image.setOrigin(0.5, 0.5);
        this.image.setTint(randomColor);
        this.image.setAlpha(0.7);

        this.viewContainer.add(this.image);
        this.context.layers.Background.add(this.viewContainer);
    }

    public internalUpdate(): void {
        // Position is handled by the base View class.
        // Appearance is static, so no update logic is needed.
    }
}
