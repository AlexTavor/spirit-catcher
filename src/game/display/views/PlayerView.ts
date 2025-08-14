import { Entity } from "../../logic/core/ECS";
import { ModifiableStat } from "../../logic/upgrades/mods/ModifiableStat";
import { Values } from "../../logic/upgrades/mods/Values";
import { View, ViewContext } from "../core/View";
import { BoomerangDisplay } from "./BoomerangDisplay";
import { ConfigManager } from "../../consts/ConfigManager";
import { IsWalking } from "../../logic/player/components/IsWalking";
import { HasBoomerang } from "../../logic/player/components/HasBoomerang";
import { GameObjects } from "phaser";
import { EventBus } from "../../api/EventBus";
import { GameEvents } from "../../consts/GameEvents";

export class PlayerView extends View {
    private heldBoomerangDisplay: BoomerangDisplay;

    private readonly IDLE_COLOR = 0xffa500;
    private readonly WALKING_COLOR = 0xffde7a;
    private readonly HELD_BOOMERANG_Y_OFFSET = 20;

    // sparkle burst (manual, not following the player)
    private sparkleEmitter: GameObjects.Particles.ParticleEmitter;

    constructor(context: ViewContext, entity: Entity) {
        super(context, entity);
        this.heldBoomerangDisplay = new BoomerangDisplay(this.context);

        // manual-burst emitter; gravity makes particles fall back down
        this.sparkleEmitter = this.context.scene.add.particles(
            0,
            0,
            "circle_32",
            {
                speed: { min: 120, max: 320 },
                angle: { min: 220, max: 320 }, // fan up and to the sides (270 is straight up)
                gravityY: 900,
                lifespan: { min: 450, max: 950 },
                scale: { start: 0.45, end: 0 },
                alpha: { start: 1, end: 0 },
                blendMode: "ADD",
                tint: [0xff5500, 0xffa500, 0xffff00], // match boomerang trail palette
            },
        );
        this.context.layers.Foreground.add(this.sparkleEmitter);
        this.sparkleEmitter.stop();

        EventBus.on(
            GameEvents.RANG_QUICK_FALL_CAUGHT,
            this.handleQuickFallCaught,
            this,
        );
    }

    private handleQuickFallCaught(): void {
        const x = this.viewContainer.x;
        const y = this.viewContainer.y;
        this.sparkleEmitter.explode(16, x, y);
    }

    public internalUpdate(delta: number): void {
        if (!this.heldBoomerangDisplay) return;

        const config = ConfigManager.get();
        const playerX = this.viewContainer.x - config.PlayerWidth / 2;
        const playerY = this.viewContainer.y;

        const isWalking = this.context.ecs.hasComponent(this.entity, IsWalking);
        const hasBoomerang = this.context.ecs.hasComponent(
            this.entity,
            HasBoomerang,
        );

        // body
        this.context.dynamicGraphics.draw(playerX, playerY, (g) => {
            g.fillStyle(isWalking ? this.WALKING_COLOR : this.IDLE_COLOR);
            g.fillRect(0, 0, config.PlayerWidth, config.PlayerHeight);
        });

        // held boomerang
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

    override destroy(): void {
        super.destroy();
        EventBus.removeListener(
            GameEvents.RANG_QUICK_FALL_CAUGHT,
            this.handleQuickFallCaught,
            this,
        );
        this.sparkleEmitter.stop();
        this.sparkleEmitter.destroy();
    }
}
