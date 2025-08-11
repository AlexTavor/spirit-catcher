import { ConfigManager } from "../../consts/ConfigManager";
import { Entity } from "../../logic/core/ECS";
import { ModifiableStat } from "../../logic/upgrades/ModifiableStat";
import { Values } from "../../logic/upgrades/Values";
import { HasBoomerang } from "../../logic/player/components/HasBoomerang";
import { IsWalking } from "../../logic/player/components/IsWalking";
import { View, ViewContext } from "../core/View";
import { BoomerangDisplay } from "./BoomerangDisplay";

export class PlayerView extends View {
    private heldBoomerangDisplay: BoomerangDisplay;

    // Player body colors
    private readonly IDLE_COLOR = 0xffa500;
    private readonly WALKING_COLOR = 0xffde7a;

    // Held boomerang properties
    private readonly HELD_BOOMERANG_Y_OFFSET = 20;

    constructor(context: ViewContext, entity: Entity) {
        super(context, entity);
        this.heldBoomerangDisplay = new BoomerangDisplay(this.context);
    }

    public internalUpdate(delta: number): void {
        if (!this.heldBoomerangDisplay) {
            return; // Ensure viewContainer is initialized
        }

        const config = ConfigManager.get();
        const playerX = this.viewContainer.x - config.PlayerWidth / 2;
        const playerY = this.viewContainer.y;

        // --- Get Player State ---
        const isWalking = this.context.ecs.hasComponent(this.entity, IsWalking);
        const hasBoomerang = this.context.ecs.hasComponent(
            this.entity,
            HasBoomerang,
        );

        // --- Draw Player  ---
        this.context.dynamicGraphics.draw(playerX, playerY, (graphics) => {
            const bodyColor = isWalking ? this.WALKING_COLOR : this.IDLE_COLOR;
            graphics.fillStyle(bodyColor);
            graphics.fillRect(0, 0, config.PlayerWidth, config.PlayerHeight);
        });

        // --- Update Held Boomerang ---
        this.heldBoomerangDisplay.setVisible(hasBoomerang);
        const boomerangX = playerX + config.PlayerWidth / 2;
        const boomerangY = playerY - this.HELD_BOOMERANG_Y_OFFSET;

        this.heldBoomerangDisplay.update(
            delta,
            boomerangX,
            boomerangY,
            Values.get(
                this.context.ecs,
                this.context.ecs.world,
                ModifiableStat.BOOMERANG_SIZE,
            ),
        );
    }
}
