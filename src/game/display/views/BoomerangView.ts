import { Entity } from "../../logic/core/ECS";
import { ModifiableStat } from "../../logic/upgrades/mods/ModifiableStat";
import { Values } from "../../logic/upgrades/mods/Values";
import { View, ViewContext } from "../core/View";
import { BoomerangDisplay } from "./BoomerangDisplay";
import { GameObjects } from "phaser";
import { QuickFalling } from "../../logic/boomerang/components/QuickFalling";

export class BoomerangView extends View {
    private boomerangDisplay: BoomerangDisplay;
    private trailEmitter: GameObjects.Particles.ParticleEmitter;

    constructor(context: ViewContext, entity: Entity) {
        super(context, entity);
        this.boomerangDisplay = new BoomerangDisplay(this.context);

        this.trailEmitter = this.context.scene.add.particles(
            0,
            0,
            "circle_32",
            {
                speed: { min: 10, max: 50 },
                angle: { min: 80, max: 100 },
                scale: { start: 0.4, end: 0 },
                blendMode: "ADD",
                lifespan: { min: 200, max: 500 },
                tint: [0xff5500, 0xffa500, 0xffff00],
                frequency: 30,
                follow: this.viewContainer,
            },
        );

        this.context.layers.Ground.add(this.trailEmitter);
        this.trailEmitter.stop();
    }

    public internalUpdate(delta: number): void {
        if (!this.boomerangDisplay) {
            return;
        }

        const isQuickFalling = this.context.ecs.hasComponent(
            this.entity,
            QuickFalling,
        );

        if (isQuickFalling && !this.trailEmitter.emitting) {
            this.trailEmitter.start();
        } else if (!isQuickFalling && this.trailEmitter.emitting) {
            this.trailEmitter.stop();
        }

        const size = Values.get(
            this.context.ecs,
            this.context.ecs.world,
            ModifiableStat.BOOMERANG_SIZE,
        );
        this.boomerangDisplay.update(
            delta,
            this.viewContainer.x,
            this.viewContainer.y,
            size,
        );
    }

    override destroy(): void {
        super.destroy();
        this.trailEmitter.stop();
        this.trailEmitter.destroy();
    }
}
