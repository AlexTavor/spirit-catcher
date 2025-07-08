import { ConfigManager } from "../../api/ConfigManager";
import { Entity } from "../../logic/core/ECS";
import { HasBoomerang } from "../../logic/player/components/HasBoomerang";
import { IsWalking } from "../../logic/player/components/IsWalking";
import { View, ViewContext } from "../core/View";
import { BoomerangDisplay } from "./BoomerangDisplay";

export class PlayerView extends View {
    private heldBoomerangDisplay: BoomerangDisplay;

    private readonly IDLE_COLOR = 0xffa500; // Orange
    private readonly WALKING_COLOR = 0xffde7a; // Lighter Orange

    constructor(context: ViewContext, entity: Entity) {
        super(context, entity);
        // Instantiate the BoomerangDisplay, passing the required context
        this.heldBoomerangDisplay = new BoomerangDisplay(this.context);
    }

    public internalUpdate(delta: number): void {
        if (!this.heldBoomerangDisplay) {
            return; // If the display is not initialized, exit early
        }
        const config = ConfigManager.get();
        const playerX = this.viewContainer.x;
        const playerY = this.viewContainer.y;
        const isWalking = this.context.ecs.hasComponent(this.entity, IsWalking);
        const hasBoomerang = this.context.ecs.hasComponent(
            this.entity,
            HasBoomerang,
        );

        // --- Draw Player Body ---
        this.context.dynamicGraphics.draw(playerX, playerY, (graphics) => {
            const color = isWalking ? this.WALKING_COLOR : this.IDLE_COLOR;
            graphics.fillStyle(color);
            graphics.fillRect(0, 0, config.PlayerWidth, config.PlayerHeight);
        });

        // --- Update Held Boomerang ---
        // Set visibility so the display knows whether to draw
        this.heldBoomerangDisplay.setVisible(hasBoomerang);

        // Calculate the absolute position for the held boomerang
        const boomerangX = playerX + config.PlayerWidth / 2;
        const boomerangY = playerY - 20; // Original hardcoded offset

        // Call update, which will handle rotation and drawing
        this.heldBoomerangDisplay.update(delta, boomerangX, boomerangY);
    }
}
