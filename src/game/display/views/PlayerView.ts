import { ConfigManager } from "../../api/ConfigManager";
import { Entity } from "../../logic/core/ECS";
import { HasBoomerang } from "../../logic/player/components/HasBoomerang";
import { IsWalking } from "../../logic/player/components/IsWalking";
import { Mana } from "../../logic/player/components/Mana";
import { View, ViewContext } from "../core/View";
import { BoomerangDisplay } from "./BoomerangDisplay";

export class PlayerView extends View {
    private heldBoomerangDisplay: BoomerangDisplay;

    // Player body colors
    private readonly IDLE_COLOR = 0xffa500;
    private readonly WALKING_COLOR = 0xffde7a;

    // Held boomerang properties
    private readonly HELD_BOOMERANG_Y_OFFSET = 20;

    // Mana bar properties
    private readonly MANA_BAR_BG_COLOR = 0xadd8e6; // Light Blue
    private readonly MANA_BAR_FILL_COLOR = 0x0000ff; // Blue
    private readonly MANA_BAR_WIDTH = 16;
    private readonly MANA_BAR_PADDING = 8;

    constructor(context: ViewContext, entity: Entity) {
        super(context, entity);
        this.heldBoomerangDisplay = new BoomerangDisplay(this.context);
    }

    public internalUpdate(delta: number): void {
        if (!this.heldBoomerangDisplay) {
            return; // Ensure viewContainer is initialized
        }

        const config = ConfigManager.get();
        const playerX = this.viewContainer.x;
        const playerY = this.viewContainer.y;

        // --- Get Player State ---
        const isWalking = this.context.ecs.hasComponent(this.entity, IsWalking);
        const hasBoomerang = this.context.ecs.hasComponent(
            this.entity,
            HasBoomerang,
        );
        const mana = this.context.ecs.getComponent(this.entity, Mana);
        const manaPercent = mana ? mana.current / mana.max : 0;

        // --- Draw Player and Mana Bar ---
        this.context.dynamicGraphics.draw(playerX, playerY, (graphics) => {
            // 1. Draw Player Body
            const bodyColor = isWalking ? this.WALKING_COLOR : this.IDLE_COLOR;
            graphics.fillStyle(bodyColor);
            graphics.fillRect(0, 0, config.PlayerWidth, config.PlayerHeight);

            // 2. Draw Mana Bar
            if (mana) {
                const barTotalHeight =
                    config.PlayerHeight - this.MANA_BAR_PADDING * 2;
                const barX = config.PlayerWidth / 2 - this.MANA_BAR_WIDTH / 2;
                const barY = this.MANA_BAR_PADDING;

                // Draw the background
                graphics.fillStyle(this.MANA_BAR_BG_COLOR);
                graphics.fillRect(
                    barX,
                    barY,
                    this.MANA_BAR_WIDTH,
                    barTotalHeight,
                );

                // Draw the fill
                if (manaPercent > 0) {
                    const fillHeight = barTotalHeight * manaPercent;
                    const fillY = barY + (barTotalHeight - fillHeight); // Fill from the bottom up
                    graphics.fillStyle(this.MANA_BAR_FILL_COLOR);
                    graphics.fillRect(
                        barX,
                        fillY,
                        this.MANA_BAR_WIDTH,
                        fillHeight,
                    );
                }
            }
        });

        // --- Update Held Boomerang ---
        this.heldBoomerangDisplay.setVisible(hasBoomerang);
        const boomerangX = playerX + config.PlayerWidth / 2;
        const boomerangY = playerY - this.HELD_BOOMERANG_Y_OFFSET;
        this.heldBoomerangDisplay.update(delta, boomerangX, boomerangY);
    }
}
