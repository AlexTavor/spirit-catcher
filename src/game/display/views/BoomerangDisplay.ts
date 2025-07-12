import { ConfigManager } from "../../api/ConfigManager";
import { getBoomerangColor } from "../../utils/getBoomerangColor";
import { ViewContext } from "../core/View";
import { GameObjects } from "phaser";

export class BoomerangDisplay {
    protected readonly context: ViewContext;
    private rotation = 0;
    private visible = true;

    constructor(context: ViewContext) {
        this.context = context;
    }

    public setVisible(isVisible: boolean): void {
        this.visible = isVisible;
    }

    public getRotation(): number {
        return this.rotation;
    }

    public update(delta: number, x: number, y: number): void {
        if (!this.visible) {
            return;
        }

        const dt = delta / 1000;
        this.rotation += ConfigManager.get().BoomerangRotationSpeed * dt;
        const config = ConfigManager.get();
        const width = config.BoomerangWidth;
        const height = config.BoomerangHeight;

        // Use the new helper function to get the dynamic color
        const color = getBoomerangColor(this.context.ecs);

        this.context.dynamicGraphics.draw(
            x,
            y,
            (graphics: GameObjects.Graphics) => {
                graphics.save();
                graphics.rotateCanvas(this.rotation);

                graphics.fillStyle(color); // Apply the dynamic color
                graphics.fillRect(-width / 2, -height / 2, width, height);

                graphics.restore();
            },
        );
    }
}
