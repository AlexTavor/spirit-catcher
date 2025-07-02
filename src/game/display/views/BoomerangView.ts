import { Scene } from "phaser";
import { ECS, Entity } from "../../logic/core/ECS";
import { View } from "./View";
import { BoomerangDisplay } from "./BoomerangDisplay";

export class BoomerangView extends View {
    private boomerangDisplay: BoomerangDisplay;

    constructor(scene: Scene, ecs: ECS, entity: Entity) {
        super(scene, ecs, entity);

        this.boomerangDisplay = new BoomerangDisplay(
            this.scene,
            this.viewContainer,
        );
    }

    /**
     * This is called every frame by GameDisplay.
     * We use it here to apply a constant rotation to the view.
     * @param delta Time in milliseconds since the last frame.
     */
    public internalUpdate(delta: number): void {
        if (!this.boomerangDisplay) {
            return; // Ensure boomerang display is initialized
        }

        this.boomerangDisplay.update(delta);
    }

    public destroy(): void {
        this.boomerangDisplay.destroy();
        super.destroy();
    }
}
