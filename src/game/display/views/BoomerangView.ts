import { Entity } from "../../logic/core/ECS";
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
        this.boomerangDisplay.update(
            delta,
            this.viewContainer.x,
            this.viewContainer.y,
        );
    }
}
