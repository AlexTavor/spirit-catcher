import { GameObjects, Scene } from "phaser";
import { ConfigManager } from "../../api/ConfigManager";
import { ECS, Entity } from "../../logic/core/ECS";
import { HasBoomerang } from "../../logic/player/components/HasBoomerang";
import { IsWalking } from "../../logic/player/components/IsWalking";
import { BoomerangDisplay } from "./BoomerangDisplay";
import { View } from "./View";

export class PlayerView extends View {
    private body: GameObjects.Graphics;
    private heldBoomerangDisplay: BoomerangDisplay;

    private readonly IDLE_COLOR = 0xffa500; // Orange
    private readonly WALKING_COLOR = 0xffde7a; // Lighter Orange

    constructor(scene: Scene, ecs: ECS, entity: Entity) {
        super(scene, ecs, entity);

        // --- Player Body ---
        this.body = this.scene.add.graphics();
        this.viewContainer.add(this.body);

        // --- Held Boomerang ---
        this.heldBoomerangDisplay = new BoomerangDisplay(
            this.scene,
            this.viewContainer,
        );
        this.heldBoomerangDisplay.setPosition(
            ConfigManager.get().PlayerWidth / 2,
            -20,
        );
    }

    public internalUpdate(delta: number): void {
        if (!this.body) {
            return; // Ensure body is initialized
        }

        // --- Update Player Body Color ---
        const isWalking = this.ecs.hasComponent(this.entity, IsWalking);
        const color = isWalking ? this.WALKING_COLOR : this.IDLE_COLOR;
        this.body.clear();
        this.body.fillStyle(color);
        this.body.fillRect(
            0,
            0,
            ConfigManager.get().PlayerWidth,
            ConfigManager.get().PlayerHeight,
        );

        // --- Update Held Boomerang Visibility and Rotation ---
        const hasBoomerang = this.ecs.hasComponent(this.entity, HasBoomerang);
        this.heldBoomerangDisplay.setVisible(hasBoomerang);

        if (hasBoomerang) {
            this.heldBoomerangDisplay.update(delta);
        }
    }

    public destroy(): void {
        this.heldBoomerangDisplay.destroy();
        super.destroy();
    }
}
