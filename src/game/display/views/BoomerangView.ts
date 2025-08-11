import { Entity } from "../../logic/core/ECS";
import { ModifiableStat } from "../../logic/upgrades/ModifiableStat";
import { Values } from "../../logic/upgrades/Values";
import { View, ViewContext } from "../core/View";
import { BoomerangDisplay } from "./BoomerangDisplay";

export class BoomerangView extends View {
    private boomerangDisplay: BoomerangDisplay;

    constructor(context: ViewContext, entity: Entity) {
        super(context, entity);
        this.boomerangDisplay = new BoomerangDisplay(this.context);
    }

    public internalUpdate(delta: number): void {
        if (!this.boomerangDisplay) {
            return;
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
}
